
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, CreditCard, Smartphone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RazorpayCheckoutProps {
  planType: 'Premium' | 'Organization';
  onSuccess?: () => void;
}

interface QrCodeData {
  qrCodeUrl: string;
  upiId: string;
  amount: string;
  upiUrl: string;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    email: string;
    name: string;
  };
  theme: {
    color: string;
  };
  method: {
    netbanking: boolean;
    card: boolean;
    upi: boolean;
    wallet: boolean;
  };
  handler: (response: RazorpayResponse) => void;
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}

const RazorpayCheckout = ({ planType, onSuccess }: RazorpayCheckoutProps) => {
  const { user } = useAuth();
  const { refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showUPI, setShowUPI] = useState(false);
  const [qrData, setQrData] = useState<QrCodeData | null>(null);

  const planDetails = {
    Premium: {
      price: '₹749',
      description: 'Advanced features for serious users',
      trial: '7-day free trial included'
    },
    Organization: {
      price: '₹2,249',
      description: 'Complete solution for businesses',
      trial: 'No trial period'
    }
  };

  const handleRazorpayPayment = async () => {
    if (!user) {
      toast.error('Please log in to continue');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Creating Razorpay order for plan:', planType);
      
      // Create Razorpay order
      const { data, error } = await supabase.functions.invoke('razorpay-checkout', {
        body: { planType }
      });

      if (error) throw error;

      console.log('Razorpay order created:', data);

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Vittas',
        description: data.planName,
        order_id: data.orderId,
        prefill: {
          email: user.email,
          name: user.user_metadata?.full_name || '',
        },
        theme: {
          color: '#f97316'
        },
        method: {
          netbanking: true,
          card: true,
          upi: true,
          wallet: true,
        },
        handler: async function (response: RazorpayResponse) {
          console.log('Payment successful:', response);
          toast.success('Payment successful! Processing your subscription...');
          
          // Manual subscription update as fallback using Supabase function
          const manualSubscriptionUpdate = async () => {
            try {
              console.log('Attempting manual subscription update via Supabase function...');
              
              const { data, error } = await supabase.functions.invoke('manual-subscription-update', {
                body: {
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  signature: response.razorpay_signature,
                  planType: planType
                }
              });
              
              if (error) {
                console.error('Manual subscription update function failed:', error);
                throw error;
              }
              
              if (!data?.success) {
                console.error('Manual subscription update returned failure:', data);
                throw new Error(data?.error || 'Unknown error in subscription update');
              }
              
              console.log('Manual subscription update successful:', data);
              await refreshSubscription();
              onSuccess?.();
              toast.success('Your subscription has been activated!');
              
              // Redirect to profile page after successful subscription
              setTimeout(() => {
                navigate('/profile');
              }, 2000);
              
              return true;
              
            } catch (error) {
              console.error('Manual subscription update failed:', error);
              toast.error('Payment successful but subscription update failed. Please contact support with payment ID: ' + response.razorpay_payment_id);
              
              // Redirect to profile page even on failure so user can see their status
              setTimeout(() => {
                navigate('/profile');
              }, 3000);
              
              return false;
            }
          };
          
          // Wait longer for webhook processing and be more thorough
          let attempts = 0;
          const maxAttempts = 8; // Reduced attempts since we have manual fallback
          
          const checkSubscriptionStatus = async () => {
            attempts++;
            console.log(`Checking subscription status - attempt ${attempts}`);
            
            try {
              // Check profiles table first
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('subscription_tier, updated_at')
                .eq('id', user.id)
                .single();
                
              if (profileError) {
                console.error('Error checking profile:', profileError);
                return false;
              }
              
              console.log('Current profile data:', profileData);
              
              if (profileData?.subscription_tier === planType) {
                console.log('Subscription updated successfully in profiles table!');
                await refreshSubscription();
                onSuccess?.();
                toast.success('Your subscription has been activated!');
                
                // Redirect to profile page after successful subscription
                setTimeout(() => {
                  navigate('/profile');
                }, 2000);
                
                return true;
              }
              
              // Also check subscribers table for additional confirmation
              const { data: subscriberData } = await supabase
                .from('subscribers')
                .select('subscribed, subscription_tier, subscription_end')
                .eq('user_id', user.id)
                .single();
                
              console.log('Current subscriber data:', subscriberData);
              
              return false;
            } catch (error) {
              console.error('Error checking subscription status:', error);
              return false;
            }
          };
          
          // Check immediately first
          if (await checkSubscriptionStatus()) return;
          
          // Then check every 3 seconds with timeout
          const intervalId = setInterval(async () => {
            if (await checkSubscriptionStatus()) {
              clearInterval(intervalId);
              return;
            }
            
            if (attempts >= maxAttempts) {
              clearInterval(intervalId);
              console.log('Timeout waiting for webhook, attempting manual update...');
              
              // Try manual subscription update as fallback
              await manualSubscriptionUpdate();
            }
          }, 2500); // Check every 2.5 seconds
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal closed by user');
            setLoading(false);
            // Redirect to profile page if user cancels
            navigate('/profile');
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
      console.error('Error creating checkout:', error);
      toast.error(errorMessage);
      
      // Redirect to profile page on error
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleUPIQR = async () => {
    if (!user) {
      toast.error('Please log in to continue');
      return;
    }

    setLoading(true);
    
    try {
      // First create the order
      const { data: orderData, error: orderError } = await supabase.functions.invoke('razorpay-checkout', {
        body: { planType }
      });

      if (orderError) throw orderError;

      // Then generate UPI QR code
      const { data: qrResponse, error: qrError } = await supabase.functions.invoke('generate-upi-qr', {
        body: { 
          amount: orderData.amount, 
          planType: planType,
          orderId: orderData.orderId 
        }
      });

      if (qrError) throw qrError;

      setQrData(qrResponse);
      setShowUPI(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate UPI QR code';
      console.error('Error generating UPI QR:', error);
      toast.error(errorMessage);
      
      // Redirect to profile page on error
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  if (showUPI && qrData) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <QrCode className="w-5 h-5" />
            UPI Payment
          </CardTitle>
          <CardDescription>
            Scan the QR code with any UPI app or use the UPI ID
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <img 
              src={qrData.qrCodeUrl} 
              alt="UPI QR Code" 
              className="mx-auto mb-4 border rounded-lg"
            />
            <div className="space-y-2">
              <p className="text-sm font-medium">UPI ID: {qrData.upiId}</p>
              <p className="text-sm">Amount: ₹{qrData.amount}</p>
              <Badge variant="outline" className="text-xs">
                Manual verification required after payment
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <Button 
              onClick={() => setShowUPI(false)}
              variant="outline"
              className="w-full"
            >
              Back to Payment Options
            </Button>
            <Button 
              onClick={() => window.open(qrData.upiUrl, '_blank')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-500 hover:border-orange-600"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Open in UPI App
            </Button>
            <Button 
              onClick={() => navigate('/profile')}
              variant="outline"
              className="w-full"
            >
              Go to Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>{planType} Plan</CardTitle>
        <div className="text-2xl font-bold text-orange-600">
          {planDetails[planType].price}/month
        </div>
        {planType === 'Premium' && (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            {planDetails[planType].trial}
          </Badge>
        )}
        <CardDescription>
          {planDetails[planType].description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={handleRazorpayPayment}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-500 hover:border-orange-600"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {loading ? 'Processing...' : 'Pay with Card/Net Banking'}
        </Button>
        
        <Button 
          onClick={handleUPIQR}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          <QrCode className="w-4 h-4 mr-2" />
          Pay with UPI QR Code
        </Button>
        
        <div className="text-center text-xs text-gray-500 mt-4">
          Secure payments powered by Razorpay
        </div>
      </CardContent>
    </Card>
  );
};

export default RazorpayCheckout;
