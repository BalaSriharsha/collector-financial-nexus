
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Edit, Trash2 } from "lucide-react";
import { Budget } from "@/hooks/useDashboardData";

interface BudgetsOverviewProps {
  budgets: Budget[];
  currencySymbol: string;
  onBudgetClick: (budget: Budget) => void;
  onEditBudget: (budgetId: string) => void;
  onDeleteBudget: (budgetId: string) => void;
  onViewAllBudgets: () => void;
  onCreateBudget: () => void;
}

const BudgetsOverview = ({
  budgets,
  currencySymbol,
  onBudgetClick,
  onEditBudget,
  onDeleteBudget,
  onViewAllBudgets,
  onCreateBudget,
}: BudgetsOverviewProps) => {
  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between py-[10px] mx-[10px]">
        <CardTitle className="text-lg sm:text-xl text-slate-800 dark:text-slate-100">
          Budget Overview
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onViewAllBudgets}
          className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:bg-slate-800"
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {budgets.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {budgets.slice(0, 4).map((budget) => (
              <div
                key={budget.id}
                className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer dark:border-slate-700 dark:hover:bg-slate-700"
                onClick={() => onBudgetClick(budget)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 dark:text-slate-100 text-sm mb-1 truncate">
                    {budget.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-slate-400 truncate">
                    {budget.category} • {budget.period}
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 ml-2">
                  <div className="text-right">
                    <div className="font-bold text-sm text-orange-600">
                      {currencySymbol}
                      {Number(budget.amount).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditBudget(budget.id);
                      }}
                      className="h-6 w-6 sm:h-7 sm:w-7 p-0 border-gray-300 text-gray-700 hover:bg-gray-50 bg-white dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:bg-slate-800"
                    >
                      <Edit className="w-3 h-3 text-gray-700 dark:text-slate-300" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBudget(budget.id);
                      }}
                      className="h-6 w-6 sm:h-7 sm:w-7 p-0 border-red-300 text-red-600 hover:bg-red-50 bg-white dark:border-red-500 dark:text-red-400 dark:hover:bg-red-900/20 dark:bg-slate-800"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 text-gray-600 dark:text-slate-400">
            <Target className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm mb-4">No budgets created</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateBudget}
              className="border-gray-300 hover:bg-gray-50 bg-white dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:bg-slate-800"
            >
              <span className="text-gray-700 dark:text-slate-300">Create Budget</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetsOverview;
