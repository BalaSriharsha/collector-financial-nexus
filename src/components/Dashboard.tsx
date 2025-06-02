
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";
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
import TransactionDetailsModal from "./TransactionDetailsModal";
import BudgetDetailsModal from "./BudgetDetailsModal";
import StatsDetailsModal from "./StatsDetailsModal";
import ViewAllModal from "./ViewAllModal";
import { getCurrencySymbol } from "@/utils/currency";
import { useDashboardData, Transaction, Budget } from "@/hooks/useDashboardData";
import QuickActionsMenu from "./dashboard/QuickActionsMenu";
import StatsCards from "./dashboard/StatsCards";
import RecentTransactions from "./dashboard/RecentTransactions";
import BudgetsOverview from "./dashboard/BudgetsOverview";
import MobileBottomNavigation from "./dashboard/MobileBottomNavigation";

interface DashboardProps {
  userType: "individual" | "organization";
}

const Dashboard = ({ userType }: DashboardProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { subscription, refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  const [timePeriod, setTimePeriod] = useState<"day" | "week" | "month" | "quarter" | "year">("month");
  
  const { stats, recentTransactions, budgets, allTransactions, loading, refetchData } = useDashboardData(timePeriod);

  // Form states
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showCreateBudget, setShowCreateBudget] = useState(false);
  const [showGenerateInvoice, setShowGenerateInvoice] = useState(false);
  const [showUploadInvoice, setShowUploadInvoice] = useState(false);
  const [showViewReports, setShowViewReports] = useState(false);
  const [showViewArchive, setShowViewArchive] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Modal states
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [showBudgetDetails, setShowBudgetDetails] = useState(false);
  const [showStatsDetails, setShowStatsDetails] = useState(false);
  const [selectedStatType, setSelectedStatType] = useState<"income" | "expenses" | "balance" | "transactions">("income");
  const [selectedStatTitle, setSelectedStatTitle] = useState("");
  const [selectedStatAmount, setSelectedStatAmount] = useState(0);
  const [showViewAllTransactions, setShowViewAllTransactions] = useState(false);
  const [showViewAllBudgets, setShowViewAllBudgets] = useState(false);

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

  const handleTransactionSuccess = () => {
    refetchData();
    setShowAddTransaction(false);
    setEditingTransactionId(null);
  };

  const handleBudgetSuccess = () => {
    refetchData();
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
      const { error } = await supabase.from("transactions").delete().eq("id", transactionId);
      if (error) throw error;
      toast.success("Transaction deleted successfully");
      refetchData();
    } catch (error: unknown) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;
    try {
      const { error } = await supabase.from("budgets").delete().eq("id", budgetId);
      if (error) throw error;
      toast.success("Budget deleted successfully");
      refetchData();
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
              {userType === "organization" ? "Organization Dashboard" : "Personal Dashboard"}
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
              onValueChange={(value: "day" | "week" | "month" | "quarter" | "year") => setTimePeriod(value)}
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

        <QuickActionsMenu
          userType={userType}
          onAddTransaction={() => setShowAddTransaction(true)}
          onCreateBudget={() => setShowCreateBudget(true)}
          onGenerateInvoice={() => setShowGenerateInvoice(true)}
          onUploadInvoice={() => setShowUploadInvoice(true)}
          onExpenseShare={handleExpenseShareClick}
          onViewReports={() => setShowViewReports(true)}
          onViewArchive={() => setShowViewArchive(true)}
        />

        <StatsCards
          stats={stats}
          currencySymbol={currencySymbol}
          onStatClick={handleStatClick}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <RecentTransactions
            transactions={recentTransactions}
            currencySymbol={currencySymbol}
            onTransactionClick={handleTransactionClick}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onViewAllTransactions={() => setShowViewAllTransactions(true)}
          />

          <BudgetsOverview
            budgets={budgets}
            currencySymbol={currencySymbol}
            onBudgetClick={handleBudgetClick}
            onEditBudget={handleEditBudget}
            onDeleteBudget={handleDeleteBudget}
            onViewAllBudgets={() => setShowViewAllBudgets(true)}
            onCreateBudget={() => setShowCreateBudget(true)}
          />
        </div>
      </div>

      <MobileBottomNavigation
        onAddTransaction={() => setShowAddTransaction(true)}
        onCreateBudget={() => setShowCreateBudget(true)}
        onUploadInvoice={() => setShowUploadInvoice(true)}
        onExpenseShare={handleExpenseShareClick}
        onViewReports={() => setShowViewReports(true)}
        onViewArchive={() => setShowViewArchive(true)}
      />

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

      <StatsDetailsModal
        open={showStatsDetails}
        onOpenChange={setShowStatsDetails}
        type={selectedStatType}
        title={selectedStatTitle}
        amount={selectedStatAmount}
        transactions={allTransactions}
      />

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
