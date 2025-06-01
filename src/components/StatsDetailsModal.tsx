
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description?: string;
}

interface StatsDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'income' | 'expenses' | 'balance' | 'transactions';
  title: string;
  amount: number;
  transactions: Transaction[];
}

const StatsDetailsModal: React.FC<StatsDetailsModalProps> = ({
  open,
  onOpenChange,
  type,
  title,
  amount,
  transactions
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (type === 'income') return transaction.type === 'income';
    if (type === 'expenses') return transaction.type === 'expense';
    return true; // For balance and transactions, show all
  });

  const getTypeColor = (transactionType: string) => {
    return transactionType === 'income' ? 'text-green-600' : 'text-red-600';
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      food: 'bg-orange-100 text-orange-800',
      transport: 'bg-blue-100 text-blue-800',
      entertainment: 'bg-purple-100 text-purple-800',
      utilities: 'bg-gray-100 text-gray-800',
      healthcare: 'bg-red-100 text-red-800',
      shopping: 'bg-pink-100 text-pink-800',
      education: 'bg-green-100 text-green-800',
      investment: 'bg-indigo-100 text-indigo-800',
      salary: 'bg-emerald-100 text-emerald-800',
      freelance: 'bg-teal-100 text-teal-800',
      business: 'bg-yellow-100 text-yellow-800',
      other: 'bg-slate-100 text-slate-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{title} Details</DialogTitle>
          <DialogDescription>
            Total amount: <span className="font-semibold">{formatCurrency(amount)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Showing {filteredTransactions.length} transactions
          </div>

          <Separator />

          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found for {type}
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{transaction.title}</h4>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getCategoryBadgeColor(transaction.category)}`}
                      >
                        {transaction.category}
                      </Badge>
                    </div>
                    {transaction.description && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {transaction.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getTypeColor(transaction.type)}`}>
                      {transaction.type === 'expense' ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatsDetailsModal;
