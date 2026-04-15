"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  getMaintenanceItemById,
  updateMaintenanceItem,
  updateMaintenanceItemNextCycle,
} from "@/services/maintenance_items";
import { UpdateMaintenanceItem } from "@/types/maintenance";
import { MAINTENANCE_ITEMS_QUERY_KEY } from "./useMaintenanceItems";

export const MAINTENANCE_ITEM_QUERY_KEY = (id: string) =>
  ["maintenance_item", id] as const;

const useMaintenanceItem = (id: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const fetchMaintenanceItem = useQuery({
    queryKey: MAINTENANCE_ITEM_QUERY_KEY(id),
    queryFn: () => getMaintenanceItemById(id),
    gcTime: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 5,
    enabled: !!id, // IDが存在する場合のみフェッチを実行
  });

  const updateMaintenanceItemMutation = useMutation({
    mutationFn: (data: UpdateMaintenanceItem) =>
      updateMaintenanceItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MAINTENANCE_ITEM_QUERY_KEY(id),
      });
      router.push("/dashboard");
    },
    onError: () => {
      console.error("メンテナンス項目の更新に失敗しました。");
    },
  });

  const updateMaintenanceItemNextCycleMutation = useMutation({
    mutationFn: () => updateMaintenanceItemNextCycle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MAINTENANCE_ITEMS_QUERY_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: MAINTENANCE_ITEM_QUERY_KEY(id),
      });
    },
    onError: () => {
      console.error("メンテナンス項目の更新に失敗しました。");
    },
  });

  return {
    fetchMaintenanceItem,
    updateMaintenanceItem: updateMaintenanceItemMutation,
    updateMaintenanceItemNextCycle: updateMaintenanceItemNextCycleMutation,
  };
};

export default useMaintenanceItem;
