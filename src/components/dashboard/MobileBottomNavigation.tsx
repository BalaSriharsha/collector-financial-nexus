
import { Button } from "@/components/ui/button";
import { PlusCircle, Target, Upload, Users, BarChart3, Archive, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MobileBottomNavigationProps {
  onAddTransaction: () => void;
  onCreateBudget: () => void;
  onUploadInvoice: () => void;
  onExpenseShare: () => void;
  onViewReports: () => void;
  onViewArchive: () => void;
}

const MobileBottomNavigation = ({
  onAddTransaction,
  onCreateBudget,
  onUploadInvoice,
  onExpenseShare,
  onViewReports,
  onViewArchive,
}: MobileBottomNavigationProps) => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t-2 border-slate-300 dark:border-slate-700 md:hidden z-50 shadow-lg">
      <div className="grid grid-cols-7 h-16">
        <Button
          onClick={onAddTransaction}
          variant="ghost"
          className="flex flex-col items-center justify-center gap-1 h-full text-slate-700 hover:text-blue-700 hover:bg-blue-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-none"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="text-[10px] leading-none">Add</span>
        </Button>
        <Button
          onClick={onCreateBudget}
          variant="ghost"
          className="flex flex-col items-center justify-center gap-1 h-full text-slate-700 hover:text-orange-700 hover:bg-orange-50 dark:text-slate-300 dark:hover:text-orange-400 dark:hover:bg-orange-900/20 rounded-none"
        >
          <Target className="w-4 h-4" />
          <span className="text-[10px] leading-none">Budget</span>
        </Button>
        <Button
          onClick={onUploadInvoice}
          variant="ghost"
          className="flex flex-col items-center justify-center gap-1 h-full text-slate-700 hover:text-purple-700 hover:bg-purple-50 dark:text-slate-300 dark:hover:text-purple-400 dark:hover:bg-purple-900/20 rounded-none"
        >
          <Upload className="w-4 h-4" />
          <span className="text-[10px] leading-none">Upload</span>
        </Button>
        <Button
          onClick={onExpenseShare}
          variant="ghost"
          className="flex flex-col items-center justify-center gap-1 h-full text-slate-700 hover:text-pink-700 hover:bg-pink-50 dark:text-slate-300 dark:hover:text-pink-400 dark:hover:bg-pink-900/20 rounded-none"
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px] leading-none">Groups</span>
        </Button>
        <Button
          onClick={onViewReports}
          variant="ghost"
          className="flex flex-col items-center justify-center gap-1 h-full text-slate-700 hover:text-cyan-700 hover:bg-cyan-50 dark:text-slate-300 dark:hover:text-cyan-400 dark:hover:bg-cyan-900/20 rounded-none"
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-[10px] leading-none">Reports</span>
        </Button>
        <Button
          onClick={onViewArchive}
          variant="ghost"
          className="flex flex-col items-center justify-center gap-1 h-full text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800 rounded-none"
        >
          <Archive className="w-4 h-4" />
          <span className="text-[10px] leading-none">Archive</span>
        </Button>
        <Button
          onClick={() => navigate("/profile")}
          variant="ghost"
          className="flex flex-col items-center justify-center gap-1 h-full text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-none"
        >
          <User className="w-4 h-4" />
          <span className="text-[10px] leading-none">Profile</span>
        </Button>
      </div>
    </div>
  );
};

export default MobileBottomNavigation;
