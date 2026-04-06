"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getMaintenanceItems,
  createMaintenanceItem,
} from "@/services/maintenance_items";

// クエリキーを定数として公開し、invalidateQueries 等で外部から参照できるようにします
export const MAINTENANCE_ITEMS_QUERY_KEY = ["maintenance_items"] as const;

const useMaintenanceItems = () => {
  const fetchMaintenanceItems = useQuery({
    queryKey: MAINTENANCE_ITEMS_QUERY_KEY,
    queryFn: getMaintenanceItems,
    gcTime: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 5,
  });

  const createMaintenanceItemMutation = useMutation({
    mutationFn: createMaintenanceItem,
    onSuccess: () => {
      fetchMaintenanceItems.refetch();
    },
  });

  return {
    fetchMaintenanceItems,
    createMaintenanceItem: createMaintenanceItemMutation,
  };
};

export default useMaintenanceItems;
