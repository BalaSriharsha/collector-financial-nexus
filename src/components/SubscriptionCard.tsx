
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Gem, Check, Settings } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";

interface SubscriptionCardProps {
  onUpgrade?: () => void;
}

const SubscriptionCard = ({ onUpgrade }: SubscriptionCardProps) => {
  const { subscription, loading, manageSubscription } = useSubscription();
  const navigate = useNavigate();

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

  return (
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
          {subscription?.tier === 'Individual' && 'Basic financial management features'}
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
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Expense sharing</span>
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
              className="flex-1 bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white"
            >
              Upgrade Plan
            </Button>
          ) : (
            <Button 
              onClick={manageSubscription}
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
  );
};

export default SubscriptionCard;
