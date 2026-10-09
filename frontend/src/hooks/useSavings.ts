import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { SavingsRead, SavingsTypeEnum } from "@/src/types";

export interface SavingsPagination {
  items: SavingsRead[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface UseSavingsProps {
  page?: number;
  pageSize?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  savingsType?: SavingsTypeEnum;
  sort?: "newest" | "oldest";
}

const fetchSavings = async ({
  page = 1,
  pageSize = 10,
  search,
  startDate,
  endDate,
  savingsType,
  sort = "newest",
}: UseSavingsProps): Promise<SavingsPagination> => {
  const params: Record<string, string | number> = {
    page,
    page_size: pageSize,
    sort,
  };

  if (search) {
    params.search = search;
  }

  if (startDate) {
    params.start_date = startDate;
  }

  if (endDate) {
    params.end_date = endDate;
  }

  if (savingsType) {
    params.savings_type = savingsType;
  }

  const { data } = await api.get<SavingsPagination>("/savings/", {
    params,
  });

  return data;
};

export function useSavings({
  page = 1,
  pageSize = 10,
  search,
  startDate,
  endDate,
  savingsType,
  sort = "newest",
}: UseSavingsProps = {}) {
  return useQuery({
    queryKey: [
      "savings",
      page,
      pageSize,
      search,
      startDate,
      endDate,
      savingsType,
      sort,
    ],
    queryFn: () =>
      fetchSavings({
        page,
        pageSize,
        startDate,
        search,
        endDate,
        savingsType,
        sort,
      }),
    staleTime: 5 * 60 * 1000,
  });
}
