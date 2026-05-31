"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMaintenanceItems,
  createMaintenanceItem,
  getCurrentUserProfile,
} from "@/services/maintenanceService";

// クエリキーを定数として公開し、invalidateQueries 等で外部から参照できるようにします
export const MAINTENANCE_ITEMS_QUERY_KEY = ["maintenance_items"] as const;
export const USER_PROFILE_QUERY_KEY = ["user_profile"] as const;

export const useUserProfile = () =>
  useQuery({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: getCurrentUserProfile,
    gcTime: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateMaintenanceItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMaintenanceItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_ITEMS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
    },
    onError: () => {
      console.error("定期タスクの作成に失敗しました。");
    },
  });
};

const useMaintenanceItems = () => {
  const fetchMaintenanceItems = useQuery({
    queryKey: MAINTENANCE_ITEMS_QUERY_KEY,
    queryFn: getMaintenanceItems,
    gcTime: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 5,
  });

  return {
    fetchMaintenanceItems,
    createMaintenanceItem: useCreateMaintenanceItem(),
  };
};

export default useMaintenanceItems;
