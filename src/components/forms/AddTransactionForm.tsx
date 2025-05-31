
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface AddTransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType: 'individual' | 'organization';
  editingTransaction?: any;
  onClose?: () => void;
}

const AddTransactionForm = ({ open, onOpenChange, userType, editingTransaction, onClose }: AddTransactionFormProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "expense" as "income" | "expense",
    category: "",
    date: new Date().toISOString().split('T')[0],
    description: "",
  });

  const incomeCategories = ["salary", "freelance", "business", "investment", "other"];
  const expenseCategories = ["food", "transport", "entertainment", "utilities", "healthcare", "shopping", "education", "other"];

  // Reset form when modal opens/closes or editing transaction changes
  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        title: editingTransaction.title || "",
        amount: editingTransaction.amount?.toString() || "",
        type: editingTransaction.type || "expense",
        category: editingTransaction.category || "",
        date: editingTransaction.date || new Date().toISOString().split('T')[0],
        description: editingTransaction.description || "",
      });
    } else {
      setFormData({
        title: "",
        amount: "",
        type: "expense",
        category: "",
        date: new Date().toISOString().split('T')[0],
        description: "",
      });
    }
  }, [editingTransaction, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const transactionData = {
        title: formData.title,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        date: formData.date,
        description: formData.description,
        user_id: user.id,
        organization_id: userType === 'organization' ? null : null, // Will be set when organization features are implemented
      };

      let error;
      if (editingTransaction) {
        // Update existing transaction
        const result = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', editingTransaction.id);
        error = result.error;
        
        if (!error) {
          toast.success('Transaction updated successfully!');
        }
      } else {
        // Create new transaction
        const result = await supabase
          .from('transactions')
          .insert([transactionData]);
        error = result.error;
        
        if (!error) {
          toast.success('Transaction added successfully!');
        }
      }

      if (error) throw error;

      // Reset form
      setFormData({
        title: "",
        amount: "",
        type: "expense",
        category: "",
        date: new Date().toISOString().split('T')[0],
        description: "",
      });

      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      onClose ? onClose() : onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      toast.error(error.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentCategories = () => {
    return formData.type === 'income' ? incomeCategories : expenseCategories;
  };

  return (
    <Sheet open={open} onOpenChange={onClose || onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-playfair text-collector-black">
            {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </SheetTitle>
          <SheetDescription>
            {editingTransaction ? 'Update your transaction details' : 'Record a new income or expense transaction.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type</Label>
            <Select value={formData.type} onValueChange={(value: "income" | "expense") => {
              setFormData(prev => ({ ...prev, type: value, category: "" }));
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Grocery shopping, Salary payment..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {getCurrentCategories().map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any additional notes..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onClose ? onClose() : onOpenChange(false)} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="flex-1 bg-blue-gradient hover:bg-blue-600 text-white"
            >
              {loading ? 'Saving...' : editingTransaction ? 'Update Transaction' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddTransactionForm;
