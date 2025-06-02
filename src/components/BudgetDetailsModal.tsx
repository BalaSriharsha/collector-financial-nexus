
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
      <DialogContent className="max-w-2xl bg-white text-slate-900 border-2 border-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="font-playfair text-2xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            Budget Details
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Complete information about this budget
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Budget Header */}
          <Card className="border-2 border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{budget.name}</h3>
                  <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700">
                    {budget.category}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                    {currencySymbol}{Number(budget.amount).toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 capitalize">{budget.period}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Start Date</div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{new Date(budget.start_date).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <Calendar className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">End Date</div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{new Date(budget.end_date).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Budget Amount</div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{currencySymbol}{Number(budget.amount).toFixed(2)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Period</div>
                    <div className="font-medium text-slate-900 dark:text-slate-100 capitalize">{budget.period}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
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
              className="flex items-center gap-2 border-slate-400 text-slate-800 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-slate-100 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Budget
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(budget.id)}
              className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 border-2 border-red-600 hover:border-red-700 dark:bg-red-500 dark:hover:bg-red-600 dark:border-red-500 dark:hover:border-red-600 transition-colors"
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
