
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, FileText, Target, Edit, Trash2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { getCurrencySymbol } from "@/utils/currency";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description: string;
  created_at: string;
}

interface Budget {
  id: string;
  name: string;
  amount: number;
  category: string;
  period: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

interface ViewAllModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'transactions' | 'budgets';
  data: Transaction[] | Budget[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onItemClick?: (item: Transaction | Budget) => void;
}

const ViewAllModal = ({ open, onOpenChange, type, data, onEdit, onDelete, onItemClick }: ViewAllModalProps) => {
  const { profile } = useProfile();
  const currencySymbol = getCurrencySymbol(profile?.currency || 'USD');
  const [filteredData, setFilteredData] = useState(data);
  const [filter, setFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    filterData();
  }, [data, filter, customStartDate, customEndDate]);

  const filterData = () => {
    let filtered = [...data];
    const now = new Date();

    switch (filter) {
      case 'daily':
        filtered = filtered.filter(item => {
          const itemDate = new Date(type === 'transactions' ? (item as Transaction).date : (item as Budget).created_at);
          return itemDate.toDateString() === now.toDateString();
        });
        break;
      case 'weekly':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(item => {
          const itemDate = new Date(type === 'transactions' ? (item as Transaction).date : (item as Budget).created_at);
          return itemDate >= weekAgo;
        });
        break;
      case 'monthly':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filtered = filtered.filter(item => {
          const itemDate = new Date(type === 'transactions' ? (item as Transaction).date : (item as Budget).created_at);
          return itemDate >= monthAgo;
        });
        break;
      case 'quarterly':
        const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        filtered = filtered.filter(item => {
          const itemDate = new Date(type === 'transactions' ? (item as Transaction).date : (item as Budget).created_at);
          return itemDate >= quarterAgo;
        });
        break;
      case 'half-yearly':
        const halfYearAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        filtered = filtered.filter(item => {
          const itemDate = new Date(type === 'transactions' ? (item as Transaction).date : (item as Budget).created_at);
          return itemDate >= halfYearAgo;
        });
        break;
      case 'yearly':
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        filtered = filtered.filter(item => {
          const itemDate = new Date(type === 'transactions' ? (item as Transaction).date : (item as Budget).created_at);
          return itemDate >= yearAgo;
        });
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          const startDate = new Date(customStartDate);
          const endDate = new Date(customEndDate);
          filtered = filtered.filter(item => {
            const itemDate = new Date(type === 'transactions' ? (item as Transaction).date : (item as Budget).created_at);
            return itemDate >= startDate && itemDate <= endDate;
          });
        }
        break;
    }

    setFilteredData(filtered);
  };

  const renderTransactionItem = (transaction: Transaction) => (
    <div
      key={transaction.id}
      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => onItemClick?.(transaction)}
    >
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-800 mb-1 truncate">{transaction.title}</div>
        <div className="text-sm text-gray-600 truncate">{transaction.category}</div>
        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
          <Calendar className="w-3 h-3" />
          {transaction.date}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className={`font-bold ${
            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
          }`}>
            {transaction.type === 'income' ? '+' : '-'}{currencySymbol}{Number(transaction.amount).toLocaleString()}
          </div>
          <Badge variant="outline" className="text-xs mt-1">
            {transaction.type}
          </Badge>
        </div>
        <div className="flex flex-col gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(transaction.id);
            }}
            className="h-6 w-6 p-0 border-gray-400 text-gray-800 hover-navy transition-colors"
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(transaction.id);
            }}
            className="h-6 w-6 p-0 border-red-400 text-red-600 hover-black transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderBudgetItem = (budget: Budget) => (
    <div
      key={budget.id}
      className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => onItemClick?.(budget)}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-800 truncate flex-1">{budget.name}</span>
        <div className="flex items-center gap-2 ml-2">
          <span className="text-sm font-bold text-orange-600">{currencySymbol}{Number(budget.amount).toLocaleString()}</span>
          <div className="flex flex-col gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(budget.id);
              }}
              className="h-5 w-5 p-0 border-gray-400 text-gray-800 hover-navy transition-colors"
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(budget.id);
              }}
              className="h-5 w-5 p-0 border-red-400 text-red-600 hover-black transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-600 flex items-center gap-4">
        <span>{budget.category}</span>
        <span>•</span>
        <span className="capitalize">{budget.period}</span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(budget.start_date).toLocaleDateString()}
        </span>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-playfair">
            {type === 'transactions' ? <FileText className="w-6 h-6" /> : <Target className="w-6 h-6" />}
            View All {type === 'transactions' ? 'Transactions' : 'Budgets'}
          </DialogTitle>
          <DialogDescription>
            Filter and view all your {type === 'transactions' ? 'transactions' : 'budgets'} with detailed information
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="space-y-4 border-b pb-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="min-w-48">
              <Label htmlFor="filter">Time Period</Label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="daily">Today</SelectItem>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="quarterly">Last 3 Months</SelectItem>
                  <SelectItem value="half-yearly">Last 6 Months</SelectItem>
                  <SelectItem value="yearly">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filter === 'custom' && (
              <>
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredData.length} of {data.length} {type}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {filteredData.length > 0 ? (
            <div className="space-y-3 pr-2">
              {type === 'transactions'
                ? (filteredData as Transaction[]).map(renderTransactionItem)
                : (filteredData as Budget[]).map(renderBudgetItem)
              }
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              {type === 'transactions' ? (
                <>
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions found for the selected period</p>
                </>
              ) : (
                <>
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No budgets found for the selected period</p>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewAllModal;
