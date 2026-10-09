import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api";

interface UseExpenseSummaryProps {
  startDate?: string;
  endDate?: string;
}

const fetchExpenseSummary = async (startDate?: string, endDate?: string) => {
  const params: Record<string, string> = {};

  if (startDate && endDate) {
    params.start_date = startDate;
    params.end_date = endDate;
  }

  const { data } = await api.get("/expense/summary", {
    params,
  });

  return data;
};

export function useExpenseSummary({
  startDate,
  endDate,
}: UseExpenseSummaryProps) {
  return useQuery({
    queryKey: ["expense-summary", startDate, endDate],
    queryFn: () => fetchExpenseSummary(startDate, endDate),
    staleTime: 5 * 60 * 1000,
  });
}
