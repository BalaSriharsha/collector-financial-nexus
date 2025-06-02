
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Users, PieChart, Calendar } from "lucide-react";

interface Metrics {
  income?: number;
  expenses?: number;
  savings?: number;
  budget?: { used: number; total: number };
  revenue?: number;
  profit?: number;
  payroll?: { amount: number; employees: number };
}

interface MetricDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metricType: string | null;
  userType: 'individual' | 'organization';
  period: 'day' | 'week' | 'month' | 'year';
  metrics: Metrics;
}

const MetricDetailsModal = ({ open, onOpenChange, metricType, userType, period, metrics }: MetricDetailsModalProps) => {
  if (!metricType) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPeriodLabel = () => {
    switch(period) {
      case 'day': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'This Month';
    }
  };

  const getMetricData = () => {
    switch(metricType) {
      case 'income':
        return {
          title: 'Income Details',
          icon: <TrendingUp className="w-6 h-6 text-green-600" />,
          amount: metrics.income || 0,
          description: `Total income for ${getPeriodLabel().toLowerCase()}`,
          color: 'text-green-600'
        };
      case 'expenses':
        return {
          title: 'Expenses Details',
          icon: <TrendingDown className="w-6 h-6 text-red-600" />,
          amount: metrics.expenses || 0,
          description: `Total expenses for ${getPeriodLabel().toLowerCase()}`,
          color: 'text-red-600'
        };
      case 'savings':
        return {
          title: 'Savings Details',
          icon: <DollarSign className="w-6 h-6 text-collector-gold" />,
          amount: metrics.savings || 0,
          description: `Net savings for ${getPeriodLabel().toLowerCase()}`,
          color: metrics.savings && metrics.savings >= 0 ? 'text-green-600' : 'text-red-600'
        };
      case 'revenue':
        return {
          title: 'Revenue Details',
          icon: <TrendingUp className="w-6 h-6 text-green-600" />,
          amount: metrics.revenue || 0,
          description: `Total revenue for ${getPeriodLabel().toLowerCase()}`,
          color: 'text-green-600'
        };
      case 'profit':
        return {
          title: 'Profit Details',
          icon: <DollarSign className="w-6 h-6 text-collector-gold" />,
          amount: metrics.profit || 0,
          description: `Net profit for ${getPeriodLabel().toLowerCase()}`,
          color: metrics.profit && metrics.profit >= 0 ? 'text-green-600' : 'text-red-600'
        };
      case 'payroll':
        return {
          title: 'Payroll Details',
          icon: <Users className="w-6 h-6 text-collector-blue" />,
          amount: metrics.payroll?.amount || 0,
          description: `Payroll expenses for ${getPeriodLabel().toLowerCase()}`,
          color: 'text-collector-blue',
          employees: metrics.payroll?.employees || 0
        };
      case 'budget':
        return {
          title: 'Budget Details',
          icon: <PieChart className="w-6 h-6 text-collector-blue" />,
          amount: metrics.budget?.total || 0,
          description: `Budget overview for ${getPeriodLabel().toLowerCase()}`,
          color: 'text-collector-blue',
          used: metrics.budget?.used || 0
        };
      default:
        return {
          title: 'Metric Details',
          icon: <DollarSign className="w-6 h-6 text-collector-blue" />,
          amount: 0,
          description: 'No data available',
          color: 'text-collector-blue'
        };
    }
  };

  const metricData = getMetricData();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-2 border-collector-gold/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-playfair">
            {metricData.icon}
            {metricData.title}
          </DialogTitle>
          <DialogDescription>
            {getPeriodLabel()} • {userType === 'individual' ? 'Personal' : 'Organization'} Account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <Card className="border-2 border-collector-gold/20">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-collector-black/60 uppercase tracking-wide mb-2">
                  {metricType === 'budget' ? 'Total Budget' : 'Amount'}
                </p>
                <p className={`text-4xl font-playfair font-bold ${metricData.color}`}>
                  {metricType === 'budget' && metricData.used !== undefined ? 
                    `${metricData.used}%` : 
                    formatCurrency(metricData.amount)
                  }
                </p>
                <p className="text-sm text-collector-black/60 mt-2">
                  {metricData.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {metricType === 'budget' && (
            <Card className="border border-collector-gold/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Budget Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Used Amount:</span>
                    <span className="font-medium">
                      {formatCurrency((metricData.amount * (metricData.used || 0)) / 100)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Remaining:</span>
                    <span className="font-medium">
                      {formatCurrency(metricData.amount - ((metricData.amount * (metricData.used || 0)) / 100))}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                    <div 
                      className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(metricData.used || 0, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {metricType === 'payroll' && metricData.employees !== undefined && (
            <Card className="border border-collector-gold/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-collector-black/60">Employees:</span>
                  <span className="font-medium">{metricData.employees} people</span>
                </div>
                {metricData.employees > 0 && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-collector-black/60">Average per employee:</span>
                    <span className="font-medium">
                      {formatCurrency(metricData.amount / metricData.employees)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(metricType === 'savings' || metricType === 'profit') && (
            <Card className="border border-collector-gold/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-collector-black/60 mb-2">
                    {metricType === 'savings' ? 'Savings Rate' : 'Profit Margin'}
                  </p>
                  <p className="text-lg font-semibold">
                    {metricType === 'savings' ? 
                      (metrics.income ? ((metrics.savings || 0) / metrics.income * 100).toFixed(1) : '0.0') :
                      (metrics.revenue ? ((metrics.profit || 0) / metrics.revenue * 100).toFixed(1) : '0.0')
                    }%
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border border-collector-gold/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-collector-blue" />
                <div>
                  <p className="font-medium text-collector-black">{getPeriodLabel()}</p>
                  <p className="text-sm text-collector-black/60">Reporting Period</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MetricDetailsModal;
