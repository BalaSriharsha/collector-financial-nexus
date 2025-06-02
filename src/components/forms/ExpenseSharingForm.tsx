import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ExpenseSharingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType: 'individual' | 'organization';
}

const ExpenseSharingForm = ({ open, onOpenChange, userType }: ExpenseSharingFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [expenseTitle, setExpenseTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [description, setDescription] = useState("");
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Fetch user's groups
  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members(
            id,
            user_id,
            profiles(id, full_name, email)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Get selected group details
  const selectedGroup = groups?.find(g => g.id === selectedGroupId);
  const groupMembers = selectedGroup?.group_members || [];

  const resetForm = () => {
    setSelectedGroupId("");
    setExpenseTitle("");
    setTotalAmount("");
    setDescription("");
    setSplitType('equal');
    setSelectedMembers([]);
    setCustomAmounts({});
  };

  const calculateEqualSplit = () => {
    if (totalAmount && selectedMembers.length > 0) {
      return (parseFloat(totalAmount) / (selectedMembers.length + 1)).toFixed(2); // +1 for current user
    }
    return "0.00";
  };

  const calculateUserAmount = () => {
    if (splitType === 'equal') {
      return calculateEqualSplit();
    } else {
      const membersTotal = selectedMembers.reduce((sum, memberId) => {
        return sum + (parseFloat(customAmounts[memberId]) || 0);
      }, 0);
      return (parseFloat(totalAmount) - membersTotal).toFixed(2);
    }
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => {
      const updated = prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId];
      
      // Reset custom amounts when members change
      if (splitType === 'custom') {
        setCustomAmounts(prevAmounts => {
          const newAmounts = { ...prevAmounts };
          if (!updated.includes(memberId)) {
            delete newAmounts[memberId];
          }
          return newAmounts;
        });
      }
      
      return updated;
    });
  };

  const handleCustomAmountChange = (memberId: string, amount: string) => {
    setCustomAmounts(prev => ({
      ...prev,
      [memberId]: amount
    }));
  };

  const handleSubmit = async () => {
    if (!user || !selectedGroupId || !expenseTitle || !totalAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error('Please select at least one group member');
      return;
    }

    setLoading(true);
    try {
      // Create shared expense
      const { data: expense, error: expenseError } = await supabase
        .from('shared_expenses')
        .insert({
          title: expenseTitle,
          description,
          total_amount: parseFloat(totalAmount),
          created_by: user.id,
          group_id: selectedGroupId,
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Calculate amounts and create participants
      const participants = [];
      
      // Add current user
      const userAmount = parseFloat(calculateUserAmount());
      participants.push({
        shared_expense_id: expense.id,
        user_id: user.id,
        amount_owed: userAmount,
      });

      // Add selected members
      selectedMembers.forEach(memberId => {
        const amount = splitType === 'equal' 
          ? parseFloat(calculateEqualSplit())
          : parseFloat(customAmounts[memberId]) || 0;
        
        participants.push({
          shared_expense_id: expense.id,
          user_id: memberId,
          amount_owed: amount,
        });
      });

      const { error: participantsError } = await supabase
        .from('shared_expense_participants')
        .insert(participants);

      if (participantsError) throw participantsError;

      toast.success(`Expense "${expenseTitle}" shared successfully!`);
      resetForm();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['shared-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      
      // Navigate to groups page after a short delay to allow the toast to show
      setTimeout(() => {
        navigate('/groups');
      }, 500);
    } catch (error: unknown) {
      console.error('Error creating shared expense:', error);
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as { message: string }).message 
        : 'Failed to create shared expense';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-playfair text-collector-black">Share Expense</SheetTitle>
          <SheetDescription>
            Split expenses with your group members, similar to Splitwise.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Group Selection */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="groupSelect">Select Group</Label>
              {groups && groups.length > 0 ? (
                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          {group.name} ({group.group_members?.length || 0} members)
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                  <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-3">No groups found. Create a group first to share expenses.</p>
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600 hover:border-blue-700"
                    onClick={() => {
                      onOpenChange(false);
                      navigate('/groups');
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Group
                  </Button>
                </div>
              )}
            </div>

            {selectedGroupId && (
              <>
                {/* Expense Details */}
                <div>
                  <Label htmlFor="expenseTitle">Expense Title</Label>
                  <Input
                    id="expenseTitle"
                    placeholder="e.g., Dinner at restaurant, Uber ride..."
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="totalAmount">Total Amount ($)</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
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
                      <SelectItem value="equal">Split Equally</SelectItem>
                      <SelectItem value="custom">Custom Amounts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Group Members Selection */}
                <div className="space-y-4">
                  <Label>Select Members to Include</Label>
                  
                  {/* Current User */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                            {user.user_metadata?.full_name?.[0] || user.email?.[0]}
                          </div>
                          <div>
                            <p className="font-medium">{user.user_metadata?.full_name || user.email}</p>
                            <p className="text-sm text-gray-600">You (paid)</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-blue-600">
                            ${totalAmount ? calculateUserAmount() : '0.00'}
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
                        const memberAmount = splitType === 'equal' 
                          ? calculateEqualSplit() 
                          : customAmounts[member.user_id] || '0.00';

                        return (
                          <Card 
                            key={member.id} 
                            className={`cursor-pointer transition-all ${
                              isSelected ? 'border-orange-500 bg-orange-50 text-orange-900' : 'border-slate-300 hover:border-slate-400 bg-white text-slate-900 dark:border-slate-600 dark:hover:border-slate-500 dark:bg-slate-800 dark:text-slate-100'
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
                                  {isSelected && splitType === 'custom' && (
                                    <div className="text-right">
                                      <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={customAmounts[member.user_id] || ''}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          handleCustomAmountChange(member.user_id, e.target.value);
                                        }}
                                        className="w-20 text-sm text-right"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </div>
                                  )}
                                  <div className="text-right">
                                    <p className={`font-medium ${isSelected ? 'text-collector-orange' : 'text-gray-400'}`}>
                                      ${isSelected ? memberAmount : '0.00'}
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

                {/* Summary */}
                {selectedMembers.length > 0 && totalAmount && (
                  <Card className="border-collector-gold/20 bg-collector-white/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Expense Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="font-medium">${totalAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>People Involved:</span>
                        <span className="font-medium">{selectedMembers.length + 1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Your Share:</span>
                        <span className="font-medium text-blue-600">${calculateUserAmount()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Others Owe:</span>
                        <span className="font-medium text-collector-orange">
                          ${splitType === 'equal' 
                            ? (parseFloat(calculateEqualSplit()) * selectedMembers.length).toFixed(2)
                            : selectedMembers.reduce((sum, id) => sum + (parseFloat(customAmounts[id]) || 0), 0).toFixed(2)
                          }
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !selectedGroupId || selectedMembers.length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600 hover:border-blue-700"
            >
              {loading ? 'Creating...' : 'Share Expense'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ExpenseSharingForm;
