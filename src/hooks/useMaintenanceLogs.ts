import { useQuery } from "@tanstack/react-query";
import { getMaintenanceLogs } from "@/services/maintenance_items";

export const MAINTENANCE_LOGS_QUERY_KEY = (
  startDate: string,
  endDate: string,
) => ["maintenance_logs", startDate, endDate] as const;

export const useMaintenanceLogs = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: MAINTENANCE_LOGS_QUERY_KEY(startDate, endDate),
    queryFn: () => getMaintenanceLogs(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
};
