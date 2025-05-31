
import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Calendar, FileDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface ViewReportsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ViewReportsForm = ({ open, onOpenChange }: ViewReportsFormProps) => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // Fetch real financial data
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['financial-reports', selectedPeriod],
    queryFn: async () => {
      if (!user) return null;

      const now = new Date();
      let startDate: Date;

      // Calculate date range based on selected period
      if (selectedPeriod === "month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (selectedPeriod === "quarter") {
        const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
      } else {
        startDate = new Date(now.getFullYear(), 0, 1);
      }

      // Fetch transactions for the period
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', now.toISOString().split('T')[0]);

      if (transError) throw transError;

      // Fetch budgets for the period
      const { data: budgets, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_date', startDate.toISOString().split('T')[0])
        .lte('end_date', now.toISOString().split('T')[0]);

      if (budgetError) throw budgetError;

      // Calculate summary data
      const income = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const expenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const totalBudget = budgets?.reduce((sum, b) => sum + Number(b.amount), 0) || 0;

      // Calculate category breakdown
      const categoryMap = new Map();
      transactions?.filter(t => t.type === 'expense').forEach(t => {
        const category = t.category;
        categoryMap.set(category, (categoryMap.get(category) || 0) + Number(t.amount));
      });

      const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, amount]) => ({
        name,
        amount,
        percentage: expenses > 0 ? Math.round((amount / expenses) * 100) : 0
      }));

      // Calculate trends (last 4 periods)
      const trends = [];
      for (let i = 3; i >= 0; i--) {
        let periodStart: Date, periodEnd: Date;
        
        if (selectedPeriod === "month") {
          periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        } else if (selectedPeriod === "quarter") {
          const quarterStart = Math.floor(now.getMonth() / 3) * 3 - (i * 3);
          periodStart = new Date(now.getFullYear(), quarterStart, 1);
          periodEnd = new Date(now.getFullYear(), quarterStart + 3, 0);
        } else {
          periodStart = new Date(now.getFullYear() - i, 0, 1);
          periodEnd = new Date(now.getFullYear() - i, 11, 31);
        }

        const periodTransactions = transactions?.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= periodStart && tDate <= periodEnd;
        }) || [];

        const periodIncome = periodTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
        const periodExpenses = periodTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

        trends.push({
          month: periodStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          income: periodIncome,
          expenses: periodExpenses
        });
      }

      return {
        summary: {
          totalIncome: income,
          totalExpenses: expenses,
          netSavings: income - expenses,
          budgetUsed: totalBudget > 0 ? Math.round((expenses / totalBudget) * 100) : 0
        },
        categoryBreakdown,
        trends,
        transactions: transactions || [],
        budgets: budgets || []
      };
    },
    enabled: !!user && open,
  });

  const handleExportPDF = async () => {
    try {
      if (!reportData) {
        toast.error('No data available to export');
        return;
      }

      // Create PDF content
      const pdfContent = `
FINANCIAL REPORT - ${selectedPeriod.toUpperCase()}
Generated on: ${new Date().toLocaleDateString()}

SUMMARY:
- Total Income: $${reportData.summary.totalIncome.toLocaleString()}
- Total Expenses: $${reportData.summary.totalExpenses.toLocaleString()}
- Net Savings: $${reportData.summary.netSavings.toLocaleString()}
- Budget Used: ${reportData.summary.budgetUsed}%

CATEGORY BREAKDOWN:
${reportData.categoryBreakdown.map(cat => 
  `- ${cat.name}: $${cat.amount.toLocaleString()} (${cat.percentage}%)`
).join('\n')}

TRENDS:
${reportData.trends.map(trend => 
  `${trend.month}: Income $${trend.income.toLocaleString()}, Expenses $${trend.expenses.toLocaleString()}`
).join('\n')}
      `;

      // Create and download file
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`${selectedPeriod} report exported successfully!`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export report');
    }
  };

  const handleExportCSV = async () => {
    try {
      if (!reportData) {
        toast.error('No data available to export');
        return;
      }

      // Create CSV content
      let csvContent = "Type,Date,Title,Category,Amount\n";
      
      reportData.transactions.forEach(transaction => {
        csvContent += `${transaction.type},${transaction.date},"${transaction.title}","${transaction.category}",${transaction.amount}\n`;
      });

      csvContent += "\n\nCategory Breakdown\n";
      csvContent += "Category,Amount,Percentage\n";
      reportData.categoryBreakdown.forEach(category => {
        csvContent += `"${category.name}",${category.amount},${category.percentage}%\n`;
      });

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-data-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`${selectedPeriod} data exported as CSV successfully!`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-playfair text-collector-black">Financial Reports</SheetTitle>
          <SheetDescription>
            Analyze your financial patterns and gain insights into your spending habits.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="month">This Month</TabsTrigger>
                <TabsTrigger value="quarter">Quarter</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-collector-blue hover:bg-blue-200 transition-all duration-200"
                  onClick={handleExportPDF}
                  disabled={isLoading || !reportData}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-collector-gold hover:bg-yellow-200 transition-all duration-200"
                  onClick={handleExportCSV}
                  disabled={isLoading || !reportData}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            <TabsContent value={selectedPeriod} className="space-y-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-collector-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-collector-black/70">Loading report data...</p>
                </div>
              ) : reportData ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="ancient-border bg-white/90">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          ${reportData.summary.totalIncome.toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="ancient-border bg-white/90">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                          ${reportData.summary.totalExpenses.toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="ancient-border bg-white/90">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
                        <DollarSign className="h-4 w-4 text-collector-gold" />
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${reportData.summary.netSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${reportData.summary.netSavings.toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="ancient-border bg-white/90">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
                        <PieChart className="h-4 w-4 text-collector-blue" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-collector-blue">
                          {reportData.summary.budgetUsed}%
                        </div>
                        {reportData.summary.budgetUsed > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className="bg-blue-gradient h-2 rounded-full"
                              style={{ width: `${Math.min(reportData.summary.budgetUsed, 100)}%` }}
                            ></div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Category Breakdown */}
                  {reportData.categoryBreakdown.length > 0 && (
                    <Card className="ancient-border bg-white/90">
                      <CardHeader>
                        <CardTitle className="font-playfair">Expense Categories</CardTitle>
                        <CardDescription>Breakdown of your spending by category</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {reportData.categoryBreakdown.map((category, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <div className="flex-1">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-collector-black">{category.name}</span>
                                    <span className="text-sm text-collector-black/70">${category.amount.toLocaleString()}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-orange-gradient h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${category.percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <span className="text-sm font-medium text-collector-black/70 ml-3">
                                  {category.percentage}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Income vs Expenses Trend */}
                  {reportData.trends.length > 0 && (
                    <Card className="ancient-border bg-white/90">
                      <CardHeader>
                        <CardTitle className="font-playfair">Income vs Expenses Trend</CardTitle>
                        <CardDescription>Comparison over the selected period</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {reportData.trends.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border border-collector-gold/20 rounded-lg">
                              <span className="font-medium text-collector-black">{item.month}</span>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-sm text-green-600">Income: ${item.income.toLocaleString()}</div>
                                  <div className="text-sm text-red-600">Expenses: ${item.expenses.toLocaleString()}</div>
                                </div>
                                <div className="text-right">
                                  <div className={`text-sm font-medium ${(item.income - item.expenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    Net: ${(item.income - item.expenses).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="ancient-border bg-white/90">
                  <CardContent className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-collector-black/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-collector-black/70 mb-2">No data available</h3>
                    <p className="text-collector-black/50">Add some transactions to see your financial reports</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="hover:bg-gray-200 transition-all duration-200">
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ViewReportsForm;
