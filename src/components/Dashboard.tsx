import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  Users,
  Edit,
  Trash2
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AddTransactionForm from "./forms/AddTransactionForm";
import CreateBudgetForm from "./forms/CreateBudgetForm";
import UploadInvoiceForm from "./forms/UploadInvoiceForm";
import ExpenseSharingForm from "./forms/ExpenseSharingForm";
import ViewReportsForm from "./forms/ViewReportsForm";
import ViewArchiveForm from "./forms/ViewArchiveForm";
import AllTransactionsModal from "./AllTransactionsModal";
import TransactionDetailsModal from "./TransactionDetailsModal";
import MetricDetailsModal from "./MetricDetailsModal";
import Navigation from "./Navigation";
import { toast } from "sonner";

interface DashboardProps {
  userType: 'individual' | 'organization';
}

const Dashboard = ({ userType }: DashboardProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [createBudgetOpen, setCreateBudgetOpen] = useState(false);
  const [uploadInvoiceOpen, setUploadInvoiceOpen] = useState(false);
  const [expenseSharingOpen, setExpenseSharingOpen] = useState(false);
  const [viewReportsOpen, setViewReportsOpen] = useState(false);
  const [viewArchiveOpen, setViewArchiveOpen] = useState(false);
  const [allTransactionsOpen, setAllTransactionsOpen] = useState(false);
  const [transactionDetailsOpen, setTransactionDetailsOpen] = useState(false);
  const [metricDetailsOpen, setMetricDetailsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<any>(null);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editingBudget, setEditingBudget] = useState<any>(null);

  // Fetch transactions
  const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch budgets
  const { data: budgetsData, isLoading: isBudgetsLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch invoices
  const { data: invoicesData, isLoading: isInvoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Transaction deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete transaction');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Budget deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete budget');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-collector-black/70">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-playfair font-bold text-collector-black mb-2">
            Welcome back, {user.user_metadata?.full_name || user.email}
          </h1>
          <p className="text-collector-black/70">
            {userType === 'individual' ? 'Manage your personal finances' : 'Manage your organization finances'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Button
            onClick={() => setAddTransactionOpen(true)}
            className="bg-blue-gradient hover:bg-blue-400 text-white flex flex-col items-center p-6 h-auto"
          >
            <Plus className="w-8 h-8 mb-2" />
            <span className="text-sm">Add Transaction</span>
          </Button>

          <Button
            onClick={() => setCreateBudgetOpen(true)}
            className="bg-collector-orange hover:bg-orange-400 text-white flex flex-col items-center p-6 h-auto"
          >
            <DollarSign className="w-8 h-8 mb-2" />
            <span className="text-sm">Create Budget</span>
          </Button>

          <Button
            onClick={() => setUploadInvoiceOpen(true)}
            className="bg-green-600 hover:bg-green-400 text-white flex flex-col items-center p-6 h-auto"
          >
            <Receipt className="w-8 h-8 mb-2" />
            <span className="text-sm">Upload Invoice</span>
          </Button>

          <Button
            onClick={() => setExpenseSharingOpen(true)}
            className="bg-purple-600 hover:bg-purple-400 text-white flex flex-col items-center p-6 h-auto"
          >
            <Users className="w-8 h-8 mb-2" />
            <span className="text-sm">Share Expense</span>
          </Button>

          <Button
            onClick={() => setViewReportsOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-400 text-white flex flex-col items-center p-6 h-auto"
          >
            <TrendingUp className="w-8 h-8 mb-2" />
            <span className="text-sm">View Reports</span>
          </Button>

          <Button
            onClick={() => setViewArchiveOpen(true)}
            className="bg-gray-600 hover:bg-gray-400 text-white flex flex-col items-center p-6 h-auto"
          >
            <TrendingDown className="w-8 h-8 mb-2" />
            <span className="text-sm">View Archive</span>
          </Button>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-collector-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${transactionsData?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0).toFixed(2) || '0.00'}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-collector-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${transactionsData?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0).toFixed(2) || '0.00'}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-collector-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Budgets</CardTitle>
              <DollarSign className="h-4 w-4 text-collector-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-collector-orange">
                {budgetsData?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-collector-gold/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
              <Receipt className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {invoicesData?.filter(i => i.status === 'pending').length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card className="shadow-lg border-collector-gold/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAllTransactionsOpen(true)}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactionsData?.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-collector-black">{transaction.title}</p>
                      <p className="text-sm text-collector-black/60">{transaction.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingTransaction(transaction);
                          setAddTransactionOpen(true);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )) || (
                  <p className="text-collector-black/60 text-center py-4">No transactions yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Budgets */}
          <Card className="shadow-lg border-collector-gold/20">
            <CardHeader>
              <CardTitle>Active Budgets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {budgetsData?.slice(0, 5).map((budget) => (
                  <div key={budget.id} className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-collector-black">{budget.name}</p>
                      <p className="text-sm text-collector-black/60">{budget.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-collector-orange">
                        ${Number(budget.amount).toFixed(2)}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingBudget(budget);
                          setCreateBudgetOpen(true);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )) || (
                  <p className="text-collector-black/60 text-center py-4">No budgets yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <AddTransactionForm 
        open={addTransactionOpen} 
        onOpenChange={setAddTransactionOpen}
        userType={userType}
        editingTransaction={editingTransaction}
        onClose={() => {
          setAddTransactionOpen(false);
          setEditingTransaction(null);
        }}
      />
      <CreateBudgetForm 
        open={createBudgetOpen} 
        onOpenChange={setCreateBudgetOpen}
        userType={userType}
        editingBudget={editingBudget}
        onClose={() => {
          setCreateBudgetOpen(false);
          setEditingBudget(null);
        }}
      />
      <UploadInvoiceForm open={uploadInvoiceOpen} onOpenChange={setUploadInvoiceOpen} />
      <ExpenseSharingForm open={expenseSharingOpen} onOpenChange={setExpenseSharingOpen} userType={userType} />
      <ViewReportsForm open={viewReportsOpen} onOpenChange={setViewReportsOpen} />
      <ViewArchiveForm open={viewArchiveOpen} onOpenChange={setViewArchiveOpen} />
      <AllTransactionsModal 
        open={allTransactionsOpen} 
        onOpenChange={setAllTransactionsOpen}
        transactions={transactionsData || []}
      />
      <TransactionDetailsModal 
        open={transactionDetailsOpen} 
        onOpenChange={setTransactionDetailsOpen}
        transaction={selectedTransaction}
      />
      <MetricDetailsModal 
        open={metricDetailsOpen} 
        onOpenChange={setMetricDetailsOpen}
        metrics={selectedMetrics}
        metricType="income"
        userType={userType}
        period="month"
      />
    </div>
  );
};

export default Dashboard;
