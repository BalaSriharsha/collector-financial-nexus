
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  Users,
  Calendar,
  Target,
  Receipt,
  Plus,
  Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AddTransactionForm from "./forms/AddTransactionForm";
import CreateBudgetForm from "./forms/CreateBudgetForm";
import ExpenseSharingForm from "./forms/ExpenseSharingForm";
import GenerateInvoiceForm from "./forms/GenerateInvoiceForm";
import UploadInvoiceForm from "./forms/UploadInvoiceForm";
import ViewReportsForm from "./forms/ViewReportsForm";
import ViewArchiveForm from "./forms/ViewArchiveForm";
import OrganizationTeams from "./OrganizationTeams";
import StatsDetailsModal from "./StatsDetailsModal";
import ViewAllModal from "./ViewAllModal";

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

interface Budget {
  id: string;
  name: string;
  amount: number;
  category: string;
  start_date: string;
  end_date: string;
  period: string;
}

interface DashboardProps {
  userType: 'individual' | 'organization';
}

const Dashboard = ({ userType }: DashboardProps) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [statsModal, setStatsModal] = useState<{
    type: 'income' | 'expense' | 'balance' | 'transactions';
    isOpen: boolean;
  }>({ type: 'income', isOpen: false });
  const [viewAllModal, setViewAllModal] = useState<{
    type: 'transactions' | 'budgets';
    isOpen: boolean;
  }>({ type: 'transactions', isOpen: false });

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchBudgets();
    }
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchBudgets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const recentTransactions = transactions.slice(0, 4);
  const recentBudgets = budgets.slice(0, 4);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const openStatsModal = (type: 'income' | 'expense' | 'balance' | 'transactions') => {
    setStatsModal({ type, isOpen: true });
  };

  const openViewAllModal = (type: 'transactions' | 'budgets') => {
    setViewAllModal({ type, isOpen: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-collector-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-collector-black/70 dark:text-white/70">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-collector-black dark:text-white">
              {userType === 'individual' ? 'Personal' : 'Organization'} Dashboard
            </h1>
            <p className="text-collector-black/70 dark:text-white/70 text-sm sm:text-base">
              Manage your finances and track your progress
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setActiveModal('add-transaction')}
              className="bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveModal('create-budget')}
              className="text-xs sm:text-sm"
            >
              <Target className="w-4 h-4 mr-2" />
              Create Budget
            </Button>
          </div>
        </div>

        {/* Stats Cards - Single Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card 
            className="shadow-sm border-collector-gold/20 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => openStatsModal('income')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-collector-black/70 dark:text-white/70 font-medium">Total Income</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="shadow-sm border-collector-gold/20 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => openStatsModal('expense')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-collector-black/70 dark:text-white/70 font-medium">Total Expenses</p>
                  <p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(totalExpenses)}
                  </p>
                </div>
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="shadow-sm border-collector-gold/20 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => openStatsModal('balance')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-collector-black/70 dark:text-white/70 font-medium">Balance</p>
                  <p className={`text-lg sm:text-2xl font-bold ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(balance)}
                  </p>
                </div>
                <DollarSign className={`w-6 h-6 ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="shadow-sm border-collector-gold/20 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => openStatsModal('transactions')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-collector-black/70 dark:text-white/70 font-medium">Transactions</p>
                  <p className="text-lg sm:text-2xl font-bold text-collector-black dark:text-white">
                    {transactions.length}
                  </p>
                </div>
                <Receipt className="w-6 h-6 text-collector-orange" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card className="shadow-sm border-collector-gold/20 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg dark:text-white">Recent Transactions</CardTitle>
                <CardDescription className="dark:text-gray-400">Your latest financial activity</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openViewAllModal('transactions')}
                className="text-xs"
              >
                <Eye className="w-3 h-3 mr-1" />
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex-1">
                        <p className="font-medium text-sm dark:text-white">{transaction.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {transaction.category}
                          </Badge>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(transaction.date)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${
                          transaction.type === 'income' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
                  No transactions found. Add your first transaction to get started.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Budget Overview */}
          <Card className="shadow-sm border-collector-gold/20 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg dark:text-white">Budget Overview</CardTitle>
                <CardDescription className="dark:text-gray-400">Track your spending limits</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openViewAllModal('budgets')}
                className="text-xs"
              >
                <Eye className="w-3 h-3 mr-1" />
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {recentBudgets.length > 0 ? (
                <div className="space-y-3">
                  {recentBudgets.map((budget) => {
                    const spent = transactions
                      .filter(t => t.type === 'expense' && t.category === budget.category)
                      .reduce((sum, t) => sum + t.amount, 0);
                    const percentage = (spent / budget.amount) * 100;

                    return (
                      <div key={budget.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-sm dark:text-white">{budget.name}</h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                          <div 
                            className={`h-2 rounded-full ${
                              percentage > 100 ? 'bg-red-500' : 
                              percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-xs">
                            {budget.category}
                          </Badge>
                          <span className={`text-xs font-medium ${
                            percentage > 100 ? 'text-red-500' : 
                            percentage > 80 ? 'text-yellow-500' : 'text-green-500'
                          }`}>
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
                  No budgets found. Create your first budget to start tracking.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Organization Teams - Only show for organization users */}
        {userType === 'organization' && <OrganizationTeams onCreateInvoice={() => setActiveModal('generate-invoice')} />}

        {/* Quick Actions */}
        <Card className="shadow-sm border-collector-gold/20 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">Quick Actions</CardTitle>
            <CardDescription className="dark:text-gray-400">Common tasks and tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <Button
                variant="outline"
                onClick={() => setActiveModal('expense-sharing')}
                className="h-auto flex-col p-4 text-xs"
              >
                <Users className="w-6 h-6 mb-2 text-collector-orange" />
                Share Expense
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveModal('generate-invoice')}
                className="h-auto flex-col p-4 text-xs"
              >
                <Receipt className="w-6 h-6 mb-2 text-collector-orange" />
                Generate Invoice
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveModal('upload-invoice')}
                className="h-auto flex-col p-4 text-xs"
              >
                <CreditCard className="w-6 h-6 mb-2 text-collector-orange" />
                Upload Invoice
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveModal('view-reports')}
                className="h-auto flex-col p-4 text-xs"
              >
                <TrendingUp className="w-6 h-6 mb-2 text-collector-orange" />
                View Reports
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveModal('view-archive')}
                className="h-auto flex-col p-4 text-xs"
              >
                <Calendar className="w-6 h-6 mb-2 text-collector-orange" />
                View Archive
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {activeModal === 'add-transaction' && (
        <AddTransactionForm
          open={true}
          onOpenChange={(open) => !open && setActiveModal(null)}
          userType={userType}
          onClose={() => setActiveModal(null)}
          onTransactionAdded={() => {
            setActiveModal(null);
            fetchTransactions();
          }}
        />
      )}

      {activeModal === 'create-budget' && (
        <CreateBudgetForm
          open={true}
          onOpenChange={(open) => !open && setActiveModal(null)}
          userType={userType}
          onClose={() => setActiveModal(null)}
          onBudgetCreated={() => {
            setActiveModal(null);
            fetchBudgets();
          }}
        />
      )}

      {activeModal === 'expense-sharing' && (
        <ExpenseSharingForm
          open={true}
          onOpenChange={(open) => !open && setActiveModal(null)}
          userType={userType}
        />
      )}

      {activeModal === 'generate-invoice' && (
        <GenerateInvoiceForm
          open={true}
          onOpenChange={(open) => !open && setActiveModal(null)}
        />
      )}

      {activeModal === 'upload-invoice' && (
        <UploadInvoiceForm
          open={true}
          onOpenChange={(open) => !open && setActiveModal(null)}
        />
      )}

      {activeModal === 'view-reports' && (
        <ViewReportsForm
          open={true}
          onOpenChange={(open) => !open && setActiveModal(null)}
        />
      )}

      {activeModal === 'view-archive' && (
        <ViewArchiveForm
          open={true}
          onOpenChange={(open) => !open && setActiveModal(null)}
          userType={userType}
        />
      )}

      {/* Stats Details Modal */}
      <StatsDetailsModal
        open={statsModal.isOpen}
        onOpenChange={(open) => setStatsModal({ ...statsModal, isOpen: open })}
        type={statsModal.type}
        value={statsModal.type === 'income' ? totalIncome : 
               statsModal.type === 'expense' ? totalExpenses :
               statsModal.type === 'balance' ? balance : transactions.length}
        transactions={transactions}
      />

      {/* View All Modal */}
      <ViewAllModal
        open={viewAllModal.isOpen}
        onOpenChange={(open) => setViewAllModal({ ...viewAllModal, isOpen: open })}
        type={viewAllModal.type}
        data={viewAllModal.type === 'transactions' ? transactions : budgets}
      />
    </div>
  );
};

export default Dashboard;
