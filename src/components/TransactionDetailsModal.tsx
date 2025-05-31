
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Calendar, Tag, FileText, MapPin } from "lucide-react";

interface TransactionDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: any;
}

const TransactionDetailsModal = ({ open, onOpenChange, transaction }: TransactionDetailsModalProps) => {
  if (!transaction) return null;

  const getTransactionDetails = () => {
    // Mock additional details for the transaction
    return {
      ...transaction,
      reference: `TXN-${transaction.id.toString().padStart(6, '0')}`,
      method: transaction.type === 'income' ? 'Bank Transfer' : 'Debit Card',
      location: transaction.type === 'income' ? 'Direct Deposit' : 'Local Store',
      notes: transaction.type === 'income' 
        ? 'Monthly salary payment from employer' 
        : 'Weekly grocery shopping for household items',
      tags: transaction.type === 'income' ? ['salary', 'primary-income'] : ['groceries', 'essential', 'food'],
      status: 'Completed',
      balance: transaction.type === 'income' ? '+$2,500.00' : '-$450.00'
    };
  };

  const details = getTransactionDetails();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-2 border-collector-gold/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-playfair">
            {details.type === 'income' ? 
              <TrendingUp className="w-6 h-6 text-green-600" /> :
              <TrendingDown className="w-6 h-6 text-red-600" />
            }
            Transaction Details
          </DialogTitle>
          <DialogDescription>
            Reference: {details.reference}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <Card className="border-2 border-collector-gold/20">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-collector-black/60 uppercase tracking-wide">Amount</p>
                <p className={`text-3xl font-playfair font-bold ${
                  details.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {details.type === 'income' ? '+' : '-'}${details.amount.toLocaleString()}
                </p>
                <p className="text-sm text-collector-black/60 mt-1">{details.status}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            <Card className="border border-collector-gold/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-collector-blue" />
                  <div>
                    <p className="font-medium text-collector-black">{details.description}</p>
                    <p className="text-sm text-collector-black/60">Description</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-collector-gold/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-collector-blue" />
                  <div>
                    <p className="font-medium text-collector-black">{details.date}</p>
                    <p className="text-sm text-collector-black/60">Transaction Date</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-collector-gold/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-collector-blue" />
                  <div>
                    <p className="font-medium text-collector-black">{details.category}</p>
                    <p className="text-sm text-collector-black/60">Category</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-collector-gold/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-collector-blue" />
                  <div>
                    <p className="font-medium text-collector-black">{details.location}</p>
                    <p className="text-sm text-collector-black/60">Location</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-collector-gold/20">
            <CardContent className="p-4">
              <h4 className="font-medium text-collector-black mb-2">Payment Method</h4>
              <p className="text-sm text-collector-black/70">{details.method}</p>
            </CardContent>
          </Card>

          <Card className="border border-collector-gold/20">
            <CardContent className="p-4">
              <h4 className="font-medium text-collector-black mb-2">Notes</h4>
              <p className="text-sm text-collector-black/70">{details.notes}</p>
            </CardContent>
          </Card>

          <Card className="border border-collector-gold/20">
            <CardContent className="p-4">
              <h4 className="font-medium text-collector-black mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {details.tags.map((tag: string, index: number) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-collector-blue/10 text-collector-blue text-xs rounded-full border border-collector-blue/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailsModal;
