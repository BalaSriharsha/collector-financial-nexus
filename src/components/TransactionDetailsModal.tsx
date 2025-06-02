
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
      <DialogContent className="max-w-lg border-2 border-collector-gold/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-playfair text-gray-900">
            {transaction.type === 'income' ? 
              <TrendingUp className="w-6 h-6 text-green-600" /> :
              <TrendingDown className="w-6 h-6 text-red-600" />
            }
            Transaction Details
          </DialogTitle>
          <DialogDescription className="text-gray-700">
            Reference: {getTransactionReference(transaction.id)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <Card className="border-2 border-collector-gold/20">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 uppercase tracking-wide">Amount</p>
                <p className={`text-3xl font-playfair font-bold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
                <p className="text-sm text-gray-600 mt-1">{getStatus()}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            <Card className="border border-collector-gold/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-collector-blue" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.title || 'No title provided'}
                    </p>
                    <p className="text-sm text-gray-600">Title</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {transaction.description && (
              <Card className="border border-collector-gold/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-collector-blue mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-600">Description</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border border-collector-gold/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-collector-blue" />
                  <div>
                    <p className="font-medium text-gray-900">{formatDate(transaction.date)}</p>
                    <p className="text-sm text-gray-600">Transaction Date</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-collector-gold/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-collector-blue" />
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{transaction.category}</p>
                    <p className="text-sm text-gray-600">Category</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-collector-gold/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-collector-blue" />
                  <div>
                    <p className="font-medium text-gray-900">{getPaymentMethod(transaction.type)}</p>
                    <p className="text-sm text-gray-600">Payment Method</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-collector-gold/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-collector-blue" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDate(transaction.created_at)}
                    </p>
                    <p className="text-sm text-gray-600">Created At</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {(onEdit || onDelete) && (
            <div className="flex gap-2 pt-4">
              {onEdit && (
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  className="flex-1 border-gray-400 text-gray-800 hover-navy transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Transaction
                </Button>
              )}
              {onDelete && (
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  className="flex-1 border-red-400 text-red-600 hover-black transition-colors"
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
