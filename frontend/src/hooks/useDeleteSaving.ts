import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api";

const deleteSaving = async (id: number) => {
  const { data } = await api.delete(`/savings/${id}`);

  return data;
};

export function useDeleteSaving() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSaving,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["savings"],
      });

      queryClient.invalidateQueries({
        queryKey: ["savings-summary"],
      });
    },
  });
}
