import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, DollarSign, Users, FileText, PieChart, Calendar, Coins, X } from "lucide-react";
import AddTransactionForm from "@/components/forms/AddTransactionForm";
import UploadInvoiceForm from "@/components/forms/UploadInvoiceForm";
import CreateBudgetForm from "@/components/forms/CreateBudgetForm";
import ViewArchiveForm from "@/components/forms/ViewArchiveForm";
import ViewReportsForm from "@/components/forms/ViewReportsForm";
import ExpenseSharingForm from "@/components/forms/ExpenseSharingForm";
import MetricDetailsModal from "@/components/MetricDetailsModal";
import TransactionDetailsModal from "@/components/TransactionDetailsModal";
import AllTransactionsModal from "@/components/AllTransactionsModal";

interface DashboardProps {
  userType: 'individual' | 'organization';
}

const Dashboard = ({ userType }: DashboardProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showUploadInvoice, setShowUploadInvoice] = useState(false);
  const [showCreateBudget, setShowCreateBudget] = useState(false);
  const [showViewArchive, setShowViewArchive] = useState(false);
  const [showViewReports, setShowViewReports] = useState(false);
  const [showExpenseSharing, setShowExpenseSharing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const individualMetrics = {
    income: { amount: 5200, change: '+12%' },
    expenses: { amount: 3800, change: '-5%' },
    savings: { amount: 1400, change: '+18%' },
    budget: { used: 75, total: 100 }
  };

  const organizationMetrics = {
    revenue: { amount: 125000, change: '+8%' },
    expenses: { amount: 89000, change: '+3%' },
    profit: { amount: 36000, change: '+15%' },
    payroll: { amount: 45000, employees: 12 }
  };

  const transactions = [
    { id: 1, type: 'income', amount: 2500, description: 'Salary Payment', date: '2024-01-15', category: 'Work' },
    { id: 2, type: 'expense', amount: 450, description: 'Grocery Shopping', date: '2024-01-14', category: 'Food' },
    { id: 3, type: 'expense', amount: 120, description: 'Utilities Bill', date: '2024-01-13', category: 'Bills' },
    { id: 4, type: 'income', amount: 500, description: 'Freelance Project', date: '2024-01-12', category: 'Work' },
  ];

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

  const handleTransactionClick = (transaction: any) => {
    setSelectedTransaction(transaction);
  };

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
                    ${individualMetrics.income.amount.toLocaleString()}
                  </div>
                  <p className="text-xs text-green-600 font-medium">
                    {individualMetrics.income.change} from last {selectedPeriod}
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
                    ${individualMetrics.expenses.amount.toLocaleString()}
                  </div>
                  <p className="text-xs text-green-600 font-medium">
                    {individualMetrics.expenses.change} from last {selectedPeriod}
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
                    ${individualMetrics.savings.amount.toLocaleString()}
                  </div>
                  <p className="text-xs text-green-600 font-medium">
                    {individualMetrics.savings.change} from last {selectedPeriod}
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
                    {individualMetrics.budget.used}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-orange-gradient h-2 rounded-full transition-all duration-500"
                      style={{ width: `${individualMetrics.budget.used}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            // ... keep existing code (organization metrics with click handlers)
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
                    ${organizationMetrics.revenue.amount.toLocaleString()}
                  </div>
                  <p className="text-xs text-green-600 font-medium">
                    {organizationMetrics.revenue.change} from last {selectedPeriod}
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
                    ${organizationMetrics.expenses.amount.toLocaleString()}
                  </div>
                  <p className="text-xs text-red-600 font-medium">
                    {organizationMetrics.expenses.change} from last {selectedPeriod}
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
                    ${organizationMetrics.profit.amount.toLocaleString()}
                  </div>
                  <p className="text-xs text-green-600 font-medium">
                    {organizationMetrics.profit.change} from last {selectedPeriod}
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
                    ${organizationMetrics.payroll.amount.toLocaleString()}
                  </div>
                  <p className="text-xs text-collector-black/70">
                    {organizationMetrics.payroll.employees} employees
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
              {transactions.map((transaction, index) => (
                <div 
                  key={index} 
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
                      <p className="font-medium text-collector-black text-sm lg:text-base">{transaction.description}</p>
                      <p className="text-sm text-collector-black/60">{transaction.category} • {transaction.date}</p>
                    </div>
                  </div>
                  <div className={`text-lg lg:text-xl font-playfair font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  } text-right sm:text-left`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                  </div>
                </div>
              ))}
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
