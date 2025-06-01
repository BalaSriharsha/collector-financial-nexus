
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, FileText, Calendar } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { getCurrencySymbol } from "@/utils/currency";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description?: string;
  created_at: string;
}

interface StatsDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'income' | 'expense' | 'balance' | 'transactions';
  value: number;
  transactions: Transaction[];
}

const StatsDetailsModal = ({ open, onOpenChange, type, value, transactions }: StatsDetailsModalProps) => {
  const { profile } = useProfile();
  const currencySymbol = getCurrencySymbol(profile?.currency || 'USD');

  const getIcon = () => {
    switch (type) {
      case 'income':
        return <TrendingUp className="w-6 h-6 text-green-600" />;
      case 'expense':
        return <TrendingDown className="w-6 h-6 text-red-600" />;
      case 'balance':
        return <DollarSign className="w-6 h-6 text-blue-600" />;
      case 'transactions':
        return <FileText className="w-6 h-6 text-orange-600" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'income':
        return 'Total Income Details';
      case 'expense':
        return 'Total Expenses Details';
      case 'balance':
        return 'Balance Details';
      case 'transactions':
        return 'All Transactions';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'income':
        return 'text-green-600';
      case 'expense':
        return 'text-red-600';
      case 'balance':
        return value >= 0 ? 'text-green-600' : 'text-red-600';
      case 'transactions':
        return 'text-orange-600';
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (type === 'income') return t.type === 'income';
    if (type === 'expense') return t.type === 'expense';
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-playfair">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
          <DialogDescription>
            Detailed breakdown and transaction history
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="border-2 border-collector-gold/20">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-collector-black/60 uppercase tracking-wide mb-2">
                  {type === 'transactions' ? 'Total Count' : 'Total Amount'}
                </p>
                <p className={`text-4xl font-playfair font-bold ${getColor()}`}>
                  {type === 'transactions' ? value : `${currencySymbol}${value.toLocaleString()}`}
                </p>
                {type !== 'transactions' && (
                  <p className="text-sm text-collector-black/60 mt-2">
                    Based on {filteredTransactions.length} transactions
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {type === 'transactions' ? 'All Transactions' : `${type === 'income' ? 'Income' : 'Expense'} Transactions`}
              </h3>
              
              {filteredTransactions.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 mb-1 truncate">{transaction.title}</div>
                        <div className="text-sm text-gray-600 truncate">{transaction.category}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {transaction.date}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{currencySymbol}{Number(transaction.amount).toLocaleString()}
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {transaction.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatsDetailsModal;
