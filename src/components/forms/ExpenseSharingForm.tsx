
import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Users, Building } from "lucide-react";

interface ExpenseSharingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType: 'individual' | 'organization';
}

const ExpenseSharingForm = ({ open, onOpenChange, userType }: ExpenseSharingFormProps) => {
  const [expenseTitle, setExpenseTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [description, setDescription] = useState("");
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [participants, setParticipants] = useState([
    { id: 1, name: "", email: "", amount: "", type: 'individual' as 'individual' | 'organization' }
  ]);

  const addParticipant = () => {
    setParticipants([
      ...participants,
      { 
        id: Date.now(), 
        name: "", 
        email: "", 
        amount: "", 
        type: userType === 'organization' ? 'individual' : 'individual'
      }
    ]);
  };

  const removeParticipant = (id: number) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const updateParticipant = (id: number, field: string, value: string) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const calculateEqualSplit = () => {
    if (totalAmount && participants.length > 0) {
      return (parseFloat(totalAmount) / (participants.length + 1)).toFixed(2);
    }
    return "0.00";
  };

  const handleSubmit = () => {
    console.log("Creating expense share:", {
      expenseTitle,
      totalAmount,
      description,
      splitType,
      participants,
      userType
    });
    alert(`Expense "${expenseTitle}" shared successfully!`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-playfair text-collector-black">Share Expense</SheetTitle>
          <SheetDescription>
            Split expenses with {userType === 'individual' ? 'friends, family, or organizations' : 'employees or other organizations'}.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="expenseTitle">Expense Title</Label>
              <Input
                id="expenseTitle"
                placeholder="e.g., Dinner at restaurant, Office supplies..."
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="totalAmount">Total Amount ($)</Label>
              <Input
                id="totalAmount"
                type="number"
                placeholder="0.00"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Add notes about this expense..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="splitType">Split Type</Label>
              <Select value={splitType} onValueChange={(value: 'equal' | 'custom') => setSplitType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equal">Equal Split</SelectItem>
                  <SelectItem value="custom">Custom Amounts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Participants</h3>
              <Button onClick={addParticipant} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Person
              </Button>
            </div>

            {/* Your Share */}
            <Card className="border-collector-gold/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Your Share
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium text-collector-black">
                  ${splitType === 'equal' ? calculateEqualSplit() : (parseFloat(totalAmount) - participants.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)).toFixed(2)}
                </div>
              </CardContent>
            </Card>

            {/* Participants List */}
            <div className="space-y-3">
              {participants.map((participant, index) => (
                <Card key={participant.id} className="border-collector-gold/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`name-${participant.id}`}>Name</Label>
                            <Input
                              id={`name-${participant.id}`}
                              placeholder="Enter name"
                              value={participant.name}
                              onChange={(e) => updateParticipant(participant.id, 'name', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`email-${participant.id}`}>Email</Label>
                            <Input
                              id={`email-${participant.id}`}
                              type="email"
                              placeholder="Enter email"
                              value={participant.email}
                              onChange={(e) => updateParticipant(participant.id, 'email', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {userType === 'organization' && (
                            <div>
                              <Label htmlFor={`type-${participant.id}`}>Type</Label>
                              <Select 
                                value={participant.type} 
                                onValueChange={(value: 'individual' | 'organization') => 
                                  updateParticipant(participant.id, 'type', value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="individual">
                                    <div className="flex items-center">
                                      <Users className="w-4 h-4 mr-2" />
                                      Individual
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="organization">
                                    <div className="flex items-center">
                                      <Building className="w-4 h-4 mr-2" />
                                      Organization
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          
                          {splitType === 'custom' && (
                            <div>
                              <Label htmlFor={`amount-${participant.id}`}>Amount ($)</Label>
                              <Input
                                id={`amount-${participant.id}`}
                                type="number"
                                placeholder="0.00"
                                value={participant.amount}
                                onChange={(e) => updateParticipant(participant.id, 'amount', e.target.value)}
                              />
                            </div>
                          )}
                          
                          {splitType === 'equal' && (
                            <div>
                              <Label>Amount ($)</Label>
                              <div className="h-10 px-3 py-2 border border-input bg-gray-50 rounded-md flex items-center text-sm">
                                ${calculateEqualSplit()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {participants.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeParticipant(participant.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Summary */}
          <Card className="border-collector-gold/20 bg-collector-white/50">
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-medium">${totalAmount || "0.00"}</span>
              </div>
              <div className="flex justify-between">
                <span>Number of People:</span>
                <span className="font-medium">{participants.length + 1}</span>
              </div>
              <div className="flex justify-between">
                <span>Your Share:</span>
                <span className="font-medium text-collector-orange">
                  ${splitType === 'equal' ? calculateEqualSplit() : (parseFloat(totalAmount) - participants.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1 bg-blue-gradient hover:bg-blue-600 text-white">
              Share Expense
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ExpenseSharingForm;
