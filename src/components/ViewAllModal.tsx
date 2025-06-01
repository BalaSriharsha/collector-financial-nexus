
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter, Search } from "lucide-react";
import { format } from "date-fns";

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

interface ViewAllModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'transactions' | 'budgets';
  data: Transaction[] | Budget[];
}

const ViewAllModal = ({ open, onOpenChange, type, data }: ViewAllModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [filteredData, setFilteredData] = useState(data);

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

  const applyFilters = () => {
    let filtered = data;

    // Search filter
    if (searchTerm) {
      if (type === 'transactions') {
        filtered = (filtered as Transaction[]).filter(item =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      } else {
        filtered = (filtered as Budget[]).filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    }

    // Period filter
    if (filterPeriod !== "all") {
      const now = new Date();
      let startDate: Date;

      switch (filterPeriod) {
        case "daily":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "weekly":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "monthly":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "quarterly":
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case "half-yearly":
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          break;
        case "yearly":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case "custom":
          if (customStartDate && customEndDate) {
            startDate = customStartDate;
            const endDate = customEndDate;
            if (type === 'transactions') {
              filtered = (filtered as Transaction[]).filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= startDate && itemDate <= endDate;
              });
            } else {
              filtered = (filtered as Budget[]).filter(item => {
                const itemDate = new Date(item.start_date);
                return itemDate >= startDate && itemDate <= endDate;
              });
            }
          }
          break;
        default:
          startDate = new Date(0);
      }

      if (filterPeriod !== "custom") {
        if (type === 'transactions') {
          filtered = (filtered as Transaction[]).filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= startDate;
          });
        } else {
          filtered = (filtered as Budget[]).filter(item => {
            const itemDate = new Date(item.start_date);
            return itemDate >= startDate;
          });
        }
      }
    }

    setFilteredData(filtered);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterPeriod("all");
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
    setFilteredData(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-playfair">
            All {type === 'transactions' ? 'Transactions' : 'Budgets'}
          </DialogTitle>
          <DialogDescription>
            View and filter all your {type === 'transactions' ? 'transactions' : 'budgets'}
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <Card className="border-collector-gold/20">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-48">
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={`Search ${type}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="min-w-40">
                <label className="text-sm font-medium mb-2 block">Period</label>
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="daily">Today</SelectItem>
                    <SelectItem value="weekly">Last 7 Days</SelectItem>
                    <SelectItem value="monthly">This Month</SelectItem>
                    <SelectItem value="quarterly">Last 3 Months</SelectItem>
                    <SelectItem value="half-yearly">Last 6 Months</SelectItem>
                    <SelectItem value="yearly">This Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filterPeriod === "custom" && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Start Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-40 justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customStartDate ? format(customStartDate, "PPP") : "Pick date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={customStartDate}
                          onSelect={setCustomStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">End Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-40 justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customEndDate ? format(customEndDate, "PPP") : "Pick date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={customEndDate}
                          onSelect={setCustomEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <Button onClick={applyFilters} size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Apply
                </Button>
                <Button onClick={resetFilters} variant="outline" size="sm">
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data List */}
        <div className="flex-1 overflow-y-auto">
          <Card>
            <CardContent className="p-0">
              {filteredData.length > 0 ? (
                <div className="space-y-2 p-4">
                  {type === 'transactions' 
                    ? (filteredData as Transaction[]).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800 mb-1 truncate">{transaction.title}</div>
                            <div className="text-sm text-gray-600 truncate">{transaction.category}</div>
                            <div className="text-xs text-gray-500 mt-1">{formatDate(transaction.date)}</div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {transaction.type}
                            </Badge>
                          </div>
                        </div>
                      ))
                    : (filteredData as Budget[]).map((budget) => (
                        <div key={budget.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800 mb-1 truncate">{budget.name}</div>
                            <div className="text-sm text-gray-600 truncate">{budget.category}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-blue-600">
                              {formatCurrency(budget.amount)}
                            </div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {budget.period}
                            </Badge>
                          </div>
                        </div>
                      ))
                  }
                </div>
              ) : (
                <div className="text-center py-12 text-gray-600">
                  <p>No {type} found matching your criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewAllModal;
