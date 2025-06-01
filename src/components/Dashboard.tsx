import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, Target, FileText, Archive, BarChart3, Upload, Crown, Edit, Trash2, Users, User } from "lucide-react";
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
  userType: 'individual' | 'organization';
}
interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
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
const Dashboard = ({
  userType
}: DashboardProps) => {
  const {
    user
  } = useAuth();
  const {
    profile
  } = useProfile();
  const {
    subscription,
    canAccess,
    refreshSubscription
  } = useSubscription();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
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
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [showBudgetDetails, setShowBudgetDetails] = useState(false);
  const [showStatsDetails, setShowStatsDetails] = useState(false);
  const [selectedStatType, setSelectedStatType] = useState<'income' | 'expenses' | 'balance' | 'transactions'>('income');
  const [selectedStatTitle, setSelectedStatTitle] = useState('');
  const [selectedStatAmount, setSelectedStatAmount] = useState(0);
  const [showViewAllTransactions, setShowViewAllTransactions] = useState(false);
  const [showViewAllBudgets, setShowViewAllBudgets] = useState(false);

  // Get currency symbol based on user profile
  const currencySymbol = getCurrencySymbol(profile?.currency || 'USD');
  useEffect(() => {
    const checkSubscriptionStatus = () => {
      console.log('Checking subscription status...');
      refreshSubscription();
    };
    checkSubscriptionStatus();
    const interval = setInterval(checkSubscriptionStatus, 10000);
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, checking subscription status...');
        checkSubscriptionStatus();
      }
    };
    const handleFocus = () => {
      console.log('Window focused, checking subscription status...');
      checkSubscriptionStatus();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshSubscription]);
  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      const {
        data: transactions,
        error: transError
      } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('date', {
        ascending: false
      });
      if (transError) throw transError;
      const totalIncome = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const totalExpense = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const balance = totalIncome - totalExpense;
      setStats({
        totalIncome,
        totalExpense,
        balance,
        transactionCount: transactions?.length || 0
      });

      // Store all transactions for modals
      const mappedAllTransactions = transactions?.map(t => ({
        id: t.id,
        title: t.title,
        amount: Number(t.amount),
        type: t.type as 'income' | 'expense',
        category: t.category,
        date: t.date,
        description: t.description || '',
        created_at: t.created_at,
        updated_at: t.updated_at
      })) || [];
      setAllTransactions(mappedAllTransactions);

      // Show only 4 recent transactions
      const mappedTransactions = mappedAllTransactions.slice(0, 4);
      setRecentTransactions(mappedTransactions);
      const {
        data: budgetData,
        error: budgetError
      } = await supabase.from('budgets').select('*').eq('user_id', user.id).order('created_at', {
        ascending: false
      });
      if (budgetError) throw budgetError;
      setBudgets(budgetData || []);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboardData();
  }, [user]);
  const handleTransactionSuccess = () => {
    fetchDashboardData();
    setShowAddTransaction(false);
    setEditingTransactionId(null);
  };
  const handleBudgetSuccess = () => {
    fetchDashboardData();
    setShowCreateBudget(false);
    setEditingBudgetId(null);
  };
  const handleEditTransaction = (transactionId: string) => {
    setEditingTransactionId(transactionId);
    setShowAddTransaction(true);
  };
  const handleEditBudget = (budgetId: string) => {
    setEditingBudgetId(budgetId);
    setShowCreateBudget(true);
  };
  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const {
        error
      } = await supabase.from('transactions').delete().eq('id', transactionId);
      if (error) throw error;
      toast.success('Transaction deleted successfully');
      fetchDashboardData();
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };
  const handleDeleteBudget = async (budgetId: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    try {
      const {
        error
      } = await supabase.from('budgets').delete().eq('id', budgetId);
      if (error) throw error;
      toast.success('Budget deleted successfully');
      fetchDashboardData();
      setShowBudgetDetails(false);
    } catch (error: any) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget');
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
    if (canAccess('expense-sharing')) {
      setShowExpenseSharing(true);
    } else {
      setShowUpgradePrompt(true);
    }
  };
  const handleUpgradeClick = () => {
    navigate('/pricing');
  };
  const handleStatClick = (type: 'income' | 'expenses' | 'balance' | 'transactions', title: string, amount: number) => {
    setSelectedStatType(type);
    setSelectedStatTitle(title);
    setSelectedStatAmount(amount);
    setShowStatsDetails(true);
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700">Loading dashboard...</p>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-playfair font-bold text-gray-800 mb-2">
              {userType === 'organization' ? 'Organization Dashboard' : 'Personal Dashboard'}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Welcome back! Here's your financial overview.
            </p>
          </div>
        </div>

        {/* Quick Menu - Hidden on mobile */}
        <div className="mb-6 sm:mb-8 hidden md:block">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4">
            <Button onClick={() => setShowAddTransaction(true)} variant="ghost" className="bg-blue-500/20 hover-navy border border-gray-300 h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-gray-700 backdrop-blur-sm transition-all duration-200">
              <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <span className="text-xs sm:text-sm font-medium text-center leading-tight text-gray-800">
                Add Transaction
              </span>
            </Button>
            
            <Button onClick={() => setShowCreateBudget(true)} variant="ghost" className="bg-orange-500/20 hover-navy border border-gray-300 h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-gray-700 backdrop-blur-sm transition-all duration-200">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              <span className="text-xs sm:text-sm font-medium text-center leading-tight text-gray-800">
                Create Budget
              </span>
            </Button>

            {userType === 'organization' && <Button onClick={() => setShowGenerateInvoice(true)} variant="ghost" className="bg-green-500/20 hover-navy border border-gray-300 h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-gray-700 backdrop-blur-sm transition-all duration-200">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                <span className="text-xs sm:text-sm font-medium text-center leading-tight text-gray-800">
                  Generate Invoice
                </span>
              </Button>}

            <Button onClick={() => setShowUploadInvoice(true)} variant="ghost" className="bg-purple-500/20 hover-navy border border-gray-300 h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-gray-700 backdrop-blur-sm transition-all duration-200">
              <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <span className="text-xs sm:text-sm font-medium text-center leading-tight text-gray-800">
                Upload
              </span>
            </Button>

            <Button onClick={handleExpenseShareClick} variant="ghost" className="bg-pink-500/20 hover-navy border border-gray-300 h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-gray-700 backdrop-blur-sm transition-all duration-200">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
              <span className="text-xs sm:text-sm font-medium text-center leading-tight text-gray-800">
                Expense Share
              </span>
            </Button>

            <Button onClick={() => setShowViewReports(true)} variant="ghost" className="bg-cyan-500/20 hover-navy border border-gray-300 h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-gray-700 backdrop-blur-sm transition-all duration-200">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600" />
              <span className="text-xs sm:text-sm font-medium text-center leading-tight text-gray-800">
                Reports
              </span>
            </Button>

            <Button onClick={() => setShowViewArchive(true)} variant="ghost" className="bg-gray-500/20 hover-navy border border-gray-300 h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-gray-700 backdrop-blur-sm transition-all duration-200">
              <Archive className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              <span className="text-xs sm:text-sm font-medium text-center leading-tight text-gray-800">
                Archive
              </span>
            </Button>
          </div>
        </div>

        {/* Stats Cards - Enhanced Single Row Layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white/95 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:border-green-300 hover:-translate-y-0.5 group" onClick={() => handleStatClick('income', 'Total Income', stats.totalIncome)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 lg:px-5 pt-3 sm:pt-4 lg:pt-5">
              <CardTitle className="text-xs sm:text-sm lg:text-sm font-medium text-gray-600 leading-tight">Total Income</CardTitle>
              <div className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors duration-300 flex-shrink-0">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-4 lg:w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 lg:px-5 pb-3 sm:pb-4 lg:pb-5">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 mb-1 sm:mb-2">
                {currencySymbol}{stats.totalIncome.toLocaleString()}
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500">Click to view details</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:border-red-300 hover:-translate-y-0.5 group" onClick={() => handleStatClick('expenses', 'Total Expenses', stats.totalExpense)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 lg:px-5 pt-3 sm:pt-4 lg:pt-5">
              <CardTitle className="text-xs sm:text-sm lg:text-sm font-medium text-gray-600 leading-tight">Total Expenses</CardTitle>
              <div className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors duration-300 flex-shrink-0">
                <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-4 lg:w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 lg:px-5 pb-3 sm:pb-4 lg:pb-5">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600 mb-1 sm:mb-2">
                {currencySymbol}{stats.totalExpense.toLocaleString()}
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500">Click to view details</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:border-blue-300 hover:-translate-y-0.5 group" onClick={() => handleStatClick('balance', 'Balance', stats.balance)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 lg:px-5 pt-3 sm:pt-4 lg:pt-5">
              <CardTitle className="text-xs sm:text-sm lg:text-sm font-medium text-gray-600 leading-tight">Balance</CardTitle>
              <div className={`h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 rounded-full flex items-center justify-center transition-colors duration-300 flex-shrink-0 ${stats.balance >= 0 ? 'bg-blue-100 group-hover:bg-blue-200' : 'bg-red-100 group-hover:bg-red-200'}`}>
                <DollarSign className={`h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-4 lg:w-4 ${stats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 lg:px-5 pb-3 sm:pb-4 lg:pb-5">
              <div className={`text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 ${stats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {currencySymbol}{stats.balance.toLocaleString()}
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500">Click to view details</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:border-orange-300 hover:-translate-y-0.5 group" onClick={() => handleStatClick('transactions', 'Transactions', stats.transactionCount)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 lg:px-5 pt-3 sm:pt-4 lg:pt-5">
              <CardTitle className="text-xs sm:text-sm lg:text-sm font-medium text-gray-600 leading-tight">Transactions</CardTitle>
              <div className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors duration-300 flex-shrink-0">
                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-4 lg:w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 lg:px-5 pb-3 sm:pb-4 lg:pb-5">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600 mb-1 sm:mb-2">
                {stats.transactionCount}
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500">Click to view details</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Recent Transactions */}
          <Card className="bg-white/90 border-gray-200 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg sm:text-xl text-gray-800">Recent Transactions</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowViewAllTransactions(true)} className="border-gray-400 text-gray-800 hover-navy transition-colors">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? <div className="space-y-3 sm:space-y-4">
                  {recentTransactions.map(transaction => <div key={transaction.id} className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleTransactionClick(transaction)}>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 text-sm mb-1 truncate">{transaction.title}</div>
                        <div className="text-xs text-gray-600 truncate">{transaction.category}</div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 ml-2">
                        <div className="text-right">
                          <div className={`font-bold text-sm ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'income' ? '+' : '-'}{currencySymbol}{Number(transaction.amount).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">{transaction.date}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button size="sm" variant="outline" onClick={e => {
                      e.stopPropagation();
                      handleEditTransaction(transaction.id);
                    }} className="h-6 w-6 sm:h-7 sm:w-7 p-0 border-gray-400 text-gray-800 hover-navy transition-colors">
                            <Edit className="w-3 h-3 text-gray-700" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={e => {
                      e.stopPropagation();
                      handleDeleteTransaction(transaction.id);
                    }} className="h-6 w-6 sm:h-7 sm:w-7 p-0 border-red-400 text-red-600 hover-black transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>)}
                </div> : <div className="text-center py-8 sm:py-12 text-gray-600">
                  <FileText className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm mb-4">No transactions yet</p>
                </div>}
            </CardContent>
          </Card>

          {/* Budgets Overview */}
          <Card className="bg-white/90 border-gray-200 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg sm:text-xl text-gray-800">Budget Overview</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowViewAllBudgets(true)} className="border-gray-400 text-gray-800 hover-navy transition-colors">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {budgets.length > 0 ? <div className="space-y-3 sm:space-y-4">
                  {budgets.slice(0, 4).map(budget => <div key={budget.id} className="p-3 sm:p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleBudgetClick(budget)}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800 text-sm truncate flex-1">{budget.name}</span>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-sm font-bold text-orange-600">{currencySymbol}{Number(budget.amount).toLocaleString()}</span>
                          <div className="flex flex-col gap-1">
                            <Button size="sm" variant="outline" onClick={e => {
                        e.stopPropagation();
                        handleEditBudget(budget.id);
                      }} className="h-5 w-5 p-0 border-gray-400 text-gray-800 hover-navy transition-colors">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={e => {
                        e.stopPropagation();
                        handleDeleteBudget(budget.id);
                      }} className="h-5 w-5 p-0 border-red-400 text-red-600 hover-black transition-colors">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        {budget.category} • {budget.period}
                      </div>
                    </div>)}
                </div> : <div className="text-center py-8 sm:py-12 text-gray-600">
                  <Target className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm mb-4">No budgets created</p>
                  <Button variant="outline" size="sm" onClick={() => setShowCreateBudget(true)} className="border-gray-400 hover-navy transition-colors">
                    <span className="text-gray-700">Create Budget</span>
                  </Button>
                </div>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Updated for cleaner design */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 md:hidden z-50 shadow-lg">
        <div className="grid grid-cols-7 h-16">
          <Button onClick={() => setShowAddTransaction(true)} variant="ghost" className="flex flex-col items-center justify-center gap-1 h-full text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 transition-colors rounded-none">
            <PlusCircle className="w-4 h-4" />
            <span className="text-[10px] leading-none">Add</span>
          </Button>
          <Button onClick={() => setShowCreateBudget(true)} variant="ghost" className="flex flex-col items-center justify-center gap-1 h-full text-gray-600 hover:text-orange-600 hover:bg-orange-50/80 transition-colors rounded-none">
            <Target className="w-4 h-4" />
            <span className="text-[10px] leading-none">Budget</span>
          </Button>
          <Button onClick={() => setShowUploadInvoice(true)} variant="ghost" className="flex flex-col items-center justify-center gap-1 h-full text-gray-600 hover:text-purple-600 hover:bg-purple-50/80 transition-colors rounded-none">
            <Upload className="w-4 h-4" />
            <span className="text-[10px] leading-none">Upload</span>
          </Button>
          <Button onClick={handleExpenseShareClick} variant="ghost" className="flex flex-col items-center justify-center gap-1 h-full text-gray-600 hover:text-pink-600 hover:bg-pink-50/80 transition-colors rounded-none">
            <Users className="w-4 h-4" />
            <span className="text-[10px] leading-none">Share</span>
          </Button>
          <Button onClick={() => setShowViewReports(true)} variant="ghost" className="flex flex-col items-center justify-center gap-1 h-full text-gray-600 hover:text-cyan-600 hover:bg-cyan-50/80 transition-colors rounded-none">
            <BarChart3 className="w-4 h-4" />
            <span className="text-[10px] leading-none">Reports</span>
          </Button>
          <Button onClick={() => setShowViewArchive(true)} variant="ghost" className="flex flex-col items-center justify-center gap-1 h-full text-gray-600 hover:text-gray-700 hover:bg-gray-50/80 transition-colors rounded-none">
            <Archive className="w-4 h-4" />
            <span className="text-[10px] leading-none">Archive</span>
          </Button>
          <Button onClick={() => navigate('/profile')} variant="ghost" className="flex flex-col items-center justify-center gap-1 h-full text-gray-600 hover:text-green-600 hover:bg-green-50/80 transition-colors rounded-none">
            <User className="w-4 h-4" />
            <span className="text-[10px] leading-none">Profile</span>
          </Button>
        </div>
      </div>

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-xl text-center">Upgrade Required</CardTitle>
              <CardDescription className="text-center">
                Expense sharing is only available for Premium and Organization users.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button onClick={handleUpgradeClick} className="w-full bg-blue-gradient hover:bg-blue-600 text-white transition-colors">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
              <Button onClick={() => setShowUpgradePrompt(false)} variant="outline" className="w-full hover-navy transition-colors">
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>}

      {/* Form Modals */}
      <AddTransactionForm open={showAddTransaction} onOpenChange={setShowAddTransaction} userType={userType} onClose={handleTransactionSuccess} editingTransactionId={editingTransactionId} />

      <CreateBudgetForm open={showCreateBudget} onOpenChange={setShowCreateBudget} userType={userType} onClose={handleBudgetSuccess} editingBudget={editingBudgetId} />

      {userType === 'organization' && <GenerateInvoiceForm open={showGenerateInvoice} onOpenChange={setShowGenerateInvoice} />}

      <UploadInvoiceForm open={showUploadInvoice} onOpenChange={setShowUploadInvoice} />

      <ViewReportsForm open={showViewReports} onOpenChange={setShowViewReports} />

      <ViewArchiveForm open={showViewArchive} onOpenChange={setShowViewArchive} userType={userType} subscription={subscription} />

      {canAccess('expense-sharing') && <ExpenseSharingForm open={showExpenseSharing} onOpenChange={setShowExpenseSharing} userType={userType} />}

      {/* Detail Modals */}
      <TransactionDetailsModal transaction={selectedTransaction} open={showTransactionDetails} onOpenChange={setShowTransactionDetails} onEdit={(transactionId: string) => {
      setShowTransactionDetails(false);
      handleEditTransaction(transactionId);
    }} onDelete={handleDeleteTransaction} />

      <BudgetDetailsModal budget={selectedBudget} open={showBudgetDetails} onOpenChange={setShowBudgetDetails} onEdit={handleEditBudget} onDelete={handleDeleteBudget} />

      {/* Stats Details Modal */}
      <StatsDetailsModal open={showStatsDetails} onOpenChange={setShowStatsDetails} type={selectedStatType} title={selectedStatTitle} amount={selectedStatAmount} transactions={allTransactions} />

      {/* View All Modals */}
      <ViewAllModal open={showViewAllTransactions} onOpenChange={setShowViewAllTransactions} type="transactions" data={allTransactions} title="All Transactions" />

      <ViewAllModal open={showViewAllBudgets} onOpenChange={setShowViewAllBudgets} type="budgets" data={budgets} title="All Budgets" />
    </div>;
};

export default Dashboard;
