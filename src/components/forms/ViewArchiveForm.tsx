
import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Download, Eye, Search, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ViewArchiveFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockDocuments = [
  { id: 1, name: "Invoice #001", category: "Business", date: "2024-01-15", size: "245 KB", type: "PDF" },
  { id: 2, name: "Grocery Receipt", category: "Personal", date: "2024-01-14", size: "180 KB", type: "JPG" },
  { id: 3, name: "Tax Document 2023", category: "Tax", date: "2024-01-10", size: "1.2 MB", type: "PDF" },
  { id: 4, name: "Salary Slip", category: "Business", date: "2024-01-05", size: "320 KB", type: "PDF" },
  { id: 5, name: "Utility Bill", category: "Personal", date: "2024-01-03", size: "156 KB", type: "PDF" },
];

const ViewArchiveForm = ({ open, onOpenChange }: ViewArchiveFormProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "business", "personal", "tax"];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-playfair text-collector-black">Document Archive</SheetTitle>
          <SheetDescription>
            Browse and manage your uploaded financial documents and invoices.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-collector-black/40 w-4 h-4" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-collector-black/40 w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-8 py-2 text-sm capitalize"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="tax">Tax</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              {/* Documents List */}
              <div className="space-y-3">
                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-8 text-collector-black/60">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-40" />
                    <p>No documents found matching your criteria.</p>
                  </div>
                ) : (
                  filteredDocuments.map((doc) => (
                    <div key={doc.id} className="border border-collector-gold/20 rounded-lg p-4 hover:bg-collector-white/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-10 h-10 bg-blue-gradient rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-collector-black truncate">{doc.name}</h4>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-collector-black/60">
                              <span className="capitalize">{doc.category}</span>
                              <span>{doc.date}</span>
                              <span>{doc.size} • {doc.type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="text-collector-blue hover:text-collector-blue-dark">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-collector-gold hover:text-collector-gold-dark">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ViewArchiveForm;
