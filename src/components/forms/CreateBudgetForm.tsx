
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface CreateBudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType: 'individual' | 'organization';
  editingBudget?: Budget | null;
  onClose?: () => void;
}

type BudgetCategory = "food" | "transport" | "entertainment" | "utilities" | "healthcare" | "shopping" | "education" | "investment" | "salary" | "freelance" | "business" | "other";

interface Budget {
  id: string;
  name: string;
  amount: number;
  category: string;
  period: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

const CreateBudgetForm = ({ open, onOpenChange, userType, editingBudget, onClose }: CreateBudgetFormProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "" as BudgetCategory | "",
    period: "monthly",
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
  });

  const categories: BudgetCategory[] = ["food", "transport", "entertainment", "utilities", "healthcare", "shopping", "education", "other"];

  // Reset form when modal opens/closes or editing budget changes
  useEffect(() => {
    if (editingBudget) {
      setFormData({
        name: editingBudget.name || "",
        amount: editingBudget.amount?.toString() || "",
        category: editingBudget.category as BudgetCategory || "",
        period: editingBudget.period || "monthly",
        start_date: editingBudget.start_date || new Date().toISOString().split('T')[0],
        end_date: editingBudget.end_date || "",
      });
    } else {
      // Calculate default end date (1 month from start date)
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      
      setFormData({
        name: "",
        amount: "",
        category: "",
        period: "monthly",
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      });
    }
  }, [editingBudget, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!formData.name.trim()) {
      toast.error('Budget name is required');
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid budget amount');
      return;
    }

    setLoading(true);
    try {
      const budgetData = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        category: formData.category as BudgetCategory,
        period: formData.period,
        start_date: formData.start_date,
        end_date: formData.end_date,
        user_id: user.id,
        organization_id: userType === 'organization' ? null : null, // Will be set when organization features are implemented
      };

      let error;
      if (editingBudget) {
        // Update existing budget
        const result = await supabase
          .from('budgets')
          .update(budgetData)
          .eq('id', editingBudget.id);
        error = result.error;
        
        if (!error) {
          toast.success('Budget updated successfully!');
        }
      } else {
        // Create new budget
        const result = await supabase
          .from('budgets')
          .insert(budgetData);
        error = result.error;
        
        if (!error) {
          toast.success('Budget created successfully!');
        }
      }

      if (error) {
        throw error;
      }

      // Reset form
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      
      setFormData({
        name: "",
        amount: "",
        category: "",
        period: "monthly",
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      });

      // Trigger dashboard refresh
      if (onClose) {
        onClose();
      } else {
        onOpenChange(false);
      }
      
      // Also invalidate queries for any components using React Query
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    } catch (error: unknown) {
      console.error('Error saving budget:', error);
      
      // Show specific error message if available
      if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST301') {
        toast.error('Permission denied. Please check your account permissions.');
      } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        toast.error(`Failed to save budget: ${error.message}`);
      } else {
        toast.error('Failed to save budget. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose || onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
        <SheetHeader>
          <SheetTitle className="font-playfair text-slate-900 dark:text-slate-100">
            {editingBudget ? 'Edit Budget' : 'Create Budget'}
          </SheetTitle>
          <SheetDescription className="text-slate-600 dark:text-slate-400">
            {editingBudget ? 'Update your budget details' : 'Set up a new budget to track your spending.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Budget Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">Budget Name</Label>
            <Input
              id="name"
              placeholder="e.g., Monthly Groceries, Entertainment..."
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="border-2 border-slate-300 focus:border-blue-500 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-slate-700 dark:text-slate-300">Budget Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              required
              className="border-2 border-slate-300 focus:border-blue-500 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-slate-700 dark:text-slate-300">Category</Label>
            <Select value={formData.category} onValueChange={(value: BudgetCategory) => setFormData(prev => ({ ...prev, category: value }))} required>
              <SelectTrigger className="border-2 border-slate-300 focus:border-blue-500 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-slate-300 shadow-lg z-50 dark:bg-slate-800 dark:border-slate-600">
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Period */}
          <div className="space-y-2">
            <Label htmlFor="period" className="text-slate-700 dark:text-slate-300">Budget Period</Label>
            <Select value={formData.period} onValueChange={(value) => setFormData(prev => ({ ...prev, period: value }))}>
              <SelectTrigger className="border-2 border-slate-300 focus:border-blue-500 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-slate-300 shadow-lg z-50 dark:bg-slate-800 dark:border-slate-600">
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="start_date" className="text-slate-700 dark:text-slate-300">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              required
              className="border-2 border-slate-300 focus:border-blue-500 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400"
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="end_date" className="text-slate-700 dark:text-slate-300">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              required
              className="border-2 border-slate-300 focus:border-blue-500 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onClose ? onClose() : onOpenChange(false)} 
              className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 bg-white dark:border-slate-600 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600 hover:border-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:border-blue-500 dark:hover:border-blue-600 transition-all duration-200"
            >
              {loading ? 'Saving...' : editingBudget ? 'Update Budget' : 'Create Budget'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateBudgetForm;
