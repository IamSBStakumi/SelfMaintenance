export interface MaintenanceItem {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  interval_days: number;
  last_completed_at: string; // timestamp with time zone (ISO string)
  memo: string | null;
  created_at: string;
  updated_at: string;
}

export type InsertMaintenanceItem = Omit<
  MaintenanceItem,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export type UpdateMaintenanceItem = Partial<InsertMaintenanceItem>;

export interface MaintenanceLog {
  id: string;
  item_id: string;
  user_id: string;
  completed_at: string;
  notes: string | null;
  created_at: string;
}

export type InsertMaintenanceLog = Omit<
  MaintenanceLog,
  "id" | "user_id" | "created_at"
>;

export type UserPlan = "free" | "pro";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

export interface UserProfile {
  user_id: string;
  plan: UserPlan;
  subscription_status: SubscriptionStatus | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}
