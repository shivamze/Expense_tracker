import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { ExpenseUpdate } from "@/src/types";

interface UpdateExpenseVariables {
  id: number;
  data: ExpenseUpdate;
}

const updateExpense = async ({ id, data }: UpdateExpenseVariables) => {
  const { data: response } = await api.patch(`/expense/${id}`, data);

  return response;
};

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateExpense,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["expenses"],
      });

      queryClient.invalidateQueries({
        queryKey: ["expense-summary"],
      });
    },
  });
}
