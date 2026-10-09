import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { ExpenseCreate } from "@/src/types/index"
interface CreateExpenseData {
  category: string;
  amount: number;
  title: string;
  tags?: string[];
  expense_date?: string;
}

const createExpense = async (data: ExpenseCreate) => {
  const { data: response } = await api.post("/expense", data);

  return response;
};

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpense,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["expense-summary"],
      });
    },
  });
}
