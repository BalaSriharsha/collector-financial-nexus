
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, DollarSign, Users, FileText, PieChart, Calendar } from "lucide-react";

interface DashboardProps {
  userType: 'individual' | 'organization';
}

const Dashboard = ({ userType }: DashboardProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year'>('month');

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50">
      {/* Header */}
      <header className="w-full py-6 px-4 border-b border-collector-gold/20 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-collector-black">
              Financial Dashboard
            </h1>
            <p className="text-collector-black/70 capitalize">
              {userType} • {selectedPeriod === 'month' ? 'This Month' : 'This Year'}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex bg-white rounded-lg border border-collector-gold/20 overflow-hidden">
              <Button
                variant={selectedPeriod === 'month' ? 'default' : 'ghost'}
                className={`rounded-none ${selectedPeriod === 'month' ? 'bg-blue-gradient text-white' : 'text-collector-black'}`}
                onClick={() => setSelectedPeriod('month')}
              >
                Month
              </Button>
              <Button
                variant={selectedPeriod === 'year' ? 'default' : 'ghost'}
                className={`rounded-none ${selectedPeriod === 'year' ? 'bg-blue-gradient text-white' : 'text-collector-black'}`}
                onClick={() => setSelectedPeriod('year')}
              >
                Year
              </Button>
            </div>
            
            <Button className="bg-orange-gradient hover:bg-orange-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {userType === 'individual' ? (
            <>
              <Card className="ancient-border hover-lift bg-white/90 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-collector-black/70">
                    Income
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-collector-blue" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-playfair font-bold text-collector-black">
                    ${individualMetrics.income.amount.toLocaleString()}
                  </div>
                  <p className="text-xs text-green-600 font-medium">
                    {individualMetrics.income.change} from last {selectedPeriod}
                  </p>
                </CardContent>
              </Card>

              <Card className="ancient-border hover-lift bg-white/90 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-collector-black/70">
                    Expenses
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-collector-orange" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-playfair font-bold text-collector-black">
                    ${individualMetrics.expenses.amount.toLocaleString()}
                  </div>
                  <p className="text-xs text-green-600 font-medium">
                    {individualMetrics.expenses.change} from last {selectedPeriod}
                  </p>
                </CardContent>
              </Card>

              <Card className="ancient-border hover-lift bg-white/90 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-collector-black/70">
                    Savings
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-collector-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-playfair font-bold text-collector-black">
                    ${individualMetrics.savings.amount.toLocaleString()}
                  </div>
                  <p className="text-xs text-green-600 font-medium">
                    {individualMetrics.savings.change} from last {selectedPeriod}
                  </p>
                </CardContent>
              </Card>

              <Card className="ancient-border hover-lift bg-white/90 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-collector-black/70">
                    Budget Used
                  </CardTitle>
                  <PieChart className="h-4 w-4 text-collector-blue" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-playfair font-bold text-collector-black">
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
            <>
              <Card className="ancient-border hover-lift bg-white/90 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-collector-black/70">
                    Revenue
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-collector-blue" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-playfair font-bold text-collector-black">
                    ${organizationMetrics.revenue.amount.toLocaleString()}
                  </div>
                  <p className="text-xs text-green-600 font-medium">
                    {organizationMetrics.revenue.change} from last {selectedPeriod}
                  </p>
                </CardContent>
              </Card>

              <Card className="ancient-border hover-lift bg-white/90 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-collector-black/70">
                    Expenses
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-collector-orange" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-playfair font-bold text-collector-black">
                    ${organizationMetrics.expenses.amount.toLocaleString()}
                  </div>
                  <p className="text-xs text-red-600 font-medium">
                    {organizationMetrics.expenses.change} from last {selectedPeriod}
                  </p>
                </CardContent>
              </Card>

              <Card className="ancient-border hover-lift bg-white/90 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-collector-black/70">
                    Profit
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-collector-gold" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-playfair font-bold text-collector-black">
                    ${organizationMetrics.profit.amount.toLocaleString()}
                  </div>
                  <p className="text-xs text-green-600 font-medium">
                    {organizationMetrics.profit.change} from last {selectedPeriod}
                  </p>
                </CardContent>
              </Card>

              <Card className="ancient-border hover-lift bg-white/90 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-collector-black/70">
                    Payroll
                  </CardTitle>
                  <Users className="h-4 w-4 text-collector-blue" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-playfair font-bold text-collector-black">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="ancient-border bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-collector-orange" />
                <span>Quick Add</span>
              </CardTitle>
              <CardDescription>Add income or expenses quickly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-green-600 hover:bg-green-700 text-white">
                <TrendingUp className="w-4 h-4 mr-2" />
                Add Income
              </Button>
              <Button className="w-full justify-start bg-red-600 hover:bg-red-700 text-white">
                <TrendingDown className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </CardContent>
          </Card>

          <Card className="ancient-border bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-collector-gold" />
                <span>Documents</span>
              </CardTitle>
              <CardDescription>Manage your financial documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-collector-blue hover:bg-collector-blue-dark text-white">
                <FileText className="w-4 h-4 mr-2" />
                Upload Invoice
              </Button>
              <Button className="w-full justify-start bg-collector-gold hover:bg-collector-gold-dark text-white">
                <Calendar className="w-4 h-4 mr-2" />
                View Archive
              </Button>
            </CardContent>
          </Card>

          <Card className="ancient-border bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-collector-blue" />
                <span>Budget Planning</span>
              </CardTitle>
              <CardDescription>Plan and track your budget</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-orange-gradient hover:bg-orange-600 text-white">
                <PieChart className="w-4 h-4 mr-2" />
                Create Budget
              </Button>
              <Button className="w-full justify-start bg-gold-gradient hover:bg-amber-600 text-white">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="ancient-border bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Transactions</span>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'income', amount: 2500, description: 'Salary Payment', date: '2024-01-15', category: 'Work' },
                { type: 'expense', amount: 450, description: 'Grocery Shopping', date: '2024-01-14', category: 'Food' },
                { type: 'expense', amount: 120, description: 'Utilities Bill', date: '2024-01-13', category: 'Bills' },
                { type: 'income', amount: 500, description: 'Freelance Project', date: '2024-01-12', category: 'Work' },
              ].map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-collector-gold/20 rounded-lg hover:bg-collector-white/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? 
                        <TrendingUp className="w-5 h-5 text-green-600" /> :
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-collector-black">{transaction.description}</p>
                      <p className="text-sm text-collector-black/60">{transaction.category} • {transaction.date}</p>
                    </div>
                  </div>
                  <div className={`text-lg font-playfair font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
