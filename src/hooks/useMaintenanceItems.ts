"use client";

import { useQuery } from "@tanstack/react-query";
import { getMaintenanceItems } from "@/services/maintenance_items";

// クエリキーを定数として公開し、invalidateQueries 等で外部から参照できるようにします
export const MAINTENANCE_ITEMS_QUERY_KEY = ["maintenance_items"] as const;

const useMaintenanceItems = () => {
  return useQuery({
    queryKey: MAINTENANCE_ITEMS_QUERY_KEY,
    queryFn: getMaintenanceItems,
    gcTime: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 5,
  });
};

export default useMaintenanceItems;
