import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { useTeam } from "@/providers/team-provider";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  parseISO,
} from "date-fns";

type TransactionRow = {
  date: string;
  amount: number;
  type: "expense" | "income";
  categories?: { name?: string | null } | null;
};

export type MonthlySummary = {
  totalExpense: number;
  totalIncome: number;
  balance: number;
  prevMonthExpense: number;
  prevMonthIncome: number;
};

export type MonthlyChartData = {
  month: string;
  expense: number;
  income: number;
};

export type CategoryBreakdown = {
  name: string;
  value: number;
  color: string;
};

export type TotalBalance = {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
};

export function useTotalBalance() {
  const supabase = useSupabase();
  const { teamId } = useTeam();

  return useQuery({
    queryKey: ["dashboard-total-balance", teamId],
    enabled: Boolean(teamId),
    queryFn: async () => {
      if (!teamId) throw new Error("Team not selected");

      const { data, error } = await supabase
        .from("transactions")
        .select("amount, type")
        .eq("team_id", teamId);

      if (error) throw error;

      const totals = (data ?? []).reduce(
        (acc, row) => {
          if (row.type === "expense") {
            acc.totalExpense += row.amount;
          } else {
            acc.totalIncome += row.amount;
          }
          return acc;
        },
        { totalIncome: 0, totalExpense: 0 }
      );

      return {
        totalBalance: totals.totalIncome - totals.totalExpense,
        totalIncome: totals.totalIncome,
        totalExpense: totals.totalExpense,
      } as TotalBalance;
    },
  });
}

const CHART_COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00C49F",
  "#FFBB28",
];

export function useDashboardSummary() {
  const supabase = useSupabase();
  const { teamId } = useTeam();

  return useQuery({
    queryKey: ["dashboard-summary", teamId],
    enabled: Boolean(teamId),
    queryFn: async () => {
      if (!teamId) throw new Error("Team not selected");

      const now = new Date();
      const thisMonthStart = format(startOfMonth(now), "yyyy-MM-dd");
      const thisMonthEnd = format(endOfMonth(now), "yyyy-MM-dd");
      const prevMonthStart = format(
        startOfMonth(subMonths(now, 1)),
        "yyyy-MM-dd"
      );
      const prevMonthEnd = format(endOfMonth(subMonths(now, 1)), "yyyy-MM-dd");

      // 今月のデータ
      const { data: thisMonthData, error: thisMonthError } = await supabase
        .from("transactions")
        .select("amount, type")
        .eq("team_id", teamId)
        .gte("date", thisMonthStart)
        .lte("date", thisMonthEnd);

      if (thisMonthError) throw thisMonthError;

      // 先月のデータ
      const { data: prevMonthData, error: prevMonthError } = await supabase
        .from("transactions")
        .select("amount, type")
        .eq("team_id", teamId)
        .gte("date", prevMonthStart)
        .lte("date", prevMonthEnd);

      if (prevMonthError) throw prevMonthError;

      const calcTotals = (data: { amount: number; type: string }[]) => {
        const expense = data
          .filter((r) => r.type === "expense")
          .reduce((sum, r) => sum + r.amount, 0);
        const income = data
          .filter((r) => r.type === "income")
          .reduce((sum, r) => sum + r.amount, 0);
        return { expense, income };
      };

      const thisMonth = calcTotals(thisMonthData ?? []);
      const prevMonth = calcTotals(prevMonthData ?? []);

      return {
        totalExpense: thisMonth.expense,
        totalIncome: thisMonth.income,
        balance: thisMonth.income - thisMonth.expense,
        prevMonthExpense: prevMonth.expense,
        prevMonthIncome: prevMonth.income,
      } as MonthlySummary;
    },
  });
}

export function useMonthlyChart() {
  const supabase = useSupabase();
  const { teamId } = useTeam();

  return useQuery({
    queryKey: ["dashboard-monthly-chart", teamId],
    enabled: Boolean(teamId),
    queryFn: async () => {
      if (!teamId) throw new Error("Team not selected");

      const now = new Date();
      const sixMonthsAgo = subMonths(now, 5);
      const startDate = format(startOfMonth(sixMonthsAgo), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("transactions")
        .select("date, amount, type")
        .eq("team_id", teamId)
        .gte("date", startDate)
        .order("date", { ascending: true });

      if (error) throw error;

      // 月別に集計
      const monthlyMap = new Map<string, { expense: number; income: number }>();

      // 過去6ヶ月分の空データを初期化
      for (let i = 5; i >= 0; i--) {
        const month = format(subMonths(now, i), "yyyy-MM");
        monthlyMap.set(month, { expense: 0, income: 0 });
      }

      // データを集計
      (data ?? []).forEach((row) => {
        const month = format(parseISO(row.date), "yyyy-MM");
        const current = monthlyMap.get(month);
        if (current) {
          if (row.type === "expense") {
            current.expense += row.amount;
          } else {
            current.income += row.amount;
          }
        }
      });

      return Array.from(monthlyMap.entries()).map(([month, values]) => ({
        month: format(parseISO(`${month}-01`), "M月"),
        expense: values.expense,
        income: values.income,
      })) as MonthlyChartData[];
    },
  });
}

export function useCategoryBreakdown() {
  const supabase = useSupabase();
  const { teamId } = useTeam();

  return useQuery({
    queryKey: ["dashboard-category-breakdown", teamId],
    enabled: Boolean(teamId),
    queryFn: async () => {
      if (!teamId) throw new Error("Team not selected");

      const now = new Date();
      const thisMonthStart = format(startOfMonth(now), "yyyy-MM-dd");
      const thisMonthEnd = format(endOfMonth(now), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("transactions")
        .select("amount, type, categories ( name )")
        .eq("team_id", teamId)
        .eq("type", "expense")
        .gte("date", thisMonthStart)
        .lte("date", thisMonthEnd);

      if (error) throw error;

      // カテゴリ別に集計
      const categoryMap = new Map<string, number>();
      (data ?? []).forEach((row) => {
        const categoryName = row.categories?.name ?? "未分類";
        const current = categoryMap.get(categoryName) ?? 0;
        categoryMap.set(categoryName, current + row.amount);
      });

      // 上位5カテゴリ + その他
      const sorted = Array.from(categoryMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, value], index) => ({
          name,
          value,
          color: CHART_COLORS[index % CHART_COLORS.length],
        }));

      if (sorted.length <= 5) {
        return sorted as CategoryBreakdown[];
      }

      const top5 = sorted.slice(0, 5);
      const others = sorted.slice(5).reduce((sum, item) => sum + item.value, 0);

      return [
        ...top5,
        { name: "その他", value: others, color: CHART_COLORS[5] },
      ] as CategoryBreakdown[];
    },
  });
}
