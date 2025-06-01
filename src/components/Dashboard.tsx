
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, Users, Target, FileText, Archive, BarChart3, UserPlus, Crown, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "./Navigation";
import AddTransactionForm from "./forms/AddTransactionForm";
import CreateBudgetForm from "./forms/CreateBudgetForm";
import ExpenseSharingForm from "./forms/ExpenseSharingForm";
import GenerateInvoiceForm from "./forms/GenerateInvoiceForm";
import UploadInvoiceForm from "./forms/UploadInvoiceForm";
import ViewArchiveForm from "./forms/ViewArchiveForm";
import ViewReportsForm from "./forms/ViewReportsForm";
import OrganizationTeams from "./OrganizationTeams";
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
  const { subscription, canAccess } = useSubscription();
  const [activeTab, setActiveTab] = useState("overview");
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

  const handleRefresh = () => {
    setLoading(true);
    fetchDashboardData();
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/80">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-playfair font-bold text-white mb-2">
              {userType === 'organization' ? 'Organization Dashboard' : 'Personal Dashboard'}
            </h1>
            <p className="text-white/80 text-base">
              Welcome back! Here's your financial overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm px-3 py-1 border-white/30 text-white bg-white/10">
              {subscription?.tier} Plan
            </Badge>
            {subscription?.tier !== 'Individual' && (
              <Badge className="bg-gradient-to-r from-orange-400 to-amber-400 text-white text-sm px-3 py-1">
                <Crown className="w-4 h-4 mr-1" />
                Premium
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-white">Total Income</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400 mb-1">
                {currencySymbol}{stats.totalIncome.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-white">Total Expenses</CardTitle>
              <TrendingDown className="h-5 w-5 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400 mb-1">
                {currencySymbol}{stats.totalExpense.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-white">Balance</CardTitle>
              <DollarSign className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold mb-1 ${stats.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {currencySymbol}{stats.balance.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-white">Transactions</CardTitle>
              <FileText className="h-5 w-5 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400 mb-1">
                {stats.transactionCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 bg-white/10 backdrop-blur-sm h-12 border-white/20">
            <TabsTrigger value="overview" className="text-xs sm:text-sm font-medium text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs sm:text-sm font-medium text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">Add Transaction</TabsTrigger>
            <TabsTrigger value="budgets" className="text-xs sm:text-sm font-medium text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">Budgets</TabsTrigger>
            <TabsTrigger value="invoices" className="text-xs sm:text-sm font-medium text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">Invoices</TabsTrigger>
            <TabsTrigger value="upload" className="text-xs sm:text-sm font-medium text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">Upload</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm font-medium text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">Reports</TabsTrigger>
            <TabsTrigger value="archive" className="text-xs sm:text-sm font-medium text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">Archive</TabsTrigger>
            {userType === 'organization' && (
              <TabsTrigger value="teams" className="text-xs sm:text-sm font-medium text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">Teams</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Transactions */}
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentTransactions.length > 0 ? (
                    <div className="space-y-4">
                      {recentTransactions.map((transaction) => (
                        <div 
                          key={transaction.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-white/20 hover:bg-white/5 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-white text-sm mb-1">{transaction.title}</div>
                            <div className="text-xs text-white/70">{transaction.category}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className={`font-bold text-sm ${
                                transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {transaction.type === 'income' ? '+' : '-'}{currencySymbol}{Number(transaction.amount).toLocaleString()}
                              </div>
                              <div className="text-xs text-white/70">{transaction.date}</div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditTransaction(transaction.id)}
                                className="h-7 w-7 p-0 border-white/30 text-white hover:bg-white/10"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteTransaction(transaction.id)}
                                className="h-7 w-7 p-0 border-red-400/30 text-red-400 hover:bg-red-400/10"
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
                          className="flex-1 border-white/30 text-white hover:bg-white/10"
                        >
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Add Transaction
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowViewArchive(true)}
                          className="flex-1 border-white/30 text-white hover:bg-white/10"
                        >
                          <Archive className="w-4 h-4 mr-2" />
                          View Archive
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-white/70">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm mb-4">No transactions yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowAddTransaction(true)}
                        className="border-white/30 text-white hover:bg-white/10"
                      >
                        Add Transaction
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Budgets Overview */}
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Budget Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  {budgets.length > 0 ? (
                    <div className="space-y-4">
                      {budgets.slice(0, 3).map((budget) => (
                        <div key={budget.id} className="p-4 rounded-lg border border-white/20 bg-white/5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-white text-sm">{budget.name}</span>
                            <span className="text-sm font-bold text-orange-400">{currencySymbol}{Number(budget.amount).toLocaleString()}</span>
                          </div>
                          <div className="text-xs text-white/70">
                            {budget.category} • {budget.period}
                          </div>
                        </div>
                      ))}
                      {budgets.length > 3 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full border-white/30 text-white hover:bg-white/10"
                          onClick={() => setShowCreateBudget(true)}
                        >
                          View All Budgets
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-white/70">
                      <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm mb-4">No budgets created</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowCreateBudget(true)}
                        className="border-white/30 text-white hover:bg-white/10"
                      >
                        Create Budget
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">Add New Transaction</CardTitle>
                <CardDescription className="text-white/70">Record your income or expense transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowAddTransaction(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budgets">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">Budget Management</CardTitle>
                <CardDescription className="text-white/70">Create and manage your budgets</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowCreateBudget(true)}
                  className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Create Budget
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">Invoice Management</CardTitle>
                <CardDescription className="text-white/70">Generate and manage invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowGenerateInvoice(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Invoice
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">Upload Documents</CardTitle>
                <CardDescription className="text-white/70">Upload invoices and financial documents</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowUploadInvoice(true)}
                  className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Upload Invoice
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">Financial Reports</CardTitle>
                <CardDescription className="text-white/70">View detailed financial reports and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowViewReports(true)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="archive">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">Archive</CardTitle>
                <CardDescription className="text-white/70">View and manage archived financial data</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowViewArchive(true)}
                  className="bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  View Archive
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {userType === 'organization' && (
            <TabsContent value="teams">
              <OrganizationTeams 
                onCreateInvoice={() => setShowGenerateInvoice(true)} 
              />
            </TabsContent>
          )}
        </Tabs>

        {/* Expense Sharing for Premium/Organization users */}
        {canAccess('expense-sharing') && (
          <Card className="mt-8 bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-orange-400" />
                <CardTitle className="text-xl text-white">Expense Sharing</CardTitle>
                <Badge className="bg-gradient-to-r from-orange-400 to-amber-400 text-white text-sm px-3 py-1">
                  Premium Feature
                </Badge>
              </div>
              <CardDescription className="text-white/70">
                Share expenses with friends and colleagues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowExpenseSharing(true)}
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
              >
                <Users className="w-4 h-4 mr-2" />
                Share Expenses
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Form Modals */}
      <AddTransactionForm 
        open={showAddTransaction} 
        onOpenChange={setShowAddTransaction} 
        userType={userType}
        onClose={() => {
          setShowAddTransaction(false);
          setEditingTransactionId(null);
          fetchDashboardData();
        }}
      />

      <CreateBudgetForm 
        open={showCreateBudget} 
        onOpenChange={setShowCreateBudget} 
        userType={userType}
        onClose={() => {
          setShowCreateBudget(false);
          fetchDashboardData();
        }}
      />

      <GenerateInvoiceForm 
        open={showGenerateInvoice} 
        onOpenChange={setShowGenerateInvoice} 
      />

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
      />

      <ExpenseSharingForm 
        open={showExpenseSharing} 
        onOpenChange={setShowExpenseSharing} 
        userType={userType} 
      />
    </div>
  );
};

export default Dashboard;
