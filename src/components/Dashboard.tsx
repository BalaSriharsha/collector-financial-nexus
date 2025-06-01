
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, Users, Target, FileText, Upload, Archive, BarChart3, Download, UserPlus, Crown } from "lucide-react";
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
import TransactionDetailsModal from "./TransactionDetailsModal";
import MetricDetailsModal from "./MetricDetailsModal";
import AllTransactionsModal from "./AllTransactionsModal";
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
  description?: string;
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

interface Metrics {
  type: string;
  value: number;
  label: string;
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
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<Metrics | null>(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showCreateBudget, setShowCreateBudget] = useState(false);
  const [showGenerateInvoice, setShowGenerateInvoice] = useState(false);
  const [showUploadInvoice, setShowUploadInvoice] = useState(false);
  const [showViewReports, setShowViewReports] = useState(false);
  const [showViewArchive, setShowViewArchive] = useState(false);
  const [showExpenseSharing, setShowExpenseSharing] = useState(false);

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

      setRecentTransactions(transactions?.slice(0, 5) || []);

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

  const handleMetricClick = (type: string, value: number, label: string) => {
    setSelectedMetrics({ type, value, label });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-collector-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-collector-black/70">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-playfair font-bold text-collector-black mb-2">
              {userType === 'organization' ? 'Organization Dashboard' : 'Personal Dashboard'}
            </h1>
            <p className="text-collector-black/70 text-base">
              Welcome back! Here's your financial overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm px-3 py-1">
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

        {/* Quick Actions - Moved to top */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-collector-black">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-3 h-auto py-6"
                onClick={() => setShowAddTransaction(true)}
              >
                <PlusCircle className="w-6 h-6 text-collector-orange" />
                <span className="text-xs font-medium">Add Transaction</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center gap-3 h-auto py-6"
                onClick={() => setShowCreateBudget(true)}
              >
                <Target className="w-6 h-6 text-collector-orange" />
                <span className="text-xs font-medium">Create Budget</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center gap-3 h-auto py-6"
                onClick={() => setShowGenerateInvoice(true)}
              >
                <FileText className="w-6 h-6 text-collector-orange" />
                <span className="text-xs font-medium">Generate Invoice</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center gap-3 h-auto py-6"
                onClick={() => setShowUploadInvoice(true)}
              >
                <Upload className="w-6 h-6 text-collector-orange" />
                <span className="text-xs font-medium">Upload Invoice</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center gap-3 h-auto py-6"
                onClick={() => setShowViewReports(true)}
              >
                <BarChart3 className="w-6 h-6 text-collector-orange" />
                <span className="text-xs font-medium">View Reports</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center gap-3 h-auto py-6"
                onClick={handleRefresh}
              >
                <Download className="w-6 h-6 text-collector-orange" />
                <span className="text-xs font-medium">Refresh</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleMetricClick('income', stats.totalIncome, 'Total Income')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-collector-black">Total Income</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {currencySymbol}{stats.totalIncome.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleMetricClick('expense', stats.totalExpense, 'Total Expenses')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-collector-black">Total Expenses</CardTitle>
              <TrendingDown className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 mb-1">
                {currencySymbol}{stats.totalExpense.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleMetricClick('balance', stats.balance, 'Net Balance')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-collector-black">Balance</CardTitle>
              <DollarSign className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold mb-1 ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {currencySymbol}{stats.balance.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setShowAllTransactions(true)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-collector-black">Transactions</CardTitle>
              <FileText className="h-5 w-5 text-collector-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-collector-orange mb-1">
                {stats.transactionCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 bg-white/70 backdrop-blur-sm h-12">
            <TabsTrigger value="overview" className="text-xs sm:text-sm font-medium">Overview</TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs sm:text-sm font-medium">Add Transaction</TabsTrigger>
            <TabsTrigger value="budgets" className="text-xs sm:text-sm font-medium">Budgets</TabsTrigger>
            <TabsTrigger value="invoices" className="text-xs sm:text-sm font-medium">Invoices</TabsTrigger>
            <TabsTrigger value="upload" className="text-xs sm:text-sm font-medium">Upload</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm font-medium">Reports</TabsTrigger>
            <TabsTrigger value="archive" className="text-xs sm:text-sm font-medium">Archive</TabsTrigger>
            {userType === 'organization' && (
              <TabsTrigger value="teams" className="text-xs sm:text-sm font-medium">Teams</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-collector-black">Recent Transactions</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowAllTransactions(true)}
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentTransactions.length > 0 ? (
                    <div className="space-y-4">
                      {recentTransactions.map((transaction) => (
                        <div 
                          key={transaction.id}
                          className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-collector-black text-sm mb-1">{transaction.title}</div>
                            <div className="text-xs text-collector-black/60">{transaction.category}</div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold text-sm ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}{currencySymbol}{Number(transaction.amount).toLocaleString()}
                            </div>
                            <div className="text-xs text-collector-black/60">{transaction.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-collector-black/60">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm mb-4">No transactions yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowAddTransaction(true)}
                      >
                        Add Transaction
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Budgets Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-collector-black">Budget Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  {budgets.length > 0 ? (
                    <div className="space-y-4">
                      {budgets.slice(0, 3).map((budget) => (
                        <div key={budget.id} className="p-4 rounded-lg border bg-white/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-collector-black text-sm">{budget.name}</span>
                            <span className="text-sm font-bold text-collector-orange">{currencySymbol}{Number(budget.amount).toLocaleString()}</span>
                          </div>
                          <div className="text-xs text-collector-black/60">
                            {budget.category} • {budget.period}
                          </div>
                        </div>
                      ))}
                      {budgets.length > 3 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setShowCreateBudget(true)}
                        >
                          View All Budgets
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-collector-black/60">
                      <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm mb-4">No budgets created</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowCreateBudget(true)}
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
            <AddTransactionForm 
              open={showAddTransaction} 
              onOpenChange={setShowAddTransaction} 
              userType={userType}
            />
          </TabsContent>

          <TabsContent value="budgets">
            <CreateBudgetForm 
              open={showCreateBudget} 
              onOpenChange={setShowCreateBudget} 
              userType={userType}
            />
          </TabsContent>

          <TabsContent value="invoices">
            <GenerateInvoiceForm 
              open={showGenerateInvoice} 
              onOpenChange={setShowGenerateInvoice} 
            />
          </TabsContent>

          <TabsContent value="upload">
            <UploadInvoiceForm 
              open={showUploadInvoice} 
              onOpenChange={setShowUploadInvoice} 
            />
          </TabsContent>

          <TabsContent value="reports">
            <ViewReportsForm 
              open={showViewReports} 
              onOpenChange={setShowViewReports} 
            />
          </TabsContent>

          <TabsContent value="archive">
            <ViewArchiveForm 
              open={showViewArchive} 
              onOpenChange={setShowViewArchive} 
            />
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
          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-collector-orange" />
                <CardTitle className="text-xl text-collector-black">Expense Sharing</CardTitle>
                <Badge className="bg-gradient-to-r from-orange-400 to-amber-400 text-white text-sm px-3 py-1">
                  Premium Feature
                </Badge>
              </div>
              <CardDescription className="text-collector-black/60">
                Share expenses with friends and colleagues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseSharingForm 
                open={showExpenseSharing} 
                onOpenChange={setShowExpenseSharing} 
                userType={userType} 
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          open={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          currencySymbol={currencySymbol}
        />
      )}

      {selectedMetrics && (
        <MetricDetailsModal
          metrics={selectedMetrics}
          open={!!selectedMetrics}
          onClose={() => setSelectedMetrics(null)}
          currencySymbol={currencySymbol}
        />
      )}

      {showAllTransactions && (
        <AllTransactionsModal
          open={showAllTransactions}
          onOpenChange={setShowAllTransactions}
          transactions={recentTransactions}
        />
      )}
    </div>
  );
};

export default Dashboard;
