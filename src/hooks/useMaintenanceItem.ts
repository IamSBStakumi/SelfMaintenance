"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  getMaintenanceItemById,
  updateMaintenanceItem,
} from "@/services/maintenance_items";
import { UpdateMaintenanceItem } from "@/types/maintenance";

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

  return {
    fetchMaintenanceItem,
    updateMaintenanceItem: updateMaintenanceItemMutation,
  };
};

export default useMaintenanceItem;
