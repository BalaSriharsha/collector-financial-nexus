
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, FileText } from "lucide-react";
import { DashboardStats } from "@/hooks/useDashboardData";

interface StatsCardsProps {
  stats: DashboardStats;
  currencySymbol: string;
  onStatClick: (
    type: "income" | "expenses" | "balance" | "transactions",
    title: string,
    amount: number
  ) => void;
}

const StatsCards = ({ stats, currencySymbol, onStatClick }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
      <Card
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-green-300 dark:hover:border-green-500"
        onClick={() =>
          onStatClick("income", "Total Income", stats.totalIncome)
        }
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
          <CardTitle className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 leading-tight">
            Total Income
          </CardTitle>
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
            {currencySymbol}
            {stats.totalIncome.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Click to view details
          </p>
        </CardContent>
      </Card>

      <Card
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-red-300 dark:hover:border-red-500"
        onClick={() =>
          onStatClick("expenses", "Total Expenses", stats.totalExpense)
        }
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
          <CardTitle className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 leading-tight">
            Total Expenses
          </CardTitle>
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 flex items-center justify-center">
            <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
            {currencySymbol}
            {stats.totalExpense.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Click to view details
          </p>
        </CardContent>
      </Card>

      <Card
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300 dark:hover:border-blue-500"
        onClick={() => onStatClick("balance", "Balance", stats.balance)}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
          <CardTitle className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 leading-tight">
            Balance
          </CardTitle>
          <div
            className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full border flex items-center justify-center ${stats.balance >= 0 ? "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700" : "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-700"}`}
          >
            <DollarSign
              className={`h-4 w-4 sm:h-5 sm:w-5 ${stats.balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}`}
            />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div
            className={`text-lg sm:text-xl lg:text-2xl font-bold mb-1 ${stats.balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}`}
          >
            {currencySymbol}
            {stats.balance.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Click to view details
          </p>
        </CardContent>
      </Card>

      <Card
        className="bg-white border-2 border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-orange-500 dark:bg-slate-800 dark:border-slate-600 dark:hover:border-orange-400"
        onClick={() =>
          onStatClick(
            "transactions",
            "Transactions",
            stats.transactionCount,
          )
        }
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
          <CardTitle className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
            Transactions
          </CardTitle>
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center dark:bg-orange-900/30 dark:border-orange-700">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-orange-700 dark:text-orange-400" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
            {stats.transactionCount}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block">
            Click to view details
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
