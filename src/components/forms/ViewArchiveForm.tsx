import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Archive, Calendar, DollarSign, Receipt, Filter } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ViewArchiveFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType: 'individual' | 'organization';
  subscription?: {
    tier: string;
    subscribed: boolean;
    subscriptionEnd?: string;
  } | null;
}

const ViewArchiveForm = ({ open, onOpenChange, userType, subscription }: ViewArchiveFormProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  const isPremiumUser = subscription?.tier === 'Premium' || subscription?.tier === 'Organization';

  // Fetch archived items
  const { data: archivedData, isLoading } = useQuery({
    queryKey: ['archived-items', filterType, isPremiumUser],
    queryFn: async () => {
      if (!user) return { transactions: [], budgets: [], invoices: [], deletedTransactions: [] };

      const promises = [];

      // Fetch old transactions (older than 1 year as "archived")
      if (filterType === 'all' || filterType === 'transactions') {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        promises.push(
          supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .lt('date', oneYearAgo.toISOString().split('T')[0])
            .order('date', { ascending: false })
        );
      } else {
        promises.push(Promise.resolve({ data: [] }));
      }

      // Fetch old budgets (ended more than 6 months ago)
      if (filterType === 'all' || filterType === 'budgets') {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        promises.push(
          supabase
            .from('budgets')
            .select('*')
            .eq('user_id', user.id)
            .lt('end_date', sixMonthsAgo.toISOString().split('T')[0])
            .order('end_date', { ascending: false })
        );
      } else {
        promises.push(Promise.resolve({ data: [] }));
      }

      // Fetch old invoices (paid or cancelled)
      if ((filterType === 'all' || filterType === 'invoices') && userType === 'organization') {
        promises.push(
          supabase
            .from('invoices')
            .select('*')
            .eq('user_id', user.id)
            .in('status', ['paid', 'cancelled'])
            .order('due_date', { ascending: false })
        );
      } else {
        promises.push(Promise.resolve({ data: [] }));
      }

      // For premium users, fetch deleted transactions from the last 30 days
      // Note: This is a conceptual implementation. In a real app, you'd need a 
      // separate table to track deleted items or use soft deletes
      if (isPremiumUser && (filterType === 'all' || filterType === 'deleted')) {
        // This would be implemented with a deleted_transactions table or soft deletes
        promises.push(Promise.resolve({ data: [] }));
      } else {
        promises.push(Promise.resolve({ data: [] }));
      }

      const [transactionsResult, budgetsResult, invoicesResult, deletedResult] = await Promise.all(promises);

      if (transactionsResult.error) throw transactionsResult.error;
      if (budgetsResult.error) throw budgetsResult.error;
      if (invoicesResult.error) throw invoicesResult.error;

      return {
        transactions: transactionsResult.data || [],
        budgets: budgetsResult.data || [],
        invoices: invoicesResult.data || [],
        deletedTransactions: deletedResult.data || [],
      };
    },
    enabled: !!user && open,
  });

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this transaction?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Transaction deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['archived-items'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } catch (error: unknown) {
      console.error('Error deleting transaction:', error);
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as { message: string }).message 
        : 'Failed to delete transaction';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this budget?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Budget deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['archived-items'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    } catch (error: unknown) {
      console.error('Error deleting budget:', error);
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as { message: string }).message 
        : 'Failed to delete budget';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this invoice?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Invoice deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['archived-items'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    } catch (error: unknown) {
      console.error('Error deleting invoice:', error);
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as { message: string }).message 
        : 'Failed to delete invoice';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const totalArchivedItems = archivedData ? 
    archivedData.transactions.length + archivedData.budgets.length + archivedData.invoices.length + archivedData.deletedTransactions.length : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-playfair text-collector-black">Archive</SheetTitle>
          <SheetDescription>
            View and manage your archived financial data.
            {isPremiumUser && " Premium users can view deleted transactions from the last 30 days."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Filter Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-collector-black/70" />
              <span className="text-sm font-medium">Filter by:</span>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40 border-2 border-collector-gold/30 focus:border-collector-orange">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="transactions">Transactions</SelectItem>
                <SelectItem value="budgets">Budgets</SelectItem>
                {userType === 'organization' && <SelectItem value="invoices">Invoices</SelectItem>}
                {isPremiumUser && <SelectItem value="deleted">Deleted (30 days)</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          {/* Premium Feature Notice */}
          {!isPremiumUser && (
            <Card className="border-orange-300 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-orange-900">
                  <Archive className="w-5 h-5" />
                  <span className="font-medium">Premium Feature</span>
                </div>
                <p className="text-sm text-orange-800 mt-1">
                  Upgrade to Premium to view deleted transactions from the last 30 days and access enhanced archive features.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          <Card className="ancient-border bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5" />
                Archive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-collector-blue">
                    {archivedData?.transactions.length || 0}
                  </div>
                  <p className="text-sm text-collector-black/70">Archived Transactions</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-collector-orange">
                    {archivedData?.budgets.length || 0}
                  </div>
                  <p className="text-sm text-collector-black/70">Archived Budgets</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-collector-gold">
                    {archivedData?.invoices.length || 0}
                  </div>
                  <p className="text-sm text-collector-black/70">Archived Invoices</p>
                </div>
                {isPremiumUser && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {archivedData?.deletedTransactions.length || 0}
                    </div>
                    <p className="text-sm text-collector-black/70">Deleted (30 days)</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Archived Items */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-collector-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-collector-black/70">Loading archived items...</p>
            </div>
          ) : totalArchivedItems > 0 ? (
            <div className="space-y-6">
              {/* Archived Transactions */}
              {(filterType === 'all' || filterType === 'transactions') && archivedData?.transactions.length > 0 && (
                <Card className="ancient-border bg-white/90">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Archived Transactions
                    </CardTitle>
                    <CardDescription>Transactions older than 1 year</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {archivedData.transactions.map((transaction: any) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 border border-collector-gold/20 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-collector-black">{transaction.title}</p>
                            <p className="text-sm text-collector-black/60">{transaction.category} • {new Date(transaction.date).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-700 hover:bg-red-200 transition-all duration-200"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Archived Budgets */}
              {(filterType === 'all' || filterType === 'budgets') && archivedData?.budgets.length > 0 && (
                <Card className="ancient-border bg-white/90">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Archived Budgets
                    </CardTitle>
                    <CardDescription>Budgets that ended more than 6 months ago</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {archivedData.budgets.map((budget: any) => (
                        <div key={budget.id} className="flex items-center justify-between p-3 border border-collector-gold/20 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-collector-black">{budget.name}</p>
                            <p className="text-sm text-collector-black/60">
                              {budget.category} • {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-collector-orange">
                              ${Number(budget.amount).toFixed(2)}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteBudget(budget.id)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-700 hover:bg-red-200 transition-all duration-200"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Archived Invoices */}
              {(filterType === 'all' || filterType === 'invoices') && archivedData?.invoices.length > 0 && (
                <Card className="ancient-border bg-white/90">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="w-5 h-5" />
                      Archived Invoices
                    </CardTitle>
                    <CardDescription>Paid or cancelled invoices</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {archivedData.invoices.map((invoice: any) => (
                        <div key={invoice.id} className="flex items-center justify-between p-3 border border-collector-gold/20 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-collector-black">{invoice.invoice_number}</p>
                            <p className="text-sm text-collector-black/60">
                              {invoice.client_name} • Due: {new Date(invoice.due_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                              {invoice.status}
                            </Badge>
                            <span className="font-medium text-collector-gold">
                              ${Number(invoice.amount).toFixed(2)}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-700 hover:bg-red-200 transition-all duration-200"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="ancient-border bg-white/90">
              <CardContent className="text-center py-12">
                <Archive className="w-16 h-16 text-collector-black/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-collector-black/70 mb-2">No archived items</h3>
                <p className="text-collector-black/50">Your archived financial data will appear here</p>
              </CardContent>
            </Card>
          )}

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

export default ViewArchiveForm;
