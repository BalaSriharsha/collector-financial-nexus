
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GroupMember {
  id: string;
  role: string;
  user_id: string;
  profiles: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
}

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupMembers: GroupMember[];
  user: any;
  onSubmit: (expenseData: any, selectedMembers: string[], memberSplits: Record<string, string>, splitType: string) => void;
  loading: boolean;
}

const AddExpenseModal = ({ open, onOpenChange, groupMembers, user, onSubmit, loading }: AddExpenseModalProps) => {
  const [newExpense, setNewExpense] = useState({
    title: "",
    description: "",
    total_amount: "",
  });
  const [splitType, setSplitType] = useState<'equal' | 'percentage' | 'custom'>('equal');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberSplits, setMemberSplits] = useState<Record<string, string>>({});

  const calculateEqualSplit = () => {
    if (newExpense.total_amount && selectedMembers.length > 0) {
      return (parseFloat(newExpense.total_amount) / (selectedMembers.length + 1)).toFixed(2);
    }
    return "0.00";
  };

  const calculateUserAmount = () => {
    if (splitType === 'equal') {
      return calculateEqualSplit();
    } else if (splitType === 'percentage') {
      const totalPercentage = selectedMembers.reduce((sum, id) => sum + (parseFloat(memberSplits[id]) || 0), 0);
      const userPercentage = 100 - totalPercentage;
      return ((parseFloat(newExpense.total_amount) * userPercentage) / 100).toFixed(2);
    } else {
      const membersTotal = selectedMembers.reduce((sum, id) => sum + (parseFloat(memberSplits[id]) || 0), 0);
      return (parseFloat(newExpense.total_amount) - membersTotal).toFixed(2);
    }
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => {
      const updated = prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId];
      
      if (splitType !== 'equal') {
        setMemberSplits(prevSplits => {
          const newSplits = { ...prevSplits };
          if (!updated.includes(memberId)) {
            delete newSplits[memberId];
          }
          return newSplits;
        });
      }
      
      return updated;
    });
  };

  const handleSplitChange = (memberId: string, value: string) => {
    setMemberSplits(prev => ({
      ...prev,
      [memberId]: value
    }));
  };

  const handleSubmit = () => {
    onSubmit(newExpense, selectedMembers, memberSplits, splitType);
    setNewExpense({ title: "", description: "", total_amount: "" });
    setSplitType('equal');
    setSelectedMembers([]);
    setMemberSplits({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-collector-gold/30 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Add a new shared expense to this group
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="expenseTitle">Expense Title</Label>
            <Input
              id="expenseTitle"
              value={newExpense.title}
              onChange={(e) => setNewExpense(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Dinner at restaurant, Uber ride..."
              className="border-2 border-collector-gold/30 focus:border-collector-orange"
            />
          </div>

          <div>
            <Label htmlFor="totalAmount">Total Amount ($)</Label>
            <Input
              id="totalAmount"
              type="number"
              step="0.01"
              value={newExpense.total_amount}
              onChange={(e) => setNewExpense(prev => ({ ...prev, total_amount: e.target.value }))}
              placeholder="0.00"
              className="border-2 border-collector-gold/30 focus:border-collector-orange"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={newExpense.description}
              onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add notes about this expense..."
              className="border-2 border-collector-gold/30 focus:border-collector-orange"
            />
          </div>

          <div>
            <Label htmlFor="splitType">Split Type</Label>
            <Select value={splitType} onValueChange={(value: 'equal' | 'percentage' | 'custom') => setSplitType(value)}>
              <SelectTrigger className="border-2 border-collector-gold/30 focus:border-collector-orange">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                <SelectItem value="equal">Split Equally</SelectItem>
                <SelectItem value="percentage">By Percentage</SelectItem>
                <SelectItem value="custom">Custom Amounts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Member Selection */}
          <div className="space-y-4">
            <Label>Select Members and Set Amounts</Label>
            
            {/* Current User */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-gradient rounded-full flex items-center justify-center text-white font-medium mr-3">
                      {user.user_metadata?.full_name?.[0] || user.email?.[0]}
                    </div>
                    <div>
                      <p className="font-medium">{user.user_metadata?.full_name || user.email}</p>
                      <p className="text-sm text-gray-600">You (paid)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-blue-600">
                      ${newExpense.total_amount ? calculateUserAmount() : '0.00'}
                    </p>
                    <p className="text-xs text-gray-500">Your share</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Group Members */}
            <div className="space-y-2">
              {groupMembers
                .filter((member) => member.user_id !== user.id)
                .map((member) => {
                  const isSelected = selectedMembers.includes(member.user_id);
                  let memberAmount = '0.00';
                  
                  if (isSelected && newExpense.total_amount) {
                    if (splitType === 'equal') {
                      memberAmount = calculateEqualSplit();
                    } else if (splitType === 'percentage') {
                      const percentage = parseFloat(memberSplits[member.user_id]) || 0;
                      memberAmount = ((parseFloat(newExpense.total_amount) * percentage) / 100).toFixed(2);
                    } else {
                      memberAmount = memberSplits[member.user_id] || '0.00';
                    }
                  }

                  return (
                    <Card 
                      key={member.id} 
                      className={`cursor-pointer transition-all ${
                        isSelected ? 'border-collector-orange bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleMemberToggle(member.user_id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium mr-3">
                              {member.profiles?.full_name?.[0] || member.profiles?.email?.[0]}
                            </div>
                            <div>
                              <p className="font-medium">{member.profiles?.full_name || member.profiles?.email}</p>
                              <p className="text-sm text-gray-600">{member.profiles?.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {isSelected && splitType !== 'equal' && (
                              <div className="text-right">
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder={splitType === 'percentage' ? '0' : '0.00'}
                                  value={memberSplits[member.user_id] || ''}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleSplitChange(member.user_id, e.target.value);
                                  }}
                                  className="w-20 text-sm text-right border-2 border-collector-gold/30 focus:border-collector-orange"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  {splitType === 'percentage' ? '%' : '$'}
                                </p>
                              </div>
                            )}
                            <div className="text-right">
                              <p className={`font-medium ${isSelected ? 'text-collector-orange' : 'text-gray-400'}`}>
                                ${memberAmount}
                              </p>
                              <p className="text-xs text-gray-500">
                                {isSelected ? 'owes' : 'not included'}
                              </p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 ${
                              isSelected ? 'bg-collector-orange border-collector-orange' : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 hover:bg-gray-200 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !newExpense.title || !newExpense.total_amount || selectedMembers.length === 0}
              className="flex-1 bg-blue-500 hover:bg-blue-200 text-white hover:text-collector-black transition-all duration-200"
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;
