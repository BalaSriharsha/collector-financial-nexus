
import { Button } from "@/components/ui/button";
import { PlusCircle, Target, FileText, Upload, Users, BarChart3, Archive } from "lucide-react";

interface QuickActionsMenuProps {
  userType: "individual" | "organization";
  onAddTransaction: () => void;
  onCreateBudget: () => void;
  onGenerateInvoice: () => void;
  onUploadInvoice: () => void;
  onExpenseShare: () => void;
  onViewReports: () => void;
  onViewArchive: () => void;
}

const QuickActionsMenu = ({
  userType,
  onAddTransaction,
  onCreateBudget,
  onGenerateInvoice,
  onUploadInvoice,
  onExpenseShare,
  onViewReports,
  onViewArchive,
}: QuickActionsMenuProps) => {
  return (
    <div className="mb-6 sm:mb-8 hidden md:block">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4">
        <Button
          onClick={onAddTransaction}
          variant="ghost"
          className="bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-slate-700 dark:text-slate-300 transition-all duration-200"
        >
          <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
          <span className="text-xs sm:text-sm font-medium text-center leading-tight text-slate-800 dark:text-slate-100">
            Add Transaction
          </span>
        </Button>

        <Button
          onClick={onCreateBudget}
          variant="ghost"
          className="bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-slate-700 dark:text-slate-300 transition-all duration-200"
        >
          <Target className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
          <span className="text-xs sm:text-sm font-medium text-center leading-tight text-slate-800 dark:text-slate-100">
            Create Budget
          </span>
        </Button>

        {userType === "organization" && (
          <Button
            onClick={onGenerateInvoice}
            variant="ghost"
            className="bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-slate-700 dark:text-slate-300 transition-all duration-200"
          >
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            <span className="text-xs sm:text-sm font-medium text-center leading-tight text-slate-800 dark:text-slate-100">
              Generate Invoice
            </span>
          </Button>
        )}

        <Button
          onClick={onUploadInvoice}
          variant="ghost"
          className="bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-slate-700 dark:text-slate-300 transition-all duration-200"
        >
          <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
          <span className="text-xs sm:text-sm font-medium text-center leading-tight text-slate-800 dark:text-slate-100">
            Upload
          </span>
        </Button>

        <Button
          onClick={onExpenseShare}
          variant="ghost"
          className="bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-slate-700 dark:text-slate-300 transition-all duration-200"
        >
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 dark:text-pink-400" />
          <span className="text-xs sm:text-sm font-medium text-center leading-tight text-slate-800 dark:text-slate-100">
            Expense Share
          </span>
        </Button>

        <Button
          onClick={onViewReports}
          variant="ghost"
          className="bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-slate-700 dark:text-slate-300 transition-all duration-200"
        >
          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 dark:text-cyan-400" />
          <span className="text-xs sm:text-sm font-medium text-center leading-tight text-slate-800 dark:text-slate-100">
            Reports
          </span>
        </Button>

        <Button
          onClick={onViewArchive}
          variant="ghost"
          className="bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-slate-700 dark:text-slate-300 transition-all duration-200"
        >
          <Archive className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-400" />
          <span className="text-xs sm:text-sm font-medium text-center leading-tight text-slate-800 dark:text-slate-100">
            Archive
          </span>
        </Button>
      </div>
    </div>
  );
};

export default QuickActionsMenu;
