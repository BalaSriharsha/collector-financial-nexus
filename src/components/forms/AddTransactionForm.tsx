
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddTransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType: 'individual' | 'organization';
  onClose: () => void;
  editingTransactionId?: string | null;
}

const AddTransactionForm = ({ open, onOpenChange, userType, onClose, editingTransactionId }: AddTransactionFormProps) => {
  const { user } = useAuth();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch transaction data when editing
  useEffect(() => {
    const fetchTransactionData = async () => {
      if (!editingTransactionId || !user) return;

      try {
        const { data: transaction, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', editingTransactionId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (transaction) {
          setType(transaction.type);
          setTitle(transaction.title);
          setAmount(transaction.amount.toString());
          setCategory(transaction.category);
          setDate(transaction.date);
          setDescription(transaction.description || "");
        }
      } catch (error: unknown) {
        console.error('Error fetching transaction:', error);
        toast.error('Failed to load transaction data');
      }
    };

    if (open && editingTransactionId) {
      fetchTransactionData();
    } else if (open && !editingTransactionId) {
      // Reset form for new transaction
      setType('expense');
      setTitle("");
      setAmount("");
      setCategory("");
      setDate(new Date().toISOString().split('T')[0]);
      setDescription("");
    }
  }, [open, editingTransactionId, user]);

  const resetForm = () => {
    setType('expense');
    setTitle("");
    setAmount("");
    setCategory("");
    setDate(new Date().toISOString().split('T')[0]);
    setDescription("");
  };

  const handleSubmit = async () => {
    if (!user || !title || !amount || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        title,
        amount: parseFloat(amount),
        type,
        category: category as 'food' | 'transport' | 'entertainment' | 'utilities' | 'healthcare' | 'shopping' | 'education' | 'investment' | 'salary' | 'freelance' | 'business' | 'other',
        date,
        description,
        user_id: user.id,
      };

      let error;
      
      if (editingTransactionId) {
        // Update existing transaction
        const { error: updateError } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', editingTransactionId);
        error = updateError;
      } else {
        // Create new transaction
        const { error: insertError } = await supabase
          .from('transactions')
          .insert(transactionData);
        error = insertError;
      }

      if (error) throw error;

      toast.success(editingTransactionId ? 'Transaction updated successfully!' : 'Transaction added successfully!');
      resetForm();
      onClose();
    } catch (error: unknown) {
      console.error('Error saving transaction:', error);
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as { message: string }).message 
        : 'Failed to save transaction';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Updated categories to match database schema
  const categories = {
    income: ['salary', 'freelance', 'investment', 'business', 'other'],
    expense: ['food', 'transport', 'entertainment', 'utilities', 'healthcare', 'shopping', 'education', 'other']
  };

  // Map display names to database values
  const categoryDisplayNames = {
    income: {
      'salary': 'Salary',
      'freelance': 'Freelance',
      'investment': 'Investment',
      'business': 'Business',
      'other': 'Other'
    },
    expense: {
      'food': 'Food',
      'transport': 'Transportation',
      'entertainment': 'Entertainment',
      'utilities': 'Utilities',
      'healthcare': 'Healthcare',
      'shopping': 'Shopping',
      'education': 'Education',
      'other': 'Other'
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-playfair text-collector-black">
            {editingTransactionId ? 'Edit Transaction' : 'Add Transaction'}
          </SheetTitle>
          <SheetDescription>
            {editingTransactionId ? 'Update your transaction details.' : 'Add a new income or expense transaction to track your finances.'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Transaction Type */}
          <div className="space-y-4">
            <Label>Transaction Type</Label>
            <RadioGroup value={type} onValueChange={(value: 'income' | 'expense') => setType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income" className="text-green-600 font-medium">Income</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense" className="text-red-600 font-medium">Expense</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Grocery shopping, Salary payment..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-2 border-collector-gold/30 focus:border-collector-orange"
            />
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount">Amount *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-collector-black/60 w-4 h-4" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 border-2 border-collector-gold/30 focus:border-collector-orange"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="border-2 border-collector-gold/30 focus:border-collector-orange">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories[type].map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {categoryDisplayNames[type][cat as keyof typeof categoryDisplayNames[typeof type]]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-2 border-collector-gold/30 focus:border-collector-orange"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any additional notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-2 border-collector-gold/30 focus:border-collector-orange"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600 hover:border-blue-700"
            >
              {loading ? 'Saving...' : editingTransactionId ? 'Update Transaction' : 'Add Transaction'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddTransactionForm;
