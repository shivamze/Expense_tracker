import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api";

const deleteExpense = async (id: number) => {
  const { data } = await api.delete(`/expense/${id}`);
  return data;
};

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExpense,

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
