
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Plus, Trash2 } from "lucide-react";

interface ExpenseData {
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
}

interface GroupExpensesProps {
  expenses: ExpenseData[] | undefined;
  isLoading: boolean;
  userId: string;
  onAddExpense: () => void;
  onDeleteExpense: (expenseId: string) => void;
}

const GroupExpenses = ({ expenses, isLoading, userId, onAddExpense, onDeleteExpense }: GroupExpensesProps) => {
  return (
    <Card className="shadow-lg border-collector-gold/20">
      <CardHeader>
        <CardTitle>Group Expenses</CardTitle>
        <CardDescription>Shared expenses within this group</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
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
                      {expense.created_by === userId && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDeleteExpense(expense.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-200 transition-all duration-200"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
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
                onClick={onAddExpense}
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
  );
};

export default GroupExpenses;
