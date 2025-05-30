
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PieChart, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const budgetCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  amount: z.number().min(0, "Amount must be positive"),
});

const budgetSchema = z.object({
  name: z.string().min(1, "Budget name is required"),
  period: z.enum(["monthly", "yearly"]),
  totalIncome: z.number().min(0, "Income must be positive"),
  categories: z.array(budgetCategorySchema).min(1, "At least one category is required"),
  description: z.string().optional(),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface CreateBudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateBudgetForm = ({ open, onOpenChange }: CreateBudgetFormProps) => {
  const [categories, setCategories] = useState([{ name: "", amount: 0 }]);

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: "",
      period: "monthly",
      totalIncome: 0,
      categories: [{ name: "", amount: 0 }],
      description: "",
    },
  });

  const addCategory = () => {
    setCategories([...categories, { name: "", amount: 0 }]);
  };

  const removeCategory = (index: number) => {
    if (categories.length > 1) {
      const newCategories = categories.filter((_, i) => i !== index);
      setCategories(newCategories);
    }
  };

  const onSubmit = (data: BudgetFormData) => {
    console.log("Budget created:", { ...data, categories });
    onOpenChange(false);
    form.reset();
    setCategories([{ name: "", amount: 0 }]);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-playfair text-collector-black">Create Budget</SheetTitle>
          <SheetDescription>
            Plan your financial future with detailed budget categories and allocations.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Monthly Budget 2024, Q1 Planning" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period</FormLabel>
                      <FormControl>
                        <select {...field} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Income ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="5000.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-playfair font-semibold text-collector-black">Budget Categories</h3>
                  <Button type="button" onClick={addCategory} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>

                {categories.map((category, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        placeholder="Category name (Food, Housing, etc.)"
                        value={category.name}
                        onChange={(e) => {
                          const newCategories = [...categories];
                          newCategories[index].name = e.target.value;
                          setCategories(newCategories);
                        }}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={category.amount}
                        onChange={(e) => {
                          const newCategories = [...categories];
                          newCategories[index].amount = parseFloat(e.target.value) || 0;
                          setCategories(newCategories);
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeCategory(index)}
                      disabled={categories.length === 1}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Budget goals and notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-gold-gradient hover:bg-amber-600 text-white">
                  <PieChart className="w-4 h-4 mr-2" />
                  Create Budget
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CreateBudgetForm;
