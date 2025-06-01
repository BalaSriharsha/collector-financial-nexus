
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description?: string;
}

interface Budget {
  id: string;
  name: string;
  amount: number;
  category: string;
  start_date: string;
  end_date: string;
  period?: string;
}

interface ViewAllModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'transactions' | 'budgets';
  data: Transaction[] | Budget[];
  title: string;
}

type FilterPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'custom';

const ViewAllModal: React.FC<ViewAllModalProps> = ({
  open,
  onOpenChange,
  type,
  data,
  title
}) => {
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('monthly');
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  const getDateRange = (period: FilterPeriod) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'daily':
        return { start: startOfDay, end: now };
      case 'weekly':
        const weekStart = new Date(startOfDay);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        return { start: weekStart, end: now };
      case 'monthly':
        return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
      case 'quarterly':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        return { start: quarterStart, end: now };
      case 'half-yearly':
        const halfYearStart = new Date(now.getFullYear(), now.getMonth() < 6 ? 0 : 6, 1);
        return { start: halfYearStart, end: now };
      case 'yearly':
        return { start: new Date(now.getFullYear(), 0, 1), end: now };
      case 'custom':
        return { 
          start: customStartDate || new Date(now.getFullYear(), now.getMonth(), 1), 
          end: customEndDate || now 
        };
      default:
        return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
    }
  };

  const filteredData = useMemo(() => {
    const { start, end } = getDateRange(filterPeriod);
    
    return data.filter(item => {
      const itemDate = new Date(type === 'transactions' ? (item as Transaction).date : (item as Budget).start_date);
      const dateInRange = itemDate >= start && itemDate <= end;
      
      if (categoryFilter === 'all') return dateInRange;
      
      const itemCategory = type === 'transactions' ? (item as Transaction).category : (item as Budget).category;
      return dateInRange && itemCategory === categoryFilter;
    });
  }, [data, filterPeriod, customStartDate, customEndDate, categoryFilter, type]);

  const categories = useMemo(() => {
    const cats = new Set(data.map(item => 
      type === 'transactions' ? (item as Transaction).category : (item as Budget).category
    ));
    return Array.from(cats);
  }, [data, type]);

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      food: 'bg-orange-100 text-orange-800',
      transport: 'bg-blue-100 text-blue-800',
      entertainment: 'bg-purple-100 text-purple-800',
      utilities: 'bg-gray-100 text-gray-800',
      healthcare: 'bg-red-100 text-red-800',
      shopping: 'bg-pink-100 text-pink-800',
      education: 'bg-green-100 text-green-800',
      investment: 'bg-indigo-100 text-indigo-800',
      salary: 'bg-emerald-100 text-emerald-800',
      freelance: 'bg-teal-100 text-teal-800',
      business: 'bg-yellow-100 text-yellow-800',
      other: 'bg-slate-100 text-slate-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <DialogDescription>
            Showing {filteredData.length} {type} with advanced filtering options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <Select value={filterPeriod} onValueChange={(value) => setFilterPeriod(value as FilterPeriod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="half-yearly">Half-Yearly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Date Range */}
          {filterPeriod === 'custom' && (
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customStartDate ? format(customStartDate, "PPP") : "Pick a date"}
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
                    <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customEndDate ? format(customEndDate, "PPP") : "Pick a date"}
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
            </div>
          )}

          <Separator />

          {/* Data Display */}
          <div className="space-y-3">
            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No {type} found for the selected filters
              </div>
            ) : (
              filteredData.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {type === 'transactions' ? (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{(item as Transaction).title}</h4>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getCategoryBadgeColor((item as Transaction).category)}`}
                          >
                            {(item as Transaction).category}
                          </Badge>
                        </div>
                        {(item as Transaction).description && (
                          <p className="text-sm text-muted-foreground mb-1">
                            {(item as Transaction).description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date((item as Transaction).date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${(item as Transaction).type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {(item as Transaction).type === 'expense' ? '-' : '+'}
                          {formatCurrency((item as Transaction).amount)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{(item as Budget).name}</h4>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getCategoryBadgeColor((item as Budget).category)}`}
                          >
                            {(item as Budget).category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date((item as Budget).start_date).toLocaleDateString('en-IN')} - {new Date((item as Budget).end_date).toLocaleDateString('en-IN')}
                        </p>
                        {(item as Budget).period && (
                          <p className="text-xs text-muted-foreground">
                            Period: {(item as Budget).period}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">
                          {formatCurrency((item as Budget).amount)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewAllModal;
