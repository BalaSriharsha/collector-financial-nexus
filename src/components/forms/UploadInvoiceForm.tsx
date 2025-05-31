
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Upload, FileText } from "lucide-react";

const invoiceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  amount: z.number().optional(),
  date: z.string(),
  category: z.string().min(1, "Category is required"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface UploadInvoiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UploadInvoiceForm = ({ open, onOpenChange }: UploadInvoiceFormProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category: "",
    },
  });

  const onSubmit = (data: InvoiceFormData) => {
    console.log("Invoice submitted:", { ...data, file: selectedFile });
    onOpenChange(false);
    form.reset();
    setSelectedFile(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto border-2 border-collector-gold/30 bg-white">
        <SheetHeader>
          <SheetTitle className="font-playfair text-collector-black">Upload Invoice</SheetTitle>
          <SheetDescription>
            Upload invoices, receipts, and financial documents to your secure vault.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-collector-gold/30 rounded-lg p-6 text-center hover:border-collector-gold/50 transition-colors bg-collector-white/50">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xlsx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 bg-blue-gradient rounded-full flex items-center justify-center border-2 border-blue-300">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-collector-black font-medium">
                        {selectedFile ? selectedFile.name : "Click to upload document"}
                      </p>
                      <p className="text-sm text-collector-black/60 mt-1">
                        PDF, DOC, XLSX, JPG, PNG (max 10MB)
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Invoice #001, Receipt - Groceries" 
                        {...field} 
                        className="border-2 border-collector-gold/30 focus:border-collector-blue"
                      />
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
                      <Input 
                        placeholder="Business, Personal, Tax Documents" 
                        {...field} 
                        className="border-2 border-collector-gold/30 focus:border-collector-blue"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className="border-2 border-collector-gold/30 focus:border-collector-blue"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        className="border-2 border-collector-gold/30 focus:border-collector-blue"
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
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes about this document..." 
                        {...field} 
                        className="border-2 border-collector-gold/30 focus:border-collector-blue"
                      />
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
                  className="flex-1 border-2 border-collector-gold/30 hover:border-collector-orange"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-blue-gradient hover:bg-blue-600 text-white border-2 border-transparent hover:border-blue-300"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UploadInvoiceForm;
