"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMaintenanceItems,
  createMaintenanceItem,
} from "@/services/maintenanceService";

// クエリキーを定数として公開し、invalidateQueries 等で外部から参照できるようにします
export const MAINTENANCE_ITEMS_QUERY_KEY = ["maintenance_items"] as const;

const useMaintenanceItems = () => {
  const fetchMaintenanceItems = useQuery({
    queryKey: MAINTENANCE_ITEMS_QUERY_KEY,
    queryFn: getMaintenanceItems,
    gcTime: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 5,
  });

  const queryClient = useQueryClient();

  const createMaintenanceItemMutation = useMutation({
    mutationFn: createMaintenanceItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_ITEMS_QUERY_KEY });
    },
    onError: () => {
      console.error("メンテナンス項目の作成に失敗しました。");
    },
  });

  return {
    fetchMaintenanceItems,
    createMaintenanceItem: createMaintenanceItemMutation,
  };
};

export default useMaintenanceItems;
