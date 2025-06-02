
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Calendar, Tag, FileText, CreditCard, Edit, Trash2 } from "lucide-react";

interface Transaction {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  created_at: string;
}

interface TransactionDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  onEdit?: (transactionId: string) => void;
  onDelete?: (transactionId: string) => Promise<void>;
}

const TransactionDetailsModal = ({ open, onOpenChange, transaction, onEdit, onDelete }: TransactionDetailsModalProps) => {
  if (!transaction) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTransactionReference = (id: string) => {
    return `TXN-${id.substring(0, 8).toUpperCase()}`;
  };

  const getPaymentMethod = (type: 'income' | 'expense') => {
    return type === 'income' ? 'Bank Transfer' : 'Debit Card';
  };

  const getStatus = () => {
    return 'Completed';
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(transaction.id);
      onOpenChange(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete && confirm('Are you sure you want to delete this transaction?')) {
      await onDelete(transaction.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg mx-auto bg-white text-slate-900 border-2 border-slate-300 max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg sm:text-xl font-playfair text-slate-800 dark:text-slate-100">
            {transaction.type === 'income' ? 
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" /> :
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            }
            Transaction Details
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400 text-sm">
            Reference: {getTransactionReference(transaction.id)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
          <Card className="border-2 border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide">Amount</p>
                <p className={`text-xl sm:text-2xl lg:text-3xl font-playfair font-bold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">{getStatus()}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <Card className="border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 dark:text-slate-100 text-sm sm:text-base break-words">
                      {transaction.title || 'No title provided'}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Title</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {transaction.description && (
              <Card className="border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 dark:text-slate-100 text-sm sm:text-base break-words">{transaction.description}</p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Description</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 dark:text-slate-100 text-sm sm:text-base">{formatDate(transaction.date)}</p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Transaction Date</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 dark:text-slate-100 capitalize text-sm sm:text-base">{transaction.category}</p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Category</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 dark:text-slate-100 text-sm sm:text-base">{getPaymentMethod(transaction.type)}</p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Payment Method</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                      {formatDate(transaction.created_at)}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Created At</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {(onEdit || onDelete) && (
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              {onEdit && (
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  className="flex-1 border-slate-400 text-slate-800 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-slate-100 transition-colors text-sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Transaction
                </Button>
              )}
              {onDelete && (
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  className="flex-1 border-red-400 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Transaction
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailsModal;
