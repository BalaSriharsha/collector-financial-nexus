
import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Calendar, FileDown } from "lucide-react";

interface ViewReportsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ViewReportsForm = ({ open, onOpenChange }: ViewReportsFormProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const mockReports = {
    summary: {
      totalIncome: 5200,
      totalExpenses: 3800,
      netSavings: 1400,
      budgetUsed: 75
    },
    categoryBreakdown: [
      { name: "Food & Dining", amount: 800, percentage: 21 },
      { name: "Housing", amount: 1200, percentage: 32 },
      { name: "Transportation", amount: 400, percentage: 11 },
      { name: "Entertainment", amount: 300, percentage: 8 },
      { name: "Utilities", amount: 350, percentage: 9 },
      { name: "Other", amount: 750, percentage: 19 },
    ],
    trends: [
      { month: "Jan", income: 5200, expenses: 3800 },
      { month: "Dec", income: 4800, expenses: 3600 },
      { month: "Nov", income: 5000, expenses: 3900 },
      { month: "Oct", income: 4900, expenses: 3700 },
    ]
  };

  const handleExportPDF = () => {
    console.log("Exporting PDF for period:", selectedPeriod);
    alert(`Exporting ${selectedPeriod} report as PDF`);
  };

  const handleExportCSV = () => {
    console.log("Exporting CSV for period:", selectedPeriod);
    alert(`Exporting ${selectedPeriod} report as CSV`);
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
                  className="text-collector-blue"
                  onClick={handleExportPDF}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-collector-gold"
                  onClick={handleExportCSV}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            <TabsContent value={selectedPeriod} className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="ancient-border bg-white/90">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ${mockReports.summary.totalIncome.toLocaleString()}
                    </div>
                    <p className="text-xs text-green-600">+8% from last period</p>
                  </CardContent>
                </Card>

                <Card className="ancient-border bg-white/90">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      ${mockReports.summary.totalExpenses.toLocaleString()}
                    </div>
                    <p className="text-xs text-red-600">-2% from last period</p>
                  </CardContent>
                </Card>

                <Card className="ancient-border bg-white/90">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
                    <DollarSign className="h-4 w-4 text-collector-gold" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-collector-gold">
                      ${mockReports.summary.netSavings.toLocaleString()}
                    </div>
                    <p className="text-xs text-green-600">+18% from last period</p>
                  </CardContent>
                </Card>

                <Card className="ancient-border bg-white/90">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
                    <PieChart className="h-4 w-4 text-collector-blue" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-collector-blue">
                      {mockReports.summary.budgetUsed}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-gradient h-2 rounded-full"
                        style={{ width: `${mockReports.summary.budgetUsed}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Category Breakdown */}
              <Card className="ancient-border bg-white/90">
                <CardHeader>
                  <CardTitle className="font-playfair">Expense Categories</CardTitle>
                  <CardDescription>Breakdown of your spending by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockReports.categoryBreakdown.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-collector-black">{category.name}</span>
                              <span className="text-sm text-collector-black/70">${category.amount}</span>
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

              {/* Income vs Expenses Trend */}
              <Card className="ancient-border bg-white/90">
                <CardHeader>
                  <CardTitle className="font-playfair">Income vs Expenses Trend</CardTitle>
                  <CardDescription>Monthly comparison over the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockReports.trends.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-collector-gold/20 rounded-lg">
                        <span className="font-medium text-collector-black">{item.month}</span>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm text-green-600">Income: ${item.income.toLocaleString()}</div>
                            <div className="text-sm text-red-600">Expenses: ${item.expenses.toLocaleString()}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-collector-gold">
                              Net: ${(item.income - item.expenses).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ViewReportsForm;
