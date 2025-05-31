
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { PiggyBank } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import GroupHeader from "@/components/group/GroupHeader";
import GroupExpenses from "@/components/group/GroupExpenses";
import GroupMembers from "@/components/group/GroupMembers";
import AddExpenseModal from "@/components/group/AddExpenseModal";

type GroupMember = {
  id: string;
  role: string;
  user_id: string;
  profiles: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
};

type GroupData = {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  group_members: GroupMember[];
};

type ExpenseData = {
  id: string;
  title: string;
  description: string | null;
  total_amount: number;
  created_by: string;
  created_at: string | null;
  group_id: string | null;
  profiles: {
    full_name: string | null;
  } | null;
  shared_expense_participants: {
    id: string;
    user_id: string;
    amount_owed: number;
    paid: boolean | null;
    profiles: {
      full_name: string | null;
      email: string | null;
    } | null;
  }[];
};

const GroupDetail = () => {
  const { groupId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showCreateBudget, setShowCreateBudget] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch group details
  const { data: group, isLoading: isGroupLoading } = useQuery({
    queryKey: ['group', groupId],
    queryFn: async (): Promise<GroupData | null> => {
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
      return data as GroupData;
    },
    enabled: !!groupId,
  });

  // Fetch group expenses
  const { data: expenses, isLoading: isExpensesLoading } = useQuery({
    queryKey: ['group-expenses', groupId],
    queryFn: async (): Promise<ExpenseData[]> => {
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
      return data as ExpenseData[];
    },
    enabled: !!groupId,
  });

  const handleSubmitExpense = async (expenseData: any, selectedMembers: string[], memberSplits: Record<string, string>, splitType: string) => {
    if (!user || !groupId || !expenseData.title || !expenseData.total_amount) {
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
          title: expenseData.title,
          description: expenseData.description,
          total_amount: parseFloat(expenseData.total_amount),
          created_by: user.id,
          group_id: groupId,
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Calculate amounts and create participants
      const participants = [];
      
      // Add current user
      const calculateUserAmount = () => {
        if (splitType === 'equal') {
          return parseFloat(expenseData.total_amount) / (selectedMembers.length + 1);
        } else if (splitType === 'percentage') {
          const totalPercentage = selectedMembers.reduce((sum, id) => sum + (parseFloat(memberSplits[id]) || 0), 0);
          const userPercentage = 100 - totalPercentage;
          return (parseFloat(expenseData.total_amount) * userPercentage) / 100;
        } else {
          const membersTotal = selectedMembers.reduce((sum, id) => sum + (parseFloat(memberSplits[id]) || 0), 0);
          return parseFloat(expenseData.total_amount) - membersTotal;
        }
      };

      const userAmount = calculateUserAmount();
      participants.push({
        shared_expense_id: expense.id,
        user_id: user.id,
        amount_owed: userAmount,
      });

      // Add selected members
      selectedMembers.forEach(memberId => {
        let amount = 0;
        if (splitType === 'equal') {
          amount = parseFloat(expenseData.total_amount) / (selectedMembers.length + 1);
        } else if (splitType === 'percentage') {
          amount = (parseFloat(expenseData.total_amount) * (parseFloat(memberSplits[memberId]) || 0)) / 100;
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

      toast.success(`Expense "${expenseData.title}" added successfully!`);
      setShowAddExpense(false);
      queryClient.invalidateQueries({ queryKey: ['group-expenses', groupId] });
    } catch (error: any) {
      console.error('Error creating expense:', error);
      toast.error(error.message || 'Failed to create expense');
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
        <GroupHeader
          group={group}
          groupMembers={groupMembers}
          isCreator={isCreator}
          onAddExpense={() => setShowAddExpense(true)}
          onCreateBudget={() => setShowCreateBudget(true)}
        />

        <Tabs defaultValue="expenses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses">
            <GroupExpenses
              expenses={expenses}
              isLoading={isExpensesLoading}
              userId={user.id}
              onAddExpense={() => setShowAddExpense(true)}
              onDeleteExpense={handleDeleteExpense}
            />
          </TabsContent>

          <TabsContent value="budgets">
            <Card className="shadow-lg border-collector-gold/20">
              <CardHeader>
                <CardTitle>Group Budgets</CardTitle>
                <CardDescription>Shared budgets for this group (Coming Soon)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <PiggyBank className="w-16 h-16 text-collector-black/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-collector-black/70 mb-2">Group Budgets Coming Soon</h3>
                  <p className="text-collector-black/50 mb-4">Group budget functionality will be available once the database schema is updated</p>
                  <p className="text-sm text-collector-black/40">For now, please create budgets from your individual dashboard</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <GroupMembers members={groupMembers} />
          </TabsContent>
        </Tabs>

        <AddExpenseModal
          open={showAddExpense}
          onOpenChange={setShowAddExpense}
          groupMembers={groupMembers}
          user={user}
          onSubmit={handleSubmitExpense}
          loading={loading}
        />

        {/* Create Budget Modal - Disabled for now */}
        <Dialog open={showCreateBudget} onOpenChange={setShowCreateBudget}>
          <DialogContent className="border-2 border-collector-gold/30">
            <DialogHeader>
              <DialogTitle>Group Budgets Not Available</DialogTitle>
              <DialogDescription>
                Group budget functionality is coming soon
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-center text-collector-black/70">
                Group budgets are not yet supported in the current database schema.
                Please create budgets from your individual dashboard for now.
              </p>
              <div className="flex justify-center">
                <Button
                  onClick={() => setShowCreateBudget(false)}
                  className="bg-gray-500 hover:bg-gray-200 text-white hover:text-collector-black transition-all duration-200"
                >
                  Close
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
