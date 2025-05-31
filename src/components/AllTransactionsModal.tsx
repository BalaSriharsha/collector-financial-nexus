
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, Search, Filter } from "lucide-react";

interface AllTransactionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: any[];
}

const AllTransactionsModal = ({ open, onOpenChange, transactions }: AllTransactionsModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Generate more mock transactions for the full view
  const allTransactions = [
    ...transactions,
    { id: 5, type: 'expense', amount: 89, description: 'Coffee Shop', date: '2024-01-11', category: 'Food' },
    { id: 6, type: 'income', amount: 1200, description: 'Bonus Payment', date: '2024-01-10', category: 'Work' },
    { id: 7, type: 'expense', amount: 250, description: 'Internet Bill', date: '2024-01-09', category: 'Bills' },
    { id: 8, type: 'expense', amount: 35, description: 'Lunch', date: '2024-01-08', category: 'Food' },
    { id: 9, type: 'income', amount: 300, description: 'Side Project', date: '2024-01-07', category: 'Work' },
    { id: 10, type: 'expense', amount: 75, description: 'Gas Station', date: '2024-01-06', category: 'Transportation' },
  ];

  const filteredTransactions = allTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto border-2 border-collector-gold/30">
        <DialogHeader>
          <DialogTitle className="text-xl font-playfair">All Transactions</DialogTitle>
          <DialogDescription>
            Complete transaction history and details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-collector-black/40 w-4 h-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-collector-gold/30"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-collector-black/40 w-4 h-4" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="flex h-10 w-full rounded-md border-2 border-collector-gold/30 bg-background pl-10 pr-8 py-2 text-sm"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expenses</option>
              </select>
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-collector-black/60">
                <p>No transactions found matching your criteria.</p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="border-2 border-collector-gold/20 rounded-lg p-4 hover:bg-collector-white/50 transition-colors">
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
                        <h4 className="font-medium text-collector-black truncate">{transaction.description}</h4>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-collector-black/60">
                          <span className="capitalize">{transaction.category}</span>
                          <span>{transaction.date}</span>
                          <span className="uppercase text-xs font-medium">TXN-{transaction.id.toString().padStart(6, '0')}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`text-lg lg:text-xl font-playfair font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    } text-right`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          <div className="border-t-2 border-collector-gold/30 pt-4 mt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-collector-black/60">Total Income</p>
                <p className="text-lg font-semibold text-green-600">
                  +${filteredTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-collector-black/60">Total Expenses</p>
                <p className="text-lg font-semibold text-red-600">
                  -${filteredTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-collector-black/60">Net Amount</p>
                <p className="text-lg font-semibold text-collector-black">
                  ${(filteredTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0) -
                    filteredTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0))
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AllTransactionsModal;
