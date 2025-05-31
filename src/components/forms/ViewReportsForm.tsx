
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, Calendar, DollarSign, TrendingUp, TrendingDown, PieChart } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { generatePDF } from "@/utils/pdfGenerator";

interface ViewReportsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ViewReportsForm = ({ open, onOpenChange }: ViewReportsFormProps) => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState<'transactions' | 'budgets' | 'summary'>('summary');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'custom'>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    let start: Date, end: Date;

    switch (dateRange) {
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
        break;
      case 'quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        start = new Date(now.getFullYear(), quarterStart, 1);
        end = now;
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end = now;
        break;
      case 'custom':
        start = startDate ? new Date(startDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        end = endDate ? new Date(endDate) : now;
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
    }

    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
  };

  const { start, end } = getDateRange();

  // Fetch transactions data
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions-report', user?.id, start, end],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && open,
  });

  // Fetch budgets data
  const { data: budgets = [], isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets-report', user?.id, start, end],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_date', start)
        .lte('end_date', end)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && open,
  });

  // Calculate summary data
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const netAmount = totalIncome - totalExpenses;
  const totalBudgets = budgets.reduce((sum, b) => sum + Number(b.amount), 0);

  // Category breakdown
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const incomeByCategory = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const downloadCSV = (data: any[], filename: string, type: 'transactions' | 'budgets') => {
    let csvContent = '';
    
    if (type === 'transactions') {
      csvContent = 'Date,Title,Type,Category,Amount,Description\n';
      csvContent += data.map(t => 
        `${t.date},${t.title},${t.type},${t.category},${t.amount},"${t.description || ''}"`
      ).join('\n');
    } else {
      csvContent = 'Name,Category,Period,Start Date,End Date,Amount\n';
      csvContent += data.map(b => 
        `${b.name},${b.category},${b.period},${b.start_date},${b.end_date},${b.amount}`
      ).join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (reportType === 'transactions') {
      generatePDF(transactions, `Transaction Report - ${start} to ${end}`, 'transactions');
    } else if (reportType === 'budgets') {
      generatePDF(budgets, `Budget Report - ${start} to ${end}`, 'budgets');
    } else {
      // Generate summary report
      const summaryData = [
        { label: 'Total Income', value: `$${totalIncome.toFixed(2)}` },
        { label: 'Total Expenses', value: `$${totalExpenses.toFixed(2)}` },
        { label: 'Net Amount', value: `$${netAmount.toFixed(2)}` },
        { label: 'Total Budgets', value: `$${totalBudgets.toFixed(2)}` },
      ];
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Financial Summary Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                h1 { color: #1e40af; border-bottom: 2px solid #f97316; padding-bottom: 10px; }
                .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
                .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #f9f9f9; }
                .summary-value { font-size: 24px; font-weight: bold; color: #1e40af; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f8f9fa; }
            </style>
        </head>
        <body>
            <h1>Financial Summary Report</h1>
            <p>Period: ${start} to ${end}</p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            
            <div class="summary-grid">
                ${summaryData.map(item => `
                    <div class="summary-card">
                        <div>${item.label}</div>
                        <div class="summary-value">${item.value}</div>
                    </div>
                `).join('')}
            </div>

            <h2>Expense Breakdown by Category</h2>
            <table>
                <thead><tr><th>Category</th><th>Amount</th></tr></thead>
                <tbody>
                    ${Object.entries(expensesByCategory).map(([category, amount]) => `
                        <tr><td>${category.charAt(0).toUpperCase() + category.slice(1)}</td><td>$${amount.toFixed(2)}</td></tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'financial_summary_report.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    
    toast.success('Report downloaded successfully!');
  };

  const handleDownloadCSV = () => {
    if (reportType === 'transactions') {
      downloadCSV(transactions, `transactions_${start}_to_${end}`, 'transactions');
    } else if (reportType === 'budgets') {
      downloadCSV(budgets, `budgets_${start}_to_${end}`, 'budgets');
    }
    
    toast.success('CSV downloaded successfully!');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-playfair text-collector-black">
            Financial Reports
          </SheetTitle>
          <SheetDescription>
            View and download your financial reports and analytics
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Report Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={(value: 'transactions' | 'budgets' | 'summary') => setReportType(value)}>
                <SelectTrigger className="border-2 border-collector-gold/30 focus:border-collector-orange">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="transactions">Transactions</SelectItem>
                  <SelectItem value="budgets">Budgets</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={(value: 'week' | 'month' | 'quarter' | 'year' | 'custom') => setDateRange(value)}>
                <SelectTrigger className="border-2 border-collector-gold/30 focus:border-collector-orange">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleDownloadPDF}
                className="flex-1 bg-blue-500 hover:bg-blue-200 text-white hover:text-collector-black transition-all duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              {reportType !== 'summary' && (
                <Button 
                  onClick={handleDownloadCSV}
                  variant="outline"
                  className="flex-1 hover:bg-gray-200 transition-all duration-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
              )}
            </div>
          </div>

          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border-2 border-collector-gold/30 focus:border-collector-orange"
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border-2 border-collector-gold/30 focus:border-collector-orange"
                />
              </div>
            </div>
          )}

          {/* Summary Cards */}
          {reportType === 'summary' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-collector-gold/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Income</p>
                      <p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-collector-gold/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Expenses</p>
                      <p className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-collector-gold/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Net Amount</p>
                      <p className={`text-2xl font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${netAmount.toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className={`w-8 h-8 ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-collector-gold/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Budgets</p>
                      <p className="text-2xl font-bold text-blue-600">${totalBudgets.toFixed(2)}</p>
                    </div>
                    <PieChart className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Category Breakdown */}
          {reportType === 'summary' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-collector-gold/20">
                <CardHeader>
                  <CardTitle className="text-lg">Expenses by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(expensesByCategory).map(([category, amount]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="capitalize">{category}</span>
                        <Badge variant="outline">${amount.toFixed(2)}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-collector-gold/20">
                <CardHeader>
                  <CardTitle className="text-lg">Income by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(incomeByCategory).map(([category, amount]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="capitalize">{category}</span>
                        <Badge variant="outline" className="text-green-600">${amount.toFixed(2)}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Detailed Data */}
          {reportType === 'transactions' && (
            <Card className="border-collector-gold/20">
              <CardHeader>
                <CardTitle>Transaction Details</CardTitle>
                <CardDescription>
                  {transactions.length} transactions from {start} to {end}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transactionsLoading ? (
                    <p>Loading transactions...</p>
                  ) : transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{transaction.title}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(transaction.date).toLocaleDateString()} • {transaction.category}
                          </p>
                        </div>
                        <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                          {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">No transactions found for this period</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {reportType === 'budgets' && (
            <Card className="border-collector-gold/20">
              <CardHeader>
                <CardTitle>Budget Details</CardTitle>
                <CardDescription>
                  {budgets.length} budgets from {start} to {end}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {budgetsLoading ? (
                    <p>Loading budgets...</p>
                  ) : budgets.length > 0 ? (
                    budgets.map((budget) => (
                      <div key={budget.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{budget.name}</p>
                          <p className="text-sm text-gray-600">
                            {budget.category} • {budget.period}
                          </p>
                        </div>
                        <Badge variant="outline">
                          ${Number(budget.amount).toFixed(2)}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">No budgets found for this period</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ViewReportsForm;
