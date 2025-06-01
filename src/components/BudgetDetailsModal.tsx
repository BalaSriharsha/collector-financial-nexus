
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, Calendar, Target, DollarSign } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { getCurrencySymbol } from "@/utils/currency";

interface Budget {
  id: string;
  name: string;
  amount: number;
  category: string;
  period: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

interface BudgetDetailsModalProps {
  budget: Budget | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (budgetId: string) => void;
  onDelete: (budgetId: string) => void;
}

const BudgetDetailsModal = ({ budget, open, onOpenChange, onEdit, onDelete }: BudgetDetailsModalProps) => {
  const { profile } = useProfile();
  const currencySymbol = getCurrencySymbol(profile?.currency || 'USD');

  if (!budget) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-playfair text-2xl text-collector-black flex items-center gap-2">
            <Target className="w-6 h-6 text-orange-600" />
            Budget Details
          </DialogTitle>
          <DialogDescription>
            Complete information about this budget
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Budget Header */}
          <Card className="border-collector-gold/20">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{budget.name}</h3>
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    {budget.category}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {currencySymbol}{Number(budget.amount).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">{budget.period}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-xs text-gray-600">Start Date</div>
                    <div className="font-medium">{new Date(budget.start_date).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="text-xs text-gray-600">End Date</div>
                    <div className="font-medium">{new Date(budget.end_date).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-xs text-gray-600">Budget Amount</div>
                    <div className="font-medium">{currencySymbol}{Number(budget.amount).toFixed(2)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Target className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-xs text-gray-600">Period</div>
                    <div className="font-medium capitalize">{budget.period}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Created: {new Date(budget.created_at).toLocaleString()}</div>
                  {budget.updated_at !== budget.created_at && (
                    <div>Last updated: {new Date(budget.updated_at).toLocaleString()}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => onEdit(budget.id)}
              className="flex items-center gap-2 hover:bg-navy-500 hover:text-orange-500 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Budget
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(budget.id)}
              className="flex items-center gap-2 hover:bg-black hover:text-white transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Budget
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetDetailsModal;
