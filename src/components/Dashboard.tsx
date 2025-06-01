import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Users
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
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
}

const Dashboard = ({ userType }: DashboardProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { subscription, canAccess, refreshSubscription } = useSubscription();
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showCreateBudget, setShowCreateBudget] = useState(false);
  const [showGenerateInvoice, setShowGenerateInvoice] = useState(false);
  const [showUploadInvoice, setShowUploadInvoice] = useState(false);
  const [showViewReports, setShowViewReports] = useState(false);
  const [showViewArchive, setShowViewArchive] = useState(false);
  const [showExpenseSharing, setShowExpenseSharing] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);

  // Get currency symbol based on user profile
  const currencySymbol = getCurrencySymbol(profile?.currency || 'USD');

  // Only check subscription status when window gains focus (reduce frequency)
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused, checking subscription status...');
      refreshSubscription(true);
    };

    // Add a longer delay before attaching the focus listener to prevent immediate calls
    const timer = setTimeout(() => {
      window.addEventListener('focus', handleFocus);
    }, 5000);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch transactions
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (transError) throw transError;

      // Calculate stats
      const totalIncome = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const totalExpense = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const balance = totalIncome - totalExpense;

      setStats({
        totalIncome,
        totalExpense,
        balance,
        transactionCount: transactions?.length || 0
      });

      // Map transactions to the interface
      const mappedTransactions = transactions?.slice(0, 5).map(t => ({
        id: t.id,
        title: t.title,
        amount: Number(t.amount),
        type: t.type as 'income' | 'expense',
        category: t.category,
        date: t.date,
        description: t.description || '',
        created_at: t.created_at
      })) || [];

      setRecentTransactions(mappedTransactions);

      // Fetch budgets
      const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

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
  };

  const handleEditTransaction = (transactionId: string) => {
    setEditingTransactionId(transactionId);
    setShowAddTransaction(true);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;
      
      toast.success('Transaction deleted successfully');
      fetchDashboardData();
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  // Quick menu items configuration - including Expense Sharing for eligible users
  const quickMenuItems = [
    {
      icon: PlusCircle,
      label: "Add Transaction",
      onClick: () => setShowAddTransaction(true),
      bgColor: "bg-blue-500/20",
      iconColor: "text-blue-600",
      hoverColor: "hover:bg-blue-500/30"
    },
    {
      icon: Target,
      label: "Create Budget",
      onClick: () => setShowCreateBudget(true),
      bgColor: "bg-orange-500/20",
      iconColor: "text-orange-600",
      hoverColor: "hover:bg-orange-500/30"
    },
    ...(userType === 'organization' ? [{
      icon: FileText,
      label: "Generate Invoice",
      onClick: () => setShowGenerateInvoice(true),
      bgColor: "bg-green-500/20",
      iconColor: "text-green-600",
      hoverColor: "hover:bg-green-500/30"
    }] : []),
    {
      icon: Upload,
      label: "Upload",
      onClick: () => setShowUploadInvoice(true),
      bgColor: "bg-purple-500/20",
      iconColor: "text-purple-600",
      hoverColor: "hover:bg-purple-500/30"
    },
    {
      icon: BarChart3,
      label: "Reports",
      onClick: () => setShowViewReports(true),
      bgColor: "bg-cyan-500/20",
      iconColor: "text-cyan-600",
      hoverColor: "hover:bg-cyan-500/30"
    },
    {
      icon: Archive,
      label: "Archive",
      onClick: () => setShowViewArchive(true),
      bgColor: "bg-gray-500/20",
      iconColor: "text-gray-700",
      hoverColor: "hover:bg-gray-500/30"
    },
    ...(canAccess('expense-sharing') ? [{
      icon: Users,
      label: "Expense Sharing",
      onClick: () => setShowExpenseSharing(true),
      bgColor: "bg-pink-500/20",
      iconColor: "text-pink-600",
      hoverColor: "hover:bg-pink-500/30"
    }] : [])
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
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
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs sm:text-sm px-2 sm:px-3 py-1 border-gray-400 text-gray-700 bg-white/80">
              {subscription?.tier || 'Individual'} Plan
            </Badge>
            {subscription?.tier !== 'Individual' && (
              <Badge className="bg-gradient-to-r from-orange-400 to-amber-400 text-white text-xs sm:text-sm px-2 sm:px-3 py-1">
                <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Premium
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Menu */}
        <div className="mb-6 sm:mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4">
            {quickMenuItems.map((item, index) => (
              <Button
                key={index}
                onClick={item.onClick}
                variant="ghost"
                className={`${item.bgColor} ${item.hoverColor} border border-gray-300 h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-gray-700 backdrop-blur-sm transition-all duration-200`}
              >
                <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.iconColor}`} />
                <span className="text-xs sm:text-sm font-medium text-center leading-tight text-gray-800">
                  {item.label}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white/90 border-gray-200 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-1">
                {currencySymbol}{stats.totalIncome.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 border-gray-200 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 mb-1">
                {currencySymbol}{stats.totalExpense.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 border-gray-200 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Balance</CardTitle>
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-1 ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {currencySymbol}{stats.balance.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 border-gray-200 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Transactions</CardTitle>
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600 mb-1">
                {stats.transactionCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Recent Transactions */}
          <Card className="bg-white/90 border-gray-200 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-gray-800">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div 
                      key={transaction.id}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 text-sm mb-1 truncate">{transaction.title}</div>
                        <div className="text-xs text-gray-600 truncate">{transaction.category}</div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 ml-2">
                        <div className="text-right">
                          <div className={`font-bold text-sm ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{currencySymbol}{Number(transaction.amount).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">{transaction.date}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditTransaction(transaction.id)}
                            className="h-6 w-6 sm:h-7 sm:w-7 p-0 border-gray-400 text-gray-800 hover:bg-gray-100"
                          >
                            <Edit className="w-3 h-3 text-gray-700" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="h-6 w-6 sm:h-7 sm:w-7 p-0 border-red-400 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowAddTransaction(true)}
                      className="flex-1 border-gray-400 text-gray-800 hover:bg-gray-100 text-xs sm:text-sm"
                    >
                      <PlusCircle className="w-4 h-4 mr-2 text-gray-700" />
                      <span className="text-gray-700">Add Transaction</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowViewArchive(true)}
                      className="flex-1 border-gray-400 text-gray-800 hover:bg-gray-100 text-xs sm:text-sm"
                    >
                      <Archive className="w-4 h-4 mr-2 text-gray-700" />
                      <span className="text-gray-700">View Archive</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 text-gray-600">
                  <FileText className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm mb-4">No transactions yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowAddTransaction(true)}
                    className="border-gray-400 text-gray-800 hover:bg-gray-100"
                  >
                    Add Transaction
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budgets Overview */}
          <Card className="bg-white/90 border-gray-200 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-gray-800">Budget Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {budgets.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {budgets.slice(0, 3).map((budget) => (
                    <div key={budget.id} className="p-3 sm:p-4 rounded-lg border border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800 text-sm truncate flex-1">{budget.name}</span>
                        <span className="text-sm font-bold text-orange-600 ml-2">{currencySymbol}{Number(budget.amount).toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {budget.category} • {budget.period}
                      </div>
                    </div>
                  ))}
                  {budgets.length > 3 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-gray-400 text-gray-800 hover:bg-gray-100 text-xs sm:text-sm"
                      onClick={() => setShowCreateBudget(true)}
                    >
                      View All Budgets
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 text-gray-600">
                  <Target className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm mb-4">No budgets created</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowCreateBudget(true)}
                    className="border-gray-400 hover:bg-gray-100"
                  >
                    <span className="text-gray-700">Create Budget</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
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
      />

      {userType === 'organization' && (
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

      {canAccess('expense-sharing') && (
        <ExpenseSharingForm 
          open={showExpenseSharing} 
          onOpenChange={setShowExpenseSharing} 
          userType={userType}
        />
      )}
    </div>
  );
};

export default Dashboard;
