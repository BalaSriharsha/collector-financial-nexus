
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Edit, Trash2 } from "lucide-react";
import { Transaction } from "@/hooks/useDashboardData";

interface RecentTransactionsProps {
  transactions: Transaction[];
  currencySymbol: string;
  onTransactionClick: (transaction: Transaction) => void;
  onEditTransaction: (transactionId: string) => void;
  onDeleteTransaction: (transactionId: string) => void;
  onViewAllTransactions: () => void;
}

const RecentTransactions = ({
  transactions,
  currencySymbol,
  onTransactionClick,
  onEditTransaction,
  onDeleteTransaction,
  onViewAllTransactions,
}: RecentTransactionsProps) => {
  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between px-0 py-[10px] mx-[10px]">
        <CardTitle className="text-lg sm:text-xl text-slate-800 dark:text-slate-100">
          Recent Transactions
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onViewAllTransactions}
          className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:bg-slate-800"
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onTransactionClick(transaction)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 dark:text-slate-100 text-sm mb-1 truncate">
                    {transaction.title}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-slate-400 truncate">
                    {transaction.category}
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 ml-2">
                  <div className="text-right">
                    <div
                      className={`font-bold text-sm ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {currencySymbol}
                      {Number(transaction.amount).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-slate-400">
                      {transaction.date}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTransaction(transaction.id);
                      }}
                      className="h-6 w-6 sm:h-7 sm:w-7 p-0 border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
                    >
                      <Edit className="w-3 h-3 text-gray-700" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTransaction(transaction.id);
                      }}
                      className="h-6 w-6 sm:h-7 sm:w-7 p-0 border-red-300 text-red-600 hover:bg-red-50 bg-white"
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
            <FileText className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm mb-4">No transactions yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
