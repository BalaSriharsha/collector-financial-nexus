import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit, Trash2, DollarSign, Users, PiggyBank } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GroupDetail = () => {
  const { groupId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showCreateBudget, setShowCreateBudget] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: "",
    description: "",
    total_amount: "",
  });
  const [newBudget, setNewBudget] = useState({
    name: "",
    amount: "",
    category: "",
    period: "monthly",
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
  });
  const [splitType, setSplitType] = useState<'equal' | 'percentage' | 'custom'>('equal');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberSplits, setMemberSplits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const categories = ["food", "transport", "entertainment", "utilities", "healthcare", "shopping", "education", "other"];

  // Fetch group details
  const { data: group, isLoading: isGroupLoading } = useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      if (!groupId) return null;
      
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members(
            id,
            role,
            user_id,
            profiles(id, full_name, email)
          )
        `)
        .eq('id', groupId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!groupId,
  });

  // Fetch group expenses
  const { data: expenses, isLoading: isExpensesLoading } = useQuery({
    queryKey: ['group-expenses', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      const { data, error } = await supabase
        .from('shared_expenses')
        .select(`
          *,
          profiles(full_name),
          shared_expense_participants(
            id,
            user_id,
            amount_owed,
            paid,
            profiles(full_name, email)
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!groupId,
  });

  // Fetch group budgets
  const { data: groupBudgets, isLoading: isBudgetsLoading } = useQuery({
    queryKey: ['group-budgets', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!groupId,
  });

  const resetExpenseForm = () => {
    setNewExpense({ title: "", description: "", total_amount: "" });
    setSplitType('equal');
    setSelectedMembers([]);
    setMemberSplits({});
  };

  const resetBudgetForm = () => {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    
    setNewBudget({
      name: "",
      amount: "",
      category: "",
      period: "monthly",
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    });
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => {
      const updated = prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId];
      
      // Reset splits when members change
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

  const handleSubmitExpense = async () => {
    if (!user || !groupId || !newExpense.title || !newExpense.total_amount) {
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
          title: newExpense.title,
          description: newExpense.description,
          total_amount: parseFloat(newExpense.total_amount),
          created_by: user.id,
          group_id: groupId,
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
        let amount = 0;
        if (splitType === 'equal') {
          amount = parseFloat(calculateEqualSplit());
        } else if (splitType === 'percentage') {
          amount = (parseFloat(newExpense.total_amount) * (parseFloat(memberSplits[memberId]) || 0)) / 100;
        } else {
          amount = parseFloat(memberSplits[memberId]) || 0;
        }
        
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

      toast.success(`Expense "${newExpense.title}" added successfully!`);
      resetExpenseForm();
      setShowAddExpense(false);
      queryClient.invalidateQueries({ queryKey: ['group-expenses', groupId] });
    } catch (error: any) {
      console.error('Error creating expense:', error);
      toast.error(error.message || 'Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBudget = async () => {
    if (!user || !groupId || !newBudget.name || !newBudget.amount || !newBudget.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('budgets')
        .insert({
          name: newBudget.name,
          amount: parseFloat(newBudget.amount),
          category: newBudget.category,
          period: newBudget.period,
          start_date: newBudget.start_date,
          end_date: newBudget.end_date,
          user_id: user.id,
          group_id: groupId,
        });

      if (error) throw error;

      toast.success('Group budget created successfully!');
      resetBudgetForm();
      setShowCreateBudget(false);
      queryClient.invalidateQueries({ queryKey: ['group-budgets', groupId] });
    } catch (error: any) {
      console.error('Error creating budget:', error);
      toast.error(error.message || 'Failed to create budget');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const { error } = await supabase
        .from('shared_expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      toast.success('Expense deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['group-expenses', groupId] });
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      toast.error(error.message || 'Failed to delete expense');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-collector-black/70">Please log in to view group details.</p>
        </div>
      </div>
    );
  }

  if (isGroupLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-collector-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-collector-black/70">Loading group details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">Group not found</p>
          </div>
        </div>
      </div>
    );
  }

  const groupMembers = group.group_members || [];
  const isCreator = group.created_by === user?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/groups" className="inline-flex items-center text-collector-black/70 hover:text-collector-orange transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Groups
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-collector-black mb-2">
              {group.name}
            </h1>
            <p className="text-collector-black/70">{group.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Users className="w-4 h-4 text-collector-black/60" />
              <span className="text-sm text-collector-black/60">
                {groupMembers.length} members
              </span>
              {isCreator && (
                <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                  Creator
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowCreateBudget(true)}
              className="bg-green-500 hover:bg-green-200 text-white hover:text-collector-black transition-all duration-200"
            >
              <PiggyBank className="w-4 h-4 mr-2" />
              Create Budget
            </Button>
            <Button
              onClick={() => setShowAddExpense(true)}
              className="bg-blue-500 hover:bg-blue-200 text-white hover:text-collector-black transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>

        <Tabs defaultValue="expenses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses">
            {/* Group Expenses */}
            <Card className="shadow-lg border-collector-gold/20">
              <CardHeader>
                <CardTitle>Group Expenses</CardTitle>
                <CardDescription>Shared expenses within this group</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isExpensesLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-collector-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-collector-black/70">Loading expenses...</p>
                    </div>
                  ) : expenses && expenses.length > 0 ? (
                    expenses.map((expense) => (
                      <Card key={expense.id} className="border-collector-gold/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-collector-black">{expense.title}</h3>
                              <p className="text-sm text-collector-black/60">{expense.description}</p>
                              <p className="text-sm text-collector-black/60">
                                Created by: {expense.profiles?.full_name}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-bold text-lg text-collector-orange">
                                  ${Number(expense.total_amount).toFixed(2)}
                                </p>
                                <p className="text-sm text-collector-black/60">
                                  {expense.shared_expense_participants?.length || 0} participants
                                </p>
                              </div>
                              {expense.created_by === user.id && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteExpense(expense.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-200 transition-all duration-200"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {/* Participants breakdown */}
                          {expense.shared_expense_participants && expense.shared_expense_participants.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-collector-gold/20">
                              <p className="text-sm font-medium text-collector-black mb-2">Participants:</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {expense.shared_expense_participants.map((participant: any) => (
                                  <div key={participant.id} className="flex items-center justify-between text-sm">
                                    <span>{participant.profiles?.full_name || participant.profiles?.email}</span>
                                    <span className={`font-medium ${participant.paid ? 'text-green-600' : 'text-red-600'}`}>
                                      ${Number(participant.amount_owed).toFixed(2)} {participant.paid ? '(Paid)' : '(Owes)'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <DollarSign className="w-16 h-16 text-collector-black/30 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-collector-black/70 mb-2">No expenses yet</h3>
                      <p className="text-collector-black/50 mb-4">Add your first shared expense to this group</p>
                      <Button
                        onClick={() => setShowAddExpense(true)}
                        className="bg-blue-500 hover:bg-blue-200 text-white hover:text-collector-black transition-all duration-200"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Expense
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budgets">
            {/* Group Budgets */}
            <Card className="shadow-lg border-collector-gold/20">
              <CardHeader>
                <CardTitle>Group Budgets</CardTitle>
                <CardDescription>Shared budgets for this group</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isBudgetsLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-collector-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-collector-black/70">Loading budgets...</p>
                    </div>
                  ) : groupBudgets && groupBudgets.length > 0 ? (
                    groupBudgets.map((budget) => (
                      <Card key={budget.id} className="border-collector-gold/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-collector-black">{budget.name}</h3>
                              <p className="text-sm text-collector-black/60 capitalize">{budget.category} • {budget.period}</p>
                              <p className="text-sm text-collector-black/60">
                                {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-green-600">
                                ${Number(budget.amount).toFixed(2)}
                              </p>
                              <p className="text-sm text-collector-black/60">Budget</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <PiggyBank className="w-16 h-16 text-collector-black/30 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-collector-black/70 mb-2">No budgets yet</h3>
                      <p className="text-collector-black/50 mb-4">Create your first group budget</p>
                      <Button
                        onClick={() => setShowCreateBudget(true)}
                        className="bg-green-500 hover:bg-green-200 text-white hover:text-collector-black transition-all duration-200"
                      >
                        <PiggyBank className="w-4 h-4 mr-2" />
                        Create Budget
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            {/* Group Members */}
            <Card className="shadow-lg border-collector-gold/20">
              <CardHeader>
                <CardTitle>Group Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupMembers.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-gradient rounded-full flex items-center justify-center text-white font-medium mr-3">
                          {member.profiles?.full_name?.[0] || member.profiles?.email?.[0]}
                        </div>
                        <div>
                          <p className="font-medium">{member.profiles?.full_name || member.profiles?.email}</p>
                          <p className="text-sm text-gray-600">{member.profiles?.email}</p>
                        </div>
                      </div>
                      <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Expense Modal */}
        <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
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
                    .filter((member: any) => member.user_id !== user.id)
                    .map((member: any) => {
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
                  onClick={() => setShowAddExpense(false)}
                  className="flex-1 hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitExpense} 
                  disabled={loading || !newExpense.title || !newExpense.total_amount || selectedMembers.length === 0}
                  className="flex-1 bg-blue-500 hover:bg-blue-200 text-white hover:text-collector-black transition-all duration-200"
                >
                  {loading ? 'Adding...' : 'Add Expense'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Budget Modal */}
        <Dialog open={showCreateBudget} onOpenChange={setShowCreateBudget}>
          <DialogContent className="border-2 border-collector-gold/30">
            <DialogHeader>
              <DialogTitle>Create Group Budget</DialogTitle>
              <DialogDescription>
                Set up a budget for this group
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="budgetName">Budget Name</Label>
                <Input
                  id="budgetName"
                  value={newBudget.name}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Monthly Group Expenses..."
                  className="border-2 border-collector-gold/30 focus:border-collector-orange"
                />
              </div>

              <div>
                <Label htmlFor="budgetAmount">Budget Amount ($)</Label>
                <Input
                  id="budgetAmount"
                  type="number"
                  step="0.01"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  className="border-2 border-collector-gold/30 focus:border-collector-orange"
                />
              </div>

              <div>
                <Label htmlFor="budgetCategory">Category</Label>
                <Select value={newBudget.category} onValueChange={(value) => setNewBudget(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="border-2 border-collector-gold/30 focus:border-collector-orange">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="budgetPeriod">Budget Period</Label>
                <Select value={newBudget.period} onValueChange={(value) => setNewBudget(prev => ({ ...prev, period: value }))}>
                  <SelectTrigger className="border-2 border-collector-gold/30 focus:border-collector-orange">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budgetStartDate">Start Date</Label>
                  <Input
                    id="budgetStartDate"
                    type="date"
                    value={newBudget.start_date}
                    onChange={(e) => setNewBudget(prev => ({ ...prev, start_date: e.target.value }))}
                    className="border-2 border-collector-gold/30 focus:border-collector-orange"
                  />
                </div>
                <div>
                  <Label htmlFor="budgetEndDate">End Date</Label>
                  <Input
                    id="budgetEndDate"
                    type="date"
                    value={newBudget.end_date}
                    onChange={(e) => setNewBudget(prev => ({ ...prev, end_date: e.target.value }))}
                    className="border-2 border-collector-gold/30 focus:border-collector-orange"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateBudget(false)}
                  className="flex-1 hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitBudget} 
                  disabled={loading || !newBudget.name || !newBudget.amount || !newBudget.category}
                  className="flex-1 bg-green-500 hover:bg-green-200 text-white hover:text-collector-black transition-all duration-200"
                >
                  {loading ? 'Creating...' : 'Create Budget'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GroupDetail;
