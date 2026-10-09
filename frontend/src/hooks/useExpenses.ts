import { useQuery } from "@tanstack/react-query";

import api from "@/src/lib/api";

import { ExpenseFilters, ExpensePagination } from "@/src/types";

interface UseExpensesParams {
  filters: ExpenseFilters;
  page: number;
  pageSize?: number;
}

const fetchExpenses = async ({
  filters,
  page,
  pageSize,
}: UseExpensesParams): Promise<ExpensePagination> => {
  const { data } = await api.get("/expense", {
    params: {
      page,
      page_size: pageSize,

      search: filters.search || undefined,
      category: filters.category || undefined,
      start_date: filters.startDate || undefined,
      end_date: filters.endDate || undefined,
      sort: filters.sort || "newest",
    },
  });

  return data;
};

export function useExpenses({
  filters,
  page,
  pageSize = 10,
}: UseExpensesParams) {
  return useQuery({
    queryKey: ["expenses", filters, page, pageSize],

    queryFn: () =>
      fetchExpenses({
        filters,
        page,
        pageSize,
      }),

    staleTime: 5 * 60 * 1000,

    placeholderData: (previousData) => previousData,
  });
}
