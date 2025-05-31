
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Users } from "lucide-react";

interface MetricDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metricType: string | null;
  userType: 'individual' | 'organization';
  period: string;
}

const MetricDetailsModal = ({ open, onOpenChange, metricType, userType, period }: MetricDetailsModalProps) => {
  if (!metricType) return null;

  const getMetricDetails = () => {
    const periodLabel = period.charAt(0).toUpperCase() + period.slice(1);
    
    if (userType === 'individual') {
      switch (metricType) {
        case 'income':
          return {
            title: 'Income Details',
            icon: <TrendingUp className="w-6 h-6 text-green-600" />,
            total: '$5,200',
            breakdown: [
              { source: 'Primary Job', amount: '$4,000', percentage: '77%' },
              { source: 'Freelance Work', amount: '$800', percentage: '15%' },
              { source: 'Investments', amount: '$300', percentage: '6%' },
              { source: 'Other', amount: '$100', percentage: '2%' }
            ]
          };
        case 'expenses':
          return {
            title: 'Expenses Details',
            icon: <TrendingDown className="w-6 h-6 text-red-600" />,
            total: '$3,800',
            breakdown: [
              { source: 'Housing', amount: '$1,500', percentage: '39%' },
              { source: 'Food & Dining', amount: '$600', percentage: '16%' },
              { source: 'Transportation', amount: '$400', percentage: '11%' },
              { source: 'Utilities', amount: '$300', percentage: '8%' },
              { source: 'Entertainment', amount: '$200', percentage: '5%' },
              { source: 'Other', amount: '$800', percentage: '21%' }
            ]
          };
        case 'savings':
          return {
            title: 'Savings Details',
            icon: <DollarSign className="w-6 h-6 text-green-600" />,
            total: '$1,400',
            breakdown: [
              { source: 'Emergency Fund', amount: '$800', percentage: '57%' },
              { source: 'Investment Account', amount: '$400', percentage: '29%' },
              { source: 'Vacation Fund', amount: '$150', percentage: '11%' },
              { source: 'Other Goals', amount: '$50', percentage: '3%' }
            ]
          };
        case 'budget':
          return {
            title: 'Budget Usage',
            icon: <PieChart className="w-6 h-6 text-blue-600" />,
            total: '75% Used',
            breakdown: [
              { source: 'Housing', amount: '$1,500 / $1,600', percentage: '94%' },
              { source: 'Food', amount: '$600 / $700', percentage: '86%' },
              { source: 'Transportation', amount: '$400 / $500', percentage: '80%' },
              { source: 'Entertainment', amount: '$200 / $300', percentage: '67%' },
              { source: 'Utilities', amount: '$300 / $350', percentage: '86%' }
            ]
          };
        default:
          return null;
      }
    } else {
      switch (metricType) {
        case 'revenue':
          return {
            title: 'Revenue Details',
            icon: <TrendingUp className="w-6 h-6 text-green-600" />,
            total: '$125,000',
            breakdown: [
              { source: 'Product Sales', amount: '$80,000', percentage: '64%' },
              { source: 'Service Revenue', amount: '$30,000', percentage: '24%' },
              { source: 'Consulting', amount: '$10,000', percentage: '8%' },
              { source: 'Other', amount: '$5,000', percentage: '4%' }
            ]
          };
        case 'expenses':
          return {
            title: 'Expenses Details',
            icon: <TrendingDown className="w-6 h-6 text-red-600" />,
            total: '$89,000',
            breakdown: [
              { source: 'Salaries & Benefits', amount: '$45,000', percentage: '51%' },
              { source: 'Office Rent', amount: '$15,000', percentage: '17%' },
              { source: 'Marketing', amount: '$12,000', percentage: '13%' },
              { source: 'Technology', amount: '$8,000', percentage: '9%' },
              { source: 'Utilities', amount: '$4,000', percentage: '4%' },
              { source: 'Other', amount: '$5,000', percentage: '6%' }
            ]
          };
        case 'profit':
          return {
            title: 'Profit Details',
            icon: <DollarSign className="w-6 h-6 text-green-600" />,
            total: '$36,000',
            breakdown: [
              { source: 'Gross Profit', amount: '$125,000', percentage: '100%' },
              { source: 'Operating Expenses', amount: '-$89,000', percentage: '-71%' },
              { source: 'Net Profit', amount: '$36,000', percentage: '29%' },
              { source: 'Profit Margin', amount: '28.8%', percentage: 'margin' }
            ]
          };
        case 'payroll':
          return {
            title: 'Payroll Details',
            icon: <Users className="w-6 h-6 text-blue-600" />,
            total: '$45,000',
            breakdown: [
              { source: 'Base Salaries', amount: '$38,000', percentage: '84%' },
              { source: 'Benefits', amount: '$4,500', percentage: '10%' },
              { source: 'Bonuses', amount: '$2,000', percentage: '4%' },
              { source: 'Payroll Taxes', amount: '$500', percentage: '2%' }
            ]
          };
        default:
          return null;
      }
    }
  };

  const details = getMetricDetails();
  if (!details) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto border-2 border-collector-gold/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-playfair">
            {details.icon}
            {details.title}
          </DialogTitle>
          <DialogDescription>
            Detailed breakdown for this {period} period
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <Card className="border-2 border-collector-gold/20">
            <CardHeader>
              <CardTitle className="text-lg">Total: {details.total}</CardTitle>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-collector-black">Breakdown</h3>
            {details.breakdown.map((item, index) => (
              <Card key={index} className="border border-collector-gold/20">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-collector-black">{item.source}</p>
                      <p className="text-sm text-collector-black/60">{item.percentage}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-collector-black">{item.amount}</p>
                    </div>
                  </div>
                  {metricType === 'budget' && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-gradient h-2 rounded-full"
                        style={{ width: item.percentage }}
                      ></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MetricDetailsModal;
