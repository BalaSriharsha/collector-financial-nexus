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
  const [selectedMetric, setSelectedMetric] = useState<{ type: string; value: number; label: string } | null>(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  
  // Modal states for forms
  const [showGenerateInvoice, setShowGenerateInvoice] = useState(false);
  const [showUploadInvoice, setShowUploadInvoice] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-collector-black">
              {userType === 'organization' ? 'Organization Dashboard' : 'Personal Dashboard'}
            </h1>
            <p className="text-collector-black/70 text-sm sm:text-base">
              Welcome back! Here's your financial overview.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {subscription?.tier} Plan
            </Badge>
            {subscription?.tier !== 'Individual' && (
              <Badge className="bg-gradient-to-r from-orange-400 to-amber-400 text-white text-xs">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-collector-gold/20"
            onClick={() => setSelectedMetric({ type: 'income', value: stats.totalIncome, label: 'Total Income' })}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {currencySymbol}{stats.totalIncome.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-collector-gold/20"
            onClick={() => setSelectedMetric({ type: 'expense', value: stats.totalExpense, label: 'Total Expenses' })}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {currencySymbol}{stats.totalExpense.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-collector-gold/20"
            onClick={() => setSelectedMetric({ type: 'balance', value: stats.balance, label: 'Net Balance' })}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {currencySymbol}{stats.balance.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-collector-gold/20"
            onClick={() => setShowAllTransactions(true)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <FileText className="h-4 w-4 text-collector-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-collector-orange">
                {stats.transactionCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 bg-white/50 backdrop-blur-sm border border-collector-gold/20">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs sm:text-sm">Add Transaction</TabsTrigger>
            <TabsTrigger value="budgets" className="text-xs sm:text-sm">Budgets</TabsTrigger>
            <TabsTrigger value="invoices" className="text-xs sm:text-sm">Invoices</TabsTrigger>
            <TabsTrigger value="upload" className="text-xs sm:text-sm">Upload</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm">Reports</TabsTrigger>
            <TabsTrigger value="archive" className="text-xs sm:text-sm">Archive</TabsTrigger>
            {userType === 'organization' && (
              <TabsTrigger value="teams" className="text-xs sm:text-sm">Teams</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <Card className="border-collector-gold/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Recent Transactions</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowAllTransactions(true)}
                      className="text-xs"
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentTransactions.length > 0 ? (
                    <div className="space-y-3">
                      {recentTransactions.map((transaction) => (
                        <div 
                          key={transaction.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{transaction.title}</div>
                            <div className="text-xs text-gray-500">{transaction.category}</div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold text-sm ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}{currencySymbol}{Number(transaction.amount).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">{transaction.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No transactions yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setActiveTab('transactions')}
                      >
                        Add Transaction
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Budgets Overview */}
              <Card className="border-collector-gold/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Budget Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  {budgets.length > 0 ? (
                    <div className="space-y-3">
                      {budgets.slice(0, 3).map((budget) => (
                        <div key={budget.id} className="p-3 rounded-lg border border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{budget.name}</span>
                            <span className="text-sm font-semibold">{currencySymbol}{Number(budget.amount).toLocaleString()}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {budget.category} • {budget.period}
                          </div>
                        </div>
                      ))}
                      {budgets.length > 3 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setActiveTab('budgets')}
                        >
                          View All Budgets
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No budgets created</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setActiveTab('budgets')}
                      >
                        Create Budget
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-collector-gold/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  <Button
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto py-4 border-collector-gold/30 hover:border-collector-orange"
                    onClick={() => setActiveTab('transactions')}
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span className="text-xs">Add Transaction</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto py-4 border-collector-gold/30 hover:border-collector-orange"
                    onClick={() => setActiveTab('budgets')}
                  >
                    <Target className="w-5 h-5" />
                    <span className="text-xs">Create Budget</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto py-4 border-collector-gold/30 hover:border-collector-orange"
                    onClick={() => setShowGenerateInvoice(true)}
                  >
                    <FileText className="w-5 h-5" />
                    <span className="text-xs">Generate Invoice</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto py-4 border-collector-gold/30 hover:border-collector-orange"
                    onClick={() => setShowUploadInvoice(true)}
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-xs">Upload Invoice</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto py-4 border-collector-gold/30 hover:border-collector-orange"
                    onClick={() => setShowReports(true)}
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-xs">View Reports</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto py-4 border-collector-gold/30 hover:border-collector-orange"
                    onClick={handleRefresh}
                  >
                    <Download className="w-5 h-5" />
                    <span className="text-xs">Refresh</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <AddTransactionForm />
          </TabsContent>

          <TabsContent value="budgets">
            <CreateBudgetForm />
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
              open={showReports} 
              onOpenChange={setShowReports} 
            />
          </TabsContent>

          <TabsContent value="archive">
            <ViewArchiveForm 
              open={showArchive} 
              onOpenChange={setShowArchive} 
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
          <Card className="mt-6 border-collector-gold/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-collector-orange" />
                <CardTitle className="text-lg">Expense Sharing</CardTitle>
                <Badge className="bg-gradient-to-r from-orange-400 to-amber-400 text-white text-xs">
                  Premium Feature
                </Badge>
              </div>
              <CardDescription>
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

      {selectedMetric && (
        <MetricDetailsModal
          metrics={selectedMetric}
          open={!!selectedMetric}
          onClose={() => setSelectedMetric(null)}
          currencySymbol={currencySymbol}
        />
      )}

      {showAllTransactions && (
        <AllTransactionsModal
          open={showAllTransactions}
          onOpenChange={setShowAllTransactions}
          currencySymbol={currencySymbol}
        />
      )}
    </div>
  );
};

export default Dashboard;
