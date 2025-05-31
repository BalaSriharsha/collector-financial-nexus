
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
  editingBudget?: any;
  onClose?: () => void;
}

const CreateBudgetForm = ({ open, onOpenChange, userType, editingBudget, onClose }: CreateBudgetFormProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "",
    period: "monthly",
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
  });

  const categories = ["food", "transport", "entertainment", "utilities", "healthcare", "shopping", "education", "other"];

  // Reset form when modal opens/closes or editing budget changes
  useEffect(() => {
    if (editingBudget) {
      setFormData({
        name: editingBudget.name || "",
        amount: editingBudget.amount?.toString() || "",
        category: editingBudget.category || "",
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
    if (!user) return;

    setLoading(true);
    try {
      const budgetData = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        category: formData.category,
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
          .insert([budgetData]);
        error = result.error;
        
        if (!error) {
          toast.success('Budget created successfully!');
        }
      }

      if (error) throw error;

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

      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      onClose ? onClose() : onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving budget:', error);
      toast.error(error.message || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose || onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-playfair text-collector-black">
            {editingBudget ? 'Edit Budget' : 'Create Budget'}
          </SheetTitle>
          <SheetDescription>
            {editingBudget ? 'Update your budget details' : 'Set up a new budget to track your spending.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Budget Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Budget Name</Label>
            <Input
              id="name"
              placeholder="e.g., Monthly Groceries, Entertainment..."
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount ($)</Label>
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
            <Label htmlFor="period">Budget Period</Label>
            <Select value={formData.period} onValueChange={(value) => setFormData(prev => ({ ...prev, period: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              required
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              required
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
              {loading ? 'Saving...' : editingBudget ? 'Update Budget' : 'Create Budget'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateBudgetForm;
