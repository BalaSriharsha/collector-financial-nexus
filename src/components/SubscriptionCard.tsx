
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Gem, Check, Settings, CreditCard } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface SubscriptionCardProps {
  onUpgrade?: () => void;
}

const SubscriptionCard = ({ onUpgrade }: SubscriptionCardProps) => {
  const { subscription, loading, manageSubscription } = useSubscription();
  const navigate = useNavigate();
  const [showManagement, setShowManagement] = useState(false);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading subscription...</div>
        </CardContent>
      </Card>
    );
  }

  const tierIcons = {
    Individual: Gem,
    Premium: Crown,
    Organization: Crown
  };

  const tierColors = {
    Individual: "text-blue-600",
    Premium: "text-orange-600", 
    Organization: "text-purple-600"
  };

  const Icon = tierIcons[subscription?.tier || 'Individual'];

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/pricing');
    }
  };

  const handleCancelSubscription = async () => {
    if (confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
      await manageSubscription();
      setShowManagement(false);
    }
  };

  const handleManageSubscription = () => {
    if (subscription?.tier === 'Individual') {
      navigate('/pricing');
    } else {
      setShowManagement(true);
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={`w-5 h-5 ${tierColors[subscription?.tier || 'Individual']}`} />
              <CardTitle className="text-lg">{subscription?.tier} Plan</CardTitle>
            </div>
            <Badge variant="outline" className={tierColors[subscription?.tier || 'Individual']}>
              {subscription?.tier === 'Individual' ? 'Free' : 'Paid'}
            </Badge>
          </div>
          <CardDescription>
            {subscription?.tier === 'Individual' && 'Basic financial management features with expense sharing'}
            {subscription?.tier === 'Premium' && 'Advanced features for serious users'}
            {subscription?.tier === 'Organization' && 'Complete solution for businesses'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm">Unlimited transactions</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm">Expense sharing & groups</span>
            </div>
            {subscription?.tier !== 'Individual' && (
              <>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Unlimited storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Advanced analytics</span>
                </div>
              </>
            )}
            {subscription?.tier === 'Organization' && (
              <>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Multi-user access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm">API access</span>
                </div>
              </>
            )}
          </div>
          
          <div className="flex gap-2 mt-4">
            {subscription?.tier === 'Individual' ? (
              <Button 
                onClick={handleUpgrade}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-500 hover:border-orange-600"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
            ) : (
              <Button 
                onClick={handleManageSubscription}
                variant="outline"
                className="flex-1"
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Subscription
              </Button>
            )}
          </div>

          {subscription?.subscriptionEnd && (
            <p className="text-xs text-gray-500 mt-2">
              Next billing: {new Date(subscription.subscriptionEnd).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Subscription Management Dialog */}
      <Dialog open={showManagement} onOpenChange={setShowManagement}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Your Subscription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="mb-4">
                <Icon className={`w-12 h-12 mx-auto ${tierColors[subscription?.tier || 'Individual']}`} />
                <h3 className="text-lg font-semibold mt-2">{subscription?.tier} Plan</h3>
                {subscription?.subscriptionEnd && (
                  <p className="text-sm text-gray-600">
                    Active until: {new Date(subscription.subscriptionEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/pricing')}
                variant="outline"
                className="w-full"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
              
              <Button 
                onClick={handleCancelSubscription}
                variant="destructive"
                className="w-full"
              >
                Cancel Subscription
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              For billing inquiries, contact support@vittas.app
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubscriptionCard;
