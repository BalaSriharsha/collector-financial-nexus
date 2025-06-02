import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  FileText,
  Archive,
  BarChart3,
  Upload,
  Crown,
  Edit,
  Trash2,
  Users,
  User,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "./Navigation";
import AddTransactionForm from "./forms/AddTransactionForm";
import CreateBudgetForm from "./forms/CreateBudgetForm";
import GenerateInvoiceForm from "./forms/GenerateInvoiceForm";
import UploadInvoiceForm from "./forms/UploadInvoiceForm";
import ViewArchiveForm from "./forms/ViewArchiveForm";
import ViewReportsForm from "./forms/ViewReportsForm";
import ExpenseSharingForm from "./forms/ExpenseSharingForm";
import TransactionDetailsModal from "./TransactionDetailsModal";
import BudgetDetailsModal from "./BudgetDetailsModal";
import StatsDetailsModal from "./StatsDetailsModal";
import ViewAllModal from "./ViewAllModal";
import { getCurrencySymbol } from "@/utils/currency";

interface DashboardProps {
  userType: "individual" | "organization";
}
interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  description: string;
  created_at: string;
  updated_at: string;
}
interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}
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
const Dashboard = ({ userType }: DashboardProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { subscription, canAccess, refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    [],
  );
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showCreateBudget, setShowCreateBudget] = useState(false);
  const [showGenerateInvoice, setShowGenerateInvoice] = useState(false);
  const [showUploadInvoice, setShowUploadInvoice] = useState(false);
  const [showViewReports, setShowViewReports] = useState(false);
  const [showViewArchive, setShowViewArchive] = useState(false);
  const [showExpenseSharing, setShowExpenseSharing] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<
    string | null
  >(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [showBudgetDetails, setShowBudgetDetails] = useState(false);
  const [showStatsDetails, setShowStatsDetails] = useState(false);
  const [selectedStatType, setSelectedStatType] = useState<
    "income" | "expenses" | "balance" | "transactions"
  >("income");
  const [selectedStatTitle, setSelectedStatTitle] = useState("");
  const [selectedStatAmount, setSelectedStatAmount] = useState(0);
  const [showViewAllTransactions, setShowViewAllTransactions] = useState(false);
  const [showViewAllBudgets, setShowViewAllBudgets] = useState(false);
  const [timePeriod, setTimePeriod] = useState<
    "day" | "week" | "month" | "quarter" | "year"
  >("month");

  // Get currency symbol based on user profile
  const currencySymbol = getCurrencySymbol(profile?.currency || "USD");
  useEffect(() => {
    const checkSubscriptionStatus = () => {
      console.log("Checking subscription status...");
      refreshSubscription();
    };
    checkSubscriptionStatus();
    const interval = setInterval(checkSubscriptionStatus, 10000);
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Page became visible, checking subscription status...");
        checkSubscriptionStatus();
      }
    };
    const handleFocus = () => {
      console.log("Window focused, checking subscription status...");
      checkSubscriptionStatus();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refreshSubscription]);
  const getDateRange = (
    period: "day" | "week" | "month" | "quarter" | "year",
  ) => {
    const now = new Date();
    const start = new Date();

    switch (period) {
      case "day":
        start.setHours(0, 0, 0, 0);
        break;
      case "week":
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        break;
      case "month":
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      case "quarter": {
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        start.setMonth(quarterStart, 1);
        start.setHours(0, 0, 0, 0);
        break;
      }
      case "year":
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        break;
    }

    return {
      start: start.toISOString().split("T")[0],
      end: now.toISOString().split("T")[0],
    };
  };
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      const { start, end } = getDateRange(timePeriod);

      const { data: transactions, error: transError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: false });

      if (transError) throw transError;

      const totalIncome =
        transactions
          ?.filter((t) => t.type === "income")
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const totalExpense =
        transactions
          ?.filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const balance = totalIncome - totalExpense;

      setStats({
        totalIncome,
        totalExpense,
        balance,
        transactionCount: transactions?.length || 0,
      });

      // Store all transactions for modals
      const mappedAllTransactions =
        transactions?.map((t) => ({
          id: t.id,
          title: t.title,
          amount: Number(t.amount),
          type: t.type as "income" | "expense",
          category: t.category,
          date: t.date,
          description: t.description || "",
          created_at: t.created_at,
          updated_at: t.updated_at,
        })) || [];
      setAllTransactions(mappedAllTransactions);

      // Show only 4 recent transactions
      const mappedTransactions = mappedAllTransactions.slice(0, 4);
      setRecentTransactions(mappedTransactions);

      const { data: budgetData, error: budgetError } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (budgetError) {
        console.error("Budget fetch error:", budgetError);
        throw budgetError;
      }
      setBudgets(budgetData || []);

      // Log success message for budget loading
      if (budgetData && budgetData.length > 0) {
        console.log(`✅ Loaded ${budgetData.length} budgets successfully`);
      }
    } catch (error: unknown) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [user, timePeriod]);
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  const handleTransactionSuccess = () => {
    fetchDashboardData();
    setShowAddTransaction(false);
    setEditingTransactionId(null);
  };
  const handleBudgetSuccess = () => {
    fetchDashboardData();
    setShowCreateBudget(false);
    setEditingBudget(null);
  };
  const handleEditTransaction = (transactionId: string) => {
    setEditingTransactionId(transactionId);
    setShowAddTransaction(true);
  };
  const handleEditBudget = (budgetId: string) => {
    const budget = budgets.find((b) => b.id === budgetId);
    if (budget) {
      setEditingBudget(budget);
      setShowCreateBudget(true);
    }
  };
  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transactionId);
      if (error) throw error;
      toast.success("Transaction deleted successfully");
      fetchDashboardData();
    } catch (error: unknown) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };
  const handleDeleteBudget = async (budgetId: string) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;
    try {
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", budgetId);
      if (error) throw error;
      toast.success("Budget deleted successfully");
      fetchDashboardData();
      setShowBudgetDetails(false);
    } catch (error: unknown) {
      console.error("Error deleting budget:", error);
      toast.error("Failed to delete budget");
    }
  };
  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetails(true);
  };
  const handleBudgetClick = (budget: Budget) => {
    setSelectedBudget(budget);
    setShowBudgetDetails(true);
  };
  const handleExpenseShareClick = () => {
    navigate('/groups');
  };
  const handleUpgradeClick = () => {
    navigate("/pricing");
  };
  const handleStatClick = (
    type: "income" | "expenses" | "balance" | "transactions",
    title: string,
    amount: number,
  ) => {
    setSelectedStatType(type);
    setSelectedStatTitle(title);
    setSelectedStatAmount(amount);
    setShowStatsDetails(true);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-800 dark:text-slate-200">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pb-20 md:pb-0">
      <Navigation />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-playfair font-bold text-slate-800 dark:text-slate-100 mb-2">
              {userType === "organization"
                ? "Organization Dashboard"
                : "Personal Dashboard"}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Welcome back! Here's your financial overview.
            </p>
          </div>

          {/* Time Period Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <Select
              value={timePeriod}
              onValueChange={(
                value: "day" | "week" | "month" | "quarter" | "year",
              ) => setTimePeriod(value)}
            >
              <SelectTrigger className="w-32 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-lg z-50">
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Menu - Hidden on mobile */}
        <div className="mb-6 sm:mb-8 hidden md:block">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4">
            <Button
              onClick={() => setShowAddTransaction(true)}
              variant="ghost"
              className="bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-slate-700 dark:text-slate-300 transition-all duration-200"
            >
              <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              <span className="text-xs sm:text-sm font-medium text-center leading-tight text-slate-800 dark:text-slate-100">
                Add Transaction
              </span>
            </Button>

            <Button
              onClick={() => setShowCreateBudget(true)}
              variant="ghost"
              className="bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-slate-700 dark:text-slate-300 transition-all duration-200"
            >
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
              <span className="text-xs sm:text-sm font-medium text-center leading-tight text-slate-800 dark:text-slate-100">
                Create Budget
              </span>
            </Button>

            {userType === "organization" && (
              <Button
                onClick={() => setShowGenerateInvoice(true)}
                variant="ghost"
                className="bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-slate-700 dark:text-slate-300 transition-all duration-200"
              >
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                <span className="text-xs sm:text-sm font-medium text-center leading-tight text-slate-800 dark:text-slate-100">
                  Generate Invoice
                </span>
              </Button>
            )}

            <Button
              onClick={() => setShowUploadInvoice(true)}
              variant="ghost"
              className="bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-slate-700 dark:text-slate-300 transition-all duration-200"
            >
              <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              <span className="text-xs sm:text-sm font-medium text-center leading-tight text-slate-800 dark:text-slate-100">
                Upload
              </span>
            </Button>

            <Button
              onClick={handleExpenseShareClick}
              variant="ghost"
              className="bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-slate-700 dark:text-slate-300 transition-all duration-200"
            >
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 dark:text-pink-400" />
              <span className="text-xs sm:text-sm font-medium text-center leading-tight text-slate-800 dark:text-slate-100">
                Expense Share
              </span>
            </Button>

            <Button
              onClick={() => setShowViewReports(true)}
              variant="ghost"
              className="bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-slate-700 dark:text-slate-300 transition-all duration-200"
            >
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs sm:text-sm font-medium text-center leading-tight text-slate-800 dark:text-slate-100">
                Reports
              </span>
            </Button>

            <Button
              onClick={() => setShowViewArchive(true)}
              variant="ghost"
              className="bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-slate-700 dark:text-slate-300 transition-all duration-200"
            >
              <Archive className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-400" />
              <span className="text-xs sm:text-sm font-medium text-center leading-tight text-slate-800 dark:text-slate-100">
                Archive
              </span>
            </Button>
          </div>
        </div>

        {/* Stats Cards - Improved Single Row Layout */}
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-green-300 dark:hover:border-green-500"
            onClick={() =>
              handleStatClick("income", "Total Income", stats.totalIncome)
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
              handleStatClick("expenses", "Total Expenses", stats.totalExpense)
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
            onClick={() => handleStatClick("balance", "Balance", stats.balance)}
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
              handleStatClick(
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Recent Transactions */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between px-0 py-[10px] mx-[10px]">
              <CardTitle className="text-lg sm:text-xl text-slate-800 dark:text-slate-100">
                Recent Transactions
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowViewAllTransactions(true)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:bg-slate-800"
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleTransactionClick(transaction)}
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
                              handleEditTransaction(transaction.id);
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
                              handleDeleteTransaction(transaction.id);
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

          {/* Budgets Overview */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between py-[10px] mx-[10px]">
              <CardTitle className="text-lg sm:text-xl text-slate-800 dark:text-slate-100">
                Budget Overview
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowViewAllBudgets(true)}
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
                      onClick={() => handleBudgetClick(budget)}
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
                              handleEditBudget(budget.id);
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
                              handleDeleteBudget(budget.id);
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
                    onClick={() => setShowCreateBudget(true)}
                    className="border-gray-300 hover:bg-gray-50 bg-white dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:bg-slate-800"
                  >
                    <span className="text-gray-700 dark:text-slate-300">Create Budget</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Updated for cleaner design */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t-2 border-slate-300 dark:border-slate-700 md:hidden z-50 shadow-lg">
        <div className="grid grid-cols-7 h-16">
          <Button
            onClick={() => setShowAddTransaction(true)}
            variant="ghost"
            className="flex flex-col items-center justify-center gap-1 h-full text-slate-700 hover:text-blue-700 hover:bg-blue-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-none"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="text-[10px] leading-none">Add</span>
          </Button>
          <Button
            onClick={() => setShowCreateBudget(true)}
            variant="ghost"
            className="flex flex-col items-center justify-center gap-1 h-full text-slate-700 hover:text-orange-700 hover:bg-orange-50 dark:text-slate-300 dark:hover:text-orange-400 dark:hover:bg-orange-900/20 rounded-none"
          >
            <Target className="w-4 h-4" />
            <span className="text-[10px] leading-none">Budget</span>
          </Button>
          <Button
            onClick={() => setShowUploadInvoice(true)}
            variant="ghost"
            className="flex flex-col items-center justify-center gap-1 h-full text-slate-700 hover:text-purple-700 hover:bg-purple-50 dark:text-slate-300 dark:hover:text-purple-400 dark:hover:bg-purple-900/20 rounded-none"
          >
            <Upload className="w-4 h-4" />
            <span className="text-[10px] leading-none">Upload</span>
          </Button>
          <Button
            onClick={handleExpenseShareClick}
            variant="ghost"
            className="flex flex-col items-center justify-center gap-1 h-full text-slate-700 hover:text-pink-700 hover:bg-pink-50 dark:text-slate-300 dark:hover:text-pink-400 dark:hover:bg-pink-900/20 rounded-none"
          >
            <Users className="w-4 h-4" />
            <span className="text-[10px] leading-none">Groups</span>
          </Button>
          <Button
            onClick={() => setShowViewReports(true)}
            variant="ghost"
            className="flex flex-col items-center justify-center gap-1 h-full text-slate-700 hover:text-cyan-700 hover:bg-cyan-50 dark:text-slate-300 dark:hover:text-cyan-400 dark:hover:bg-cyan-900/20 rounded-none"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-[10px] leading-none">Reports</span>
          </Button>
          <Button
            onClick={() => setShowViewArchive(true)}
            variant="ghost"
            className="flex flex-col items-center justify-center gap-1 h-full text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800 rounded-none"
          >
            <Archive className="w-4 h-4" />
            <span className="text-[10px] leading-none">Archive</span>
          </Button>
          <Button
            onClick={() => navigate("/profile")}
            variant="ghost"
            className="flex flex-col items-center justify-center gap-1 h-full text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-none"
          >
            <User className="w-4 h-4" />
            <span className="text-[10px] leading-none">Profile</span>
          </Button>
        </div>
      </div>

      {/* Form Modals */}
      <AddTransactionForm
        open={showAddTransaction}
        onOpenChange={setShowAddTransaction}
        userType={userType}
        onClose={handleTransactionSuccess}
        editingTransactionId={editingTransactionId}
      />

      <CreateBudgetForm
        open={showCreateBudget}
        onOpenChange={setShowCreateBudget}
        userType={userType}
        onClose={handleBudgetSuccess}
        editingBudget={editingBudget}
      />

      {userType === "organization" && (
        <GenerateInvoiceForm
          open={showGenerateInvoice}
          onOpenChange={setShowGenerateInvoice}
        />
      )}

      <UploadInvoiceForm
        open={showUploadInvoice}
        onOpenChange={setShowUploadInvoice}
      />

      <ViewReportsForm
        open={showViewReports}
        onOpenChange={setShowViewReports}
      />

      <ViewArchiveForm
        open={showViewArchive}
        onOpenChange={setShowViewArchive}
        userType={userType}
        subscription={subscription}
      />

      {canAccess("expense-sharing") && (
        <ExpenseSharingForm
          open={showExpenseSharing}
          onOpenChange={setShowExpenseSharing}
          userType={userType}
        />
      )}

      {/* Detail Modals */}
      <TransactionDetailsModal
        transaction={selectedTransaction}
        open={showTransactionDetails}
        onOpenChange={setShowTransactionDetails}
        onEdit={(transactionId: string) => {
          setShowTransactionDetails(false);
          handleEditTransaction(transactionId);
        }}
        onDelete={handleDeleteTransaction}
      />

      <BudgetDetailsModal
        budget={selectedBudget}
        open={showBudgetDetails}
        onOpenChange={setShowBudgetDetails}
        onEdit={handleEditBudget}
        onDelete={handleDeleteBudget}
      />

      {/* Stats Details Modal */}
      <StatsDetailsModal
        open={showStatsDetails}
        onOpenChange={setShowStatsDetails}
        type={selectedStatType}
        title={selectedStatTitle}
        amount={selectedStatAmount}
        transactions={allTransactions}
      />

      {/* View All Modals */}
      <ViewAllModal
        open={showViewAllTransactions}
        onOpenChange={setShowViewAllTransactions}
        type="transactions"
        data={allTransactions}
        title="All Transactions"
      />

      <ViewAllModal
        open={showViewAllBudgets}
        onOpenChange={setShowViewAllBudgets}
        type="budgets"
        data={budgets}
        title="All Budgets"
      />
    </div>
  );
};

export default Dashboard;
