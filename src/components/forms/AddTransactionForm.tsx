import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type TransactionCategory = Database["public"]["Enums"]["transaction_category"];
type TransactionType = Database["public"]["Enums"]["transaction_type"];

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(["food", "transport", "entertainment", "utilities", "healthcare", "shopping", "education", "investment", "salary", "freelance", "business", "other"]),
  date: z.string(),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface AddTransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddTransactionForm = ({ open, onOpenChange }: AddTransactionFormProps) => {
  const [activeTab, setActiveTab] = useState("income");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "income",
      amount: 0,
      description: "",
      category: "other",
      date: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  const onSubmit = async (data: TransactionFormData) => {
    if (!user) {
      toast.error("You must be logged in to create transactions");
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log("Submitting transaction:", data);
      
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          title: data.description,
          description: data.notes || null,
          amount: data.amount,
          type: data.type as TransactionType,
          category: data.category as TransactionCategory,
          date: data.date,
        });

      if (error) {
        console.error("Error creating transaction:", error);
        toast.error("Failed to create transaction: " + error.message);
        return;
      }

      toast.success("Transaction created successfully!");
      onOpenChange(false);
      form.reset();
      
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    form.setValue("type", value as "income" | "expense");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-playfair text-collector-black">Add Transaction</SheetTitle>
          <SheetDescription>
            Record your income or expenses with detailed information.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="income" className="text-green-600">Income</TabsTrigger>
              <TabsTrigger value="expense" className="text-red-600">Expense</TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <TabsContent value="income" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Salary, freelance work, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="Work, Investment, Business" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="expense" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Groceries, rent, utilities, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="Food, Housing, Transportation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional details..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)} 
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-orange-gradient hover:bg-orange-600 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding..." : `Add ${activeTab === "income" ? "Income" : "Expense"}`}
                  </Button>
                </div>
              </form>
            </Form>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddTransactionForm;
