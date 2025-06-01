
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Gem, Check } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

interface SubscriptionCardProps {
  onUpgrade?: () => void;
}

const SubscriptionCard = ({ onUpgrade }: SubscriptionCardProps) => {
  const { subscription, loading } = useSubscription();

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
        
        {subscription?.tier === 'Individual' && onUpgrade && (
          <Button 
            onClick={onUpgrade}
            className="w-full mt-4 bg-orange-gradient hover:bg-orange-600 text-white"
          >
            Upgrade Plan
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;
