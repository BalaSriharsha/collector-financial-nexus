
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const invoiceSchema = z.object({
  invoice_number: z.string().min(1, "Invoice number is required"),
  client_name: z.string().min(1, "Client name is required"),
  client_email: z.string().email("Valid email is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  due_date: z.string(),
  description: z.string().optional(),
  status: z.enum(["draft", "sent", "paid", "overdue"]),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface GenerateInvoiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GenerateInvoiceForm = ({ open, onOpenChange }: GenerateInvoiceFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoice_number: `INV-${Date.now()}`,
      client_name: "",
      client_email: "",
      amount: 0,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      description: "",
      status: "draft",
    },
  });

  const onSubmit = async (data: InvoiceFormData) => {
    if (!user) {
      toast.error("Please log in to create invoices");
      return;
    }

    setLoading(true);
    try {
      // Create the invoice data object with explicit typing
      const invoiceData = {
        invoice_number: data.invoice_number,
        client_name: data.client_name,
        client_email: data.client_email,
        amount: data.amount,
        due_date: data.due_date,
        description: data.description || null,
        status: data.status,
        user_id: user.id,
      };

      const { error } = await supabase
        .from('invoices')
        .insert(invoiceData);

      if (error) throw error;

      toast.success(`Invoice ${data.invoice_number} created successfully!`);
      onOpenChange(false);
      form.reset();
      
      // Generate PDF preview
      generateInvoicePDF(data);
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast.error(error.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const generateInvoicePDF = (invoiceData: InvoiceFormData) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Invoice ${invoiceData.invoice_number}</title>
          <style>
              body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px; 
                  color: #333;
                  line-height: 1.6;
              }
              .header { 
                  display: flex; 
                  justify-content: space-between; 
                  align-items: center; 
                  border-bottom: 3px solid #f97316; 
                  padding-bottom: 20px;
                  margin-bottom: 30px;
              }
              .company-info h1 { 
                  color: #1e40af; 
                  margin: 0;
                  font-size: 28px;
              }
              .invoice-info { 
                  text-align: right; 
              }
              .invoice-number { 
                  font-size: 24px; 
                  font-weight: bold; 
                  color: #f97316;
              }
              .client-info, .invoice-details { 
                  margin: 30px 0; 
              }
              .client-info h3, .invoice-details h3 { 
                  color: #1e40af; 
                  border-bottom: 1px solid #ddd; 
                  padding-bottom: 5px;
              }
              .amount-section { 
                  background-color: #f8f9fa; 
                  padding: 20px; 
                  border-radius: 8px; 
                  margin: 30px 0;
              }
              .total-amount { 
                  font-size: 32px; 
                  font-weight: bold; 
                  color: #f97316; 
                  text-align: center;
              }
              .status { 
                  display: inline-block; 
                  padding: 8px 16px; 
                  border-radius: 20px; 
                  font-weight: bold; 
                  text-transform: uppercase;
              }
              .status.draft { background-color: #e3f2fd; color: #1976d2; }
              .status.sent { background-color: #fff3e0; color: #f57c00; }
              .status.paid { background-color: #e8f5e8; color: #2e7d32; }
              .status.overdue { background-color: #ffebee; color: #d32f2f; }
              .footer { 
                  margin-top: 50px; 
                  text-align: center; 
                  color: #666; 
                  border-top: 1px solid #ddd; 
                  padding-top: 20px;
              }
          </style>
      </head>
      <body>
          <div class="header">
              <div class="company-info">
                  <h1>Your Company</h1>
                  <p>Professional Invoice Services</p>
              </div>
              <div class="invoice-info">
                  <div class="invoice-number">${invoiceData.invoice_number}</div>
                  <p>Date: ${new Date().toLocaleDateString()}</p>
                  <span class="status ${invoiceData.status}">${invoiceData.status}</span>
              </div>
          </div>

          <div class="client-info">
              <h3>Bill To:</h3>
              <p><strong>${invoiceData.client_name}</strong></p>
              <p>${invoiceData.client_email}</p>
          </div>

          <div class="invoice-details">
              <h3>Invoice Details:</h3>
              <p><strong>Due Date:</strong> ${new Date(invoiceData.due_date).toLocaleDateString()}</p>
              ${invoiceData.description ? `<p><strong>Description:</strong> ${invoiceData.description}</p>` : ''}
          </div>

          <div class="amount-section">
              <p style="text-align: center; margin: 0; font-size: 18px;">Total Amount Due</p>
              <div class="total-amount">$${invoiceData.amount.toFixed(2)}</div>
          </div>

          <div class="footer">
              <p>Thank you for your business!</p>
              <p>Generated on ${new Date().toLocaleDateString()} via Collector</p>
          </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${invoiceData.invoice_number}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Invoice PDF generated! Open the downloaded file and print to PDF.');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto border-2 border-collector-gold/30 bg-white">
        <SheetHeader>
          <SheetTitle className="font-playfair text-collector-black">Generate Invoice</SheetTitle>
          <SheetDescription>
            Create and generate professional invoices for your organization.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="invoice_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="INV-001" 
                        {...field} 
                        className="border-2 border-collector-gold/30 focus:border-collector-orange"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Client Company Name" 
                        {...field} 
                        className="border-2 border-collector-gold/30 focus:border-collector-orange"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="client@company.com" 
                        {...field} 
                        className="border-2 border-collector-gold/30 focus:border-collector-orange"
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
                    <FormLabel>Amount ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="1000.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className="border-2 border-collector-gold/30 focus:border-collector-orange"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        className="border-2 border-collector-gold/30 focus:border-collector-orange"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-2 border-collector-gold/30 focus:border-collector-orange">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
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
                        placeholder="Services provided, project details..." 
                        {...field} 
                        className="border-2 border-collector-gold/30 focus:border-collector-orange"
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
                  disabled={loading}
                  className="flex-1 bg-green-500 hover:bg-green-200 text-white hover:text-collector-black transition-all duration-200"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {loading ? 'Creating...' : 'Create & Download'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default GenerateInvoiceForm;
