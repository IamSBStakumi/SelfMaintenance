export const FREE_PLAN_MAINTENANCE_ITEM_LIMIT = 3;

export const FREE_PLAN_LIMIT_MESSAGE =
  "無料版で登録できるタスクは3件までです。今後、上限を増やせるプランを提供予定です。";

export const ACTIVE_PAID_SUBSCRIPTION_STATUSES = [
  "active",
  "trialing",
] as const;

export const isActivePaidSubscriptionStatus = (
  status: string | null | undefined,
) =>
  status !== null &&
  status !== undefined &&
  (ACTIVE_PAID_SUBSCRIPTION_STATUSES as readonly string[]).includes(status);
