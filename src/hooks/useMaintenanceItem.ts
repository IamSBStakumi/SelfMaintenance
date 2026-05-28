"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  getMaintenanceItemById,
  updateMaintenanceItem,
  updateMaintenanceItemNextCycle,
} from "@/services/maintenanceService";
import { UpdateMaintenanceItem } from "@/types/maintenance";
import { MAINTENANCE_ITEMS_QUERY_KEY } from "./useMaintenanceItems";

export const MAINTENANCE_ITEM_QUERY_KEY = (id: string) =>
  ["maintenance_item", id] as const;

const useMaintenanceItem = (id: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const normalizedId = id?.trim();

  const fetchMaintenanceItem = useQuery({
    queryKey: MAINTENANCE_ITEM_QUERY_KEY(normalizedId),
    queryFn: () => getMaintenanceItemById(normalizedId),
    gcTime: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 5,
    enabled: !!normalizedId, // IDが存在する場合のみフェッチを実行
  });

  const updateMaintenanceItemMutation = useMutation({
    mutationFn: (data: UpdateMaintenanceItem) =>
      updateMaintenanceItem(normalizedId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MAINTENANCE_ITEM_QUERY_KEY(normalizedId),
      });
      router.push("/dashboard");
    },
    onError: () => {
      console.error("定期タスクの更新に失敗しました。");
    },
  });

  const updateMaintenanceItemNextCycleMutation = useMutation({
    mutationFn: () => updateMaintenanceItemNextCycle(normalizedId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MAINTENANCE_ITEMS_QUERY_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: MAINTENANCE_ITEM_QUERY_KEY(normalizedId),
      });
    },
    onError: () => {
      console.error("定期タスクの更新に失敗しました。");
    },
  });

  return {
    fetchMaintenanceItem,
    updateMaintenanceItem: updateMaintenanceItemMutation,
    updateMaintenanceItemNextCycle: updateMaintenanceItemNextCycleMutation,
  };
};

export default useMaintenanceItem;
