
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, DollarSign, Users, FileText, PieChart, Calendar, Coins } from "lucide-react";
import AddTransactionForm from "@/components/forms/AddTransactionForm";
import UploadInvoiceForm from "@/components/forms/UploadInvoiceForm";
import CreateBudgetForm from "@/components/forms/CreateBudgetForm";
import ViewArchiveForm from "@/components/forms/ViewArchiveForm";
import ViewReportsForm from "@/components/forms/ViewReportsForm";
import ExpenseSharingForm from "@/components/forms/ExpenseSharingForm";
import MetricDetailsModal from "@/components/MetricDetailsModal";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";
import AllTransactionsModal from "@/components/AllTransactionsModal";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DashboardProps {
  userType: 'individual' | 'organization';
}

interface Transaction {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  created_at: string;
}

interface Metrics {
  income?: number;
  expenses?: number;
  savings?: number;
  budget?: { used: number; total: number };
  revenue?: number;
  profit?: number;
  payroll?: { amount: number; employees: number };
}

const Dashboard = ({ userType }: DashboardProps) => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showUploadInvoice, setShowUploadInvoice] = useState(false);
  const [showCreateBudget, setShowCreateBudget] = useState(false);
  const [showViewArchive, setShowViewArchive] = useState(false);
  const [showViewReports, setShowViewReports] = useState(false);
  const [showExpenseSharing, setShowExpenseSharing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  
  // Data states
  const [metrics, setMetrics] = useState<Metrics>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationMembers, setOrganizationMembers] = useState(0);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, selectedPeriod]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await Promise.all([
        fetchTransactions(),
        fetchMetrics(),
        userType === 'organization' ? fetchOrganizationData() : Promise.resolve()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching transactions:', error);
      return;
    }

    setTransactions(data || []);
  };

  const fetchMetrics = async () => {
    if (!user) return;

    // Get date range based on selected period
    const now = new Date();
    let startDate = new Date();
    
    switch (selectedPeriod) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const { data: transactionData, error } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching metrics:', error);
      return;
    }

    const income = transactionData?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const expenses = transactionData?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const savings = income - expenses;

    // Fetch budget data
    const { data: budgetData } = await supabase
      .from('budgets')
      .select('amount')
      .eq('user_id', user.id);

    const totalBudget = budgetData?.reduce((sum, b) => sum + Number(b.amount), 0) || 1000; // Default budget if none set
    const budgetUsed = Math.min((expenses / totalBudget) * 100, 100);

    if (userType === 'individual') {
      setMetrics({
        income,
        expenses,
        savings,
        budget: { used: Math.round(budgetUsed), total: totalBudget }
      });
    } else {
      setMetrics({
        revenue: income,
        expenses,
        profit: savings,
        payroll: { amount: 0, employees: organizationMembers } // Payroll would need separate tracking
      });
    }
  };

  const fetchOrganizationData = async () => {
    if (!user) return;

    const { data: orgData } = await supabase
      .from('organizations')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (orgData) {
      const { data: membersData } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', orgData.id);

      setOrganizationMembers(membersData?.length || 0);
    }
  };

  const getPeriodLabel = () => {
    switch(selectedPeriod) {
      case 'day': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'This Month';
    }
  };

  const handleMetricClick = (metricType: string) => {
    setSelectedMetric(metricType);
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-collector-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-collector-black/70">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full py-4 px-4 border-b-2 border-collector-gold/30 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-gradient rounded-xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-playfair font-bold text-collector-black">
                  Collector
                </h1>
                <p className="text-collector-black/70 capitalize text-sm lg:text-base">
                  {userType} • {getPeriodLabel()}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex bg-white rounded-lg border-2 border-collector-gold/30 overflow-hidden shadow-sm">
                {(['day', 'week', 'month', 'year'] as const).map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? 'default' : 'ghost'}
                    className={`rounded-none text-xs sm:text-sm px-2 sm:px-4 border-r border-collector-gold/20 last:border-r-0 ${
                      selectedPeriod === period ? 'bg-blue-gradient text-white border-2 border-blue-400' : 'text-collector-black hover:bg-collector-blue/10'
                    }`}
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Button>
                ))}
              </div>
              
              <Button 
                className="bg-orange-gradient hover:bg-orange-600 text-white text-sm border-2 border-transparent hover:border-orange-300 shadow-md"
                onClick={() => setShowAddTransaction(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {userType === 'individual' ? (
            <>
              <Card 
                className="border-2 border-collector-gold/30 hover-lift bg-white/90 backdrop-blur-sm shadow-md cursor-pointer hover:border-collector-blue transition-all"
                onClick={() => handleMetricClick('income')}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-collector-black/70">
                    Income
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-collector-blue" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl lg:text-2xl font-playfair font-bold text-collector-black">
                    {formatCurrency(metrics.income || 0)}
                  </div>
                  <p className="text-xs text-collector-black/60">
                    {getPeriodLabel().toLowerCase()}
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="border-2 border-collector-gold/30 hover-lift bg-white/90 backdrop-blur-sm shadow-md cursor-pointer hover:border-collector-orange transition-all"
                onClick={() => handleMetricClick('expenses')}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-collector-black/70">
                    Expenses
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-collector-orange" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl lg:text-2xl font-playfair font-bold text-collector-black">
                    {formatCurrency(metrics.expenses || 0)}
                  </div>
                  <p className="text-xs text-collector-black/60">
                    {getPeriodLabel().toLowerCase()}
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="border-2 border-collector-gold/30 hover-lift bg-white/90 backdrop-blur-sm shadow-md cursor-pointer hover:border-collector-gold transition-all"
                onClick={() => handleMetricClick('savings')}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-collector-black/70">
                    Savings
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-collector-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl lg:text-2xl font-playfair font-bold text-collector-black">
                    {formatCurrency(metrics.savings || 0)}
                  </div>
                  <p className="text-xs text-collector-black/60">
                    {getPeriodLabel().toLowerCase()}
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="border-2 border-collector-gold/30 hover-lift bg-white/90 backdrop-blur-sm shadow-md cursor-pointer hover:border-collector-blue transition-all"
                onClick={() => handleMetricClick('budget')}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-collector-black/70">
                    Budget Used
                  </CardTitle>
                  <PieChart className="h-4 w-4 text-collector-blue" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl lg:text-2xl font-playfair font-bold text-collector-black">
                    {metrics.budget?.used || 0}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-orange-gradient h-2 rounded-full transition-all duration-500"
                      style={{ width: `${metrics.budget?.used || 0}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card 
                className="border-2 border-collector-gold/30 hover-lift bg-white/90 backdrop-blur-sm shadow-md cursor-pointer hover:border-collector-blue transition-all"
                onClick={() => handleMetricClick('revenue')}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-collector-black/70">
                    Revenue
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-collector-blue" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl lg:text-2xl font-playfair font-bold text-collector-black">
                    {formatCurrency(metrics.revenue || 0)}
                  </div>
                  <p className="text-xs text-collector-black/60">
                    {getPeriodLabel().toLowerCase()}
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="border-2 border-collector-gold/30 hover-lift bg-white/90 backdrop-blur-sm shadow-md cursor-pointer hover:border-collector-orange transition-all"
                onClick={() => handleMetricClick('expenses')}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-collector-black/70">
                    Expenses
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-collector-orange" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl lg:text-2xl font-playfair font-bold text-collector-black">
                    {formatCurrency(metrics.expenses || 0)}
                  </div>
                  <p className="text-xs text-collector-black/60">
                    {getPeriodLabel().toLowerCase()}
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="border-2 border-collector-gold/30 hover-lift bg-white/90 backdrop-blur-sm shadow-md cursor-pointer hover:border-collector-gold transition-all"
                onClick={() => handleMetricClick('profit')}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-collector-black/70">
                    Profit
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-collector-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl lg:text-2xl font-playfair font-bold text-collector-black">
                    {formatCurrency(metrics.profit || 0)}
                  </div>
                  <p className="text-xs text-collector-black/60">
                    {getPeriodLabel().toLowerCase()}
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="border-2 border-collector-gold/30 hover-lift bg-white/90 backdrop-blur-sm shadow-md cursor-pointer hover:border-collector-blue transition-all"
                onClick={() => handleMetricClick('payroll')}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-collector-black/70">
                    Payroll
                  </CardTitle>
                  <Users className="h-4 w-4 text-collector-blue" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl lg:text-2xl font-playfair font-bold text-collector-black">
                    {formatCurrency(metrics.payroll?.amount || 0)}
                  </div>
                  <p className="text-xs text-collector-black/70">
                    {metrics.payroll?.employees || 0} employees
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card className="border-2 border-collector-gold/30 bg-white/90 backdrop-blur-sm shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Plus className="w-5 h-5 text-collector-orange" />
                <span>Quick Add</span>
              </CardTitle>
              <CardDescription>Add income or expenses quickly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start bg-green-600 hover:bg-green-700 text-white text-sm border-2 border-transparent hover:border-green-400 shadow-sm"
                onClick={() => setShowAddTransaction(true)}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Add Income
              </Button>
              <Button 
                className="w-full justify-start bg-red-600 hover:bg-red-700 text-white text-sm border-2 border-transparent hover:border-red-400 shadow-sm"
                onClick={() => setShowAddTransaction(true)}
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-collector-gold/30 bg-white/90 backdrop-blur-sm shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <FileText className="w-5 h-5 text-collector-gold" />
                <span>Documents</span>
              </CardTitle>
              <CardDescription>Manage your financial documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start bg-collector-blue hover:bg-collector-blue-dark text-white text-sm border-2 border-transparent hover:border-blue-400 shadow-sm"
                onClick={() => setShowUploadInvoice(true)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Upload Invoice
              </Button>
              <Button 
                className="w-full justify-start bg-collector-gold hover:bg-collector-gold-dark text-white text-sm border-2 border-transparent hover:border-yellow-400 shadow-sm"
                onClick={() => setShowViewArchive(true)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                View Archive
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-collector-gold/30 bg-white/90 backdrop-blur-sm shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Users className="w-5 h-5 text-collector-blue" />
                <span>Sharing & Budget</span>
              </CardTitle>
              <CardDescription>Share expenses and plan budget</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white text-sm border-2 border-transparent hover:border-purple-400 shadow-sm"
                onClick={() => setShowExpenseSharing(true)}
              >
                <Users className="w-4 h-4 mr-2" />
                Share Expense
              </Button>
              <Button 
                className="w-full justify-start bg-orange-gradient hover:bg-orange-600 text-white text-sm border-2 border-transparent hover:border-orange-300 shadow-sm"
                onClick={() => setShowCreateBudget(true)}
              >
                <PieChart className="w-4 h-4 mr-2" />
                Create Budget
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="border-2 border-collector-gold/30 bg-white/90 backdrop-blur-sm shadow-md">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <span className="text-lg lg:text-xl">Recent Transactions</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full sm:w-auto border-2 border-collector-gold/30 hover:border-collector-orange hover:bg-collector-orange/5"
                onClick={() => setShowAllTransactions(true)}
              >
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-collector-black/60">
                  <p>No transactions found. Add your first transaction to get started!</p>
                  <Button 
                    className="mt-4 bg-blue-gradient hover:bg-blue-600 text-white"
                    onClick={() => setShowAddTransaction(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Transaction
                  </Button>
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-2 border-collector-gold/20 rounded-lg hover:bg-collector-white/50 transition-colors gap-3 shadow-sm cursor-pointer hover:border-collector-blue"
                    onClick={() => handleTransactionClick(transaction)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        transaction.type === 'income' ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
                      }`}>
                        {transaction.type === 'income' ? 
                          <TrendingUp className="w-5 h-5 text-green-600" /> :
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        }
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-collector-black text-sm lg:text-base">
                          {transaction.title || 'No title'}
                        </p>
                        <p className="text-sm text-collector-black/60">
                          {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={`text-lg lg:text-xl font-playfair font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    } text-right sm:text-left`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Form Modals */}
      <AddTransactionForm 
        open={showAddTransaction} 
        onOpenChange={setShowAddTransaction} 
      />
      <UploadInvoiceForm 
        open={showUploadInvoice} 
        onOpenChange={setShowUploadInvoice} 
      />
      <CreateBudgetForm 
        open={showCreateBudget} 
        onOpenChange={setShowCreateBudget} 
      />
      <ViewArchiveForm 
        open={showViewArchive} 
        onOpenChange={setShowViewArchive} 
      />
      <ViewReportsForm 
        open={showViewReports} 
        onOpenChange={setShowViewReports} 
      />
      <ExpenseSharingForm 
        open={showExpenseSharing} 
        onOpenChange={setShowExpenseSharing}
        userType={userType}
      />

      {/* Detail Modals */}
      <MetricDetailsModal 
        open={!!selectedMetric}
        onOpenChange={() => setSelectedMetric(null)}
        metricType={selectedMetric}
        userType={userType}
        period={selectedPeriod}
        metrics={metrics}
      />
      <TransactionDetailsModal
        open={!!selectedTransaction}
        onOpenChange={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
      />
      <AllTransactionsModal
        open={showAllTransactions}
        onOpenChange={setShowAllTransactions}
        transactions={transactions}
      />
    </div>
  );
};

export default Dashboard;
