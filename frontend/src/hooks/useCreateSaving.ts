import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api";

interface CreateSavingData {
  savings_type: string;
  amount: number;
  source: string;
  transaction_date?: string;
}

const createSaving = async (data: CreateSavingData) => {
  const { data: response } = await api.post("/savings", data);
  return response;
};

export function useCreateSaving() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSaving,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["savings-summary"],
      });
    },
  });
}
