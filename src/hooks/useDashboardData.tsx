
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

interface Budget {
  id: string;
  name: string;
  amount: number;
  category: string;
  period: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export const useDashboardData = (timePeriod: "day" | "week" | "month" | "quarter" | "year") => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const getDateRange = (period: "day" | "week" | "month" | "quarter" | "year") => {
    const now = new Date();
    const start = new Date();

    switch (period) {
      case "day":
        start.setHours(0, 0, 0, 0);
        break;
      case "week":
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        break;
      case "month":
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      case "quarter": {
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        start.setMonth(quarterStart, 1);
        start.setHours(0, 0, 0, 0);
        break;
      }
      case "year":
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        break;
    }

    return {
      start: start.toISOString().split("T")[0],
      end: now.toISOString().split("T")[0],
    };
  };

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      const { start, end } = getDateRange(timePeriod);

      const { data: transactions, error: transError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: false });

      if (transError) throw transError;

      const totalIncome =
        transactions
          ?.filter((t) => t.type === "income")
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const totalExpense =
        transactions
          ?.filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const balance = totalIncome - totalExpense;

      setStats({
        totalIncome,
        totalExpense,
        balance,
        transactionCount: transactions?.length || 0,
      });

      const mappedAllTransactions =
        transactions?.map((t) => ({
          id: t.id,
          title: t.title,
          amount: Number(t.amount),
          type: t.type as "income" | "expense",
          category: t.category,
          date: t.date,
          description: t.description || "",
          created_at: t.created_at,
          updated_at: t.updated_at,
        })) || [];
      setAllTransactions(mappedAllTransactions);

      const mappedTransactions = mappedAllTransactions.slice(0, 4);
      setRecentTransactions(mappedTransactions);

      const { data: budgetData, error: budgetError } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (budgetError) {
        console.error("Budget fetch error:", budgetError);
        throw budgetError;
      }
      setBudgets(budgetData || []);

      if (budgetData && budgetData.length > 0) {
        console.log(`✅ Loaded ${budgetData.length} budgets successfully`);
      }
    } catch (error: unknown) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [user, timePeriod]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    recentTransactions,
    budgets,
    allTransactions,
    loading,
    refetchData: fetchDashboardData,
  };
};

export type { Transaction, Budget, DashboardStats };
