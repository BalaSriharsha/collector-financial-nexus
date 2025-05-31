
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Users, PiggyBank } from "lucide-react";

interface GroupHeaderProps {
  group: {
    id: string;
    name: string;
    description: string | null;
    created_by: string;
  };
  groupMembers: any[];
  isCreator: boolean;
  onAddExpense: () => void;
  onCreateBudget: () => void;
}

const GroupHeader = ({ group, groupMembers, isCreator, onAddExpense, onCreateBudget }: GroupHeaderProps) => {
  return (
    <>
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
            onClick={onCreateBudget}
            className="bg-green-500 hover:bg-green-200 text-white hover:text-collector-black transition-all duration-200"
          >
            <PiggyBank className="w-4 h-4 mr-2" />
            Create Budget
          </Button>
          <Button
            onClick={onAddExpense}
            className="bg-blue-500 hover:bg-blue-200 text-white hover:text-collector-black transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>
    </>
  );
};

export default GroupHeader;
