import type { MaintenanceItem } from "@/types/maintenance";

export const createMaintenanceItem = (
  override: Partial<MaintenanceItem> = {},
): MaintenanceItem => ({
  id: "item1",
  user_id: "test-user-id",
  name: "テスト項目",
  icon: null,
  interval_days: 30,
  last_completed_at: "2024-01-01T00:00:00.000Z",
  memo: null,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  ...override,
});
