import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api";

interface UseSavingsSummaryProps {
  startDate?: string;
  endDate?: string;
}

const fetchSavingsSummary = async (startDate?: string, endDate?: string) => {
  const params: Record<string, string> = {};

  if (startDate && endDate) {
    params.start_date = startDate;
    params.end_date = endDate;
  }

  const { data } = await api.get("/savings/summary", {
    params,
  });

  return data;
};

export function useSavingsSummary({
  startDate,
  endDate,
}: UseSavingsSummaryProps) {
  return useQuery({
    queryKey: ["savings-summary", startDate, endDate],
    queryFn: () => fetchSavingsSummary(startDate, endDate),
    staleTime: 5 * 60 * 1000,
  });
}
