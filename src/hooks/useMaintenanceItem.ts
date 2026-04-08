"use client";

import { useQuery } from "@tanstack/react-query";
import { getMaintenanceItemById } from "@/services/maintenance_items";

export const MAINTENANCE_ITEM_QUERY_KEY = (id: string) =>
  ["maintenance_item", id] as const;

const useMaintenanceItem = (id: string) => {
  const fetchMaintenanceItem = useQuery({
    queryKey: MAINTENANCE_ITEM_QUERY_KEY(id),
    queryFn: () => getMaintenanceItemById(id),
    gcTime: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 5,
    enabled: !!id, // IDが存在する場合のみフェッチを実行
  });

  return {
    fetchMaintenanceItem,
  };
};

export default useMaintenanceItem;
