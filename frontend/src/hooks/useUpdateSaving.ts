import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { SavingsUpdate } from "@/src/types";

interface UpdateSavingVariables {
  id: number;
  data: SavingsUpdate;
}

const updateSaving = async ({ id, data }: UpdateSavingVariables) => {
  const { data: response } = await api.patch(`/savings/${id}`, data);

  return response;
};

export function useUpdateSaving() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSaving,

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
