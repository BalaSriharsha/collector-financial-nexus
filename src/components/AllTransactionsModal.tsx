
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, Search, Filter } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Transaction {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  created_at: string;
}

interface AllTransactionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: Transaction[];
}

const AllTransactionsModal = ({ open, onOpenChange }: AllTransactionsModalProps) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchAllTransactions();
    }
  }, [open, user]);

  const fetchAllTransactions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }

      setAllTransactions(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = allTransactions.filter(transaction => {
    const matchesSearch = 
      transaction.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTransactionReference = (id: string) => {
    return `TXN-${id.substring(0, 8).toUpperCase()}`;
  };

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netAmount = totalIncome - totalExpenses;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white text-slate-900 border-2 border-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-playfair text-slate-900 dark:text-slate-100">All Transactions</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Complete transaction history and details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-slate-300 dark:border-slate-600"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 w-4 h-4" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="flex h-10 w-full rounded-md border-2 border-slate-300 bg-white text-slate-900 pl-10 pr-8 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expenses</option>
              </select>
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400">Loading transactions...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                <p>
                  {allTransactions.length === 0 
                    ? "No transactions found. Start by adding your first transaction!" 
                    : "No transactions found matching your criteria."
                  }
                </p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="border-2 border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:hover:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        transaction.type === 'income' ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
                      }`}>
                        {transaction.type === 'income' ? 
                          <TrendingUp className="w-5 h-5 text-green-600" /> :
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {transaction.title || 'No title'}
                        </h4>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="capitalize">{transaction.category}</span>
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                          <span className="uppercase text-xs font-medium">
                            {getTransactionReference(transaction.id)}
                          </span>
                        </div>
                        {transaction.description && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">
                            {transaction.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={`text-lg lg:text-xl font-playfair font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    } text-right`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          {filteredTransactions.length > 0 && (
            <div className="border-t-2 border-slate-300 dark:border-slate-700 pt-4 mt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Income</p>
                  <p className="text-lg font-semibold text-green-600">
                    +{formatCurrency(totalIncome)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Expenses</p>
                  <p className="text-lg font-semibold text-red-600">
                    -{formatCurrency(totalExpenses)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Net Amount</p>
                  <p className={`text-lg font-semibold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netAmount)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AllTransactionsModal;
