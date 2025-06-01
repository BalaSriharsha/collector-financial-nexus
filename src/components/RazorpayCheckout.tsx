import { useState } from 'react';
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

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayCheckout = ({ planType, onSuccess }: RazorpayCheckoutProps) => {
  const { user } = useAuth();
  const { refreshSubscription } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [showUPI, setShowUPI] = useState(false);
  const [qrData, setQrData] = useState<any>(null);

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
        handler: async function (response: any) {
          console.log('Payment successful:', response);
          toast.success('Payment successful! Processing your subscription...');
          
          // Wait for webhook processing with multiple checks
          let attempts = 0;
          const maxAttempts = 10;
          
          const checkSubscriptionStatus = async () => {
            console.log(`Checking subscription status - attempt ${attempts + 1}`);
            
            // Check if subscription has been updated
            const { data: profileData } = await supabase
              .from('profiles')
              .select('subscription_tier')
              .eq('id', user.id)
              .single();
              
            if (profileData?.subscription_tier === planType) {
              console.log('Subscription updated successfully in database');
              await refreshSubscription();
              onSuccess?.();
              toast.success('Your subscription has been activated!');
              return true;
            }
            
            return false;
          };
          
          // Check immediately
          if (await checkSubscriptionStatus()) return;
          
          // If not updated, keep checking every 2 seconds
          const intervalId = setInterval(async () => {
            attempts++;
            
            if (await checkSubscriptionStatus()) {
              clearInterval(intervalId);
              return;
            }
            
            if (attempts >= maxAttempts) {
              clearInterval(intervalId);
              console.log('Timeout waiting for subscription update');
              toast.warning('Payment processed, but subscription update is taking longer than expected. Please refresh the page.');
              await refreshSubscription();
              onSuccess?.();
            }
          }, 2000);
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal closed');
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast.error(error.message || 'Failed to create checkout session');
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
    } catch (error: any) {
      console.error('Error generating UPI QR:', error);
      toast.error(error.message || 'Failed to generate UPI QR code');
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
              className="w-full bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Open in UPI App
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
          className="w-full bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500"
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
