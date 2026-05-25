"use server";

import { createClient } from "@/lib/supabase/server";
import {
  maintenanceTaskSchema,
  maintenanceTaskUpdateSchema,
} from "@/utils/schemas/maintenanceTask";
import {
  InsertMaintenanceItem,
  MaintenanceItem,
  UpdateMaintenanceItem,
  MaintenanceLog,
} from "@/types/maintenance";

const formatValidationError = (error: unknown) => {
  if (
    error &&
    typeof error === "object" &&
    "issues" in error &&
    Array.isArray(error.issues)
  ) {
    const firstIssue = error.issues[0];
    if (
      firstIssue &&
      typeof firstIssue === "object" &&
      "message" in firstIssue &&
      typeof firstIssue.message === "string"
    ) {
      return firstIssue.message;
    }
  }

  return "入力内容を確認してください。";
};

const validateMaintenanceTask = (data: InsertMaintenanceItem) => {
  const validationResult = maintenanceTaskSchema.safeParse(data);
  if (!validationResult.success) {
    throw new Error(formatValidationError(validationResult.error));
  }

  return validationResult.data;
};

const validateMaintenanceTaskUpdate = (data: UpdateMaintenanceItem) => {
  const validationResult = maintenanceTaskUpdateSchema.safeParse(data);
  if (!validationResult.success) {
    throw new Error(formatValidationError(validationResult.error));
  }

  return validationResult.data;
};

const normalizeAndValidateId = (id: string) => {
  const normalizedId = id?.trim();
  if (!normalizedId) {
    throw new Error("指定されたIDは不正です。");
  }
  return normalizedId;
};

/**
 * ログインユーザーのすべてのメンテナンス項目を取得します。
 * @returns メンテナンス項目の配列
 * @throws 認証エラーまたはデータベースエラーが発生した場合
 */
export async function getMaintenanceItems(): Promise<MaintenanceItem[]> {
  const supabase = await createClient();

  // 現在のユーザー情報を取得（セッション確認を兼ねる）
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("認証に失敗しました。ログインしているか確認してください。");
  }

  // メンテナンス項目を取得
  const { data, error } = await supabase
    .from("maintenance_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching maintenance items:", error);
    throw new Error("メンテナンス項目の取得に失敗しました。");
  }

  return (data as MaintenanceItem[]) || [];
}

/**
 * 指定したIDのメンテナンス項目を取得します。
 */
export async function getMaintenanceItemById(
  id: string,
): Promise<MaintenanceItem> {
  const normalizedId = normalizeAndValidateId(id);

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("認証に失敗しました。ログインしているか確認してください。");
  }

  const { data, error } = await supabase
    .from("maintenance_items")
    .select("*")
    .eq("id", normalizedId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching maintenance item:", error);
    throw new Error("メンテナンス項目の取得に失敗しました。");
  }

  return data as MaintenanceItem;
}

/**
 * 新しいメンテナンス項目を登録します。
 */
export async function createMaintenanceItem(
  data: InsertMaintenanceItem,
): Promise<MaintenanceItem> {
  const validatedData = validateMaintenanceTask(data);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("認証が必要です。");
  }

  const { data: insertedData, error } = await supabase
    .from("maintenance_items")
    .insert({
      ...validatedData,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating maintenance item:", error);
    throw new Error("項目の作成に失敗しました。");
  }

  return insertedData as MaintenanceItem;
}

/**
 * 指定したIDのメンテナンス項目を更新します。
 */
export async function updateMaintenanceItem(
  id: string,
  data: UpdateMaintenanceItem,
): Promise<MaintenanceItem> {
  const normalizedId = normalizeAndValidateId(id);
  const validatedData = validateMaintenanceTaskUpdate(data);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("認証が必要です。");
  }

  const { data: updatedData, error } = await supabase
    .from("maintenance_items")
    .update(validatedData)
    .eq("id", normalizedId)
    .eq("user_id", user.id) // 所有者チェックを追加
    .select()
    .single();

  if (error) {
    console.error("Error updating maintenance item:", error);
    throw new Error("項目の更新に失敗しました。");
  }

  return updatedData as MaintenanceItem;
}

/**
 * 指定したIDのメンテナンス項目を次の周期に更新します。
 */
export async function updateMaintenanceItemNextCycle(
  id: string,
): Promise<MaintenanceItem> {
  const normalizedId = normalizeAndValidateId(id);
  const now = new Date().toISOString();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("認証が必要です。");
  }

  const updatedItem = await updateMaintenanceItem(normalizedId, {
    last_completed_at: now,
  });

  const { error: logError } = await supabase.from("maintenance_logs").insert({
    item_id: normalizedId,
    user_id: user.id,
    completed_at: now,
  });

  if (logError) {
    console.error("Error creating maintenance log:", logError);
  }

  return updatedItem;
}

/**
 * 指定した期間内のメンテナンスログを取得します。
 */
export async function getMaintenanceLogs(
  startDate: string,
  endDate: string,
): Promise<MaintenanceLog[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("認証に失敗しました。ログインしているか確認してください。");
  }

  const { data, error } = await supabase
    .from("maintenance_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("completed_at", startDate)
    .lte("completed_at", endDate)
    .order("completed_at", { ascending: false });

  if (error) {
    console.error("Error fetching maintenance logs:", error);
    throw new Error("メンテナンス履歴の取得に失敗しました。");
  }

  return (data as MaintenanceLog[]) || [];
}

/**
 * 指定したIDのメンテナンス項目を削除します。
 */
export async function deleteMaintenanceItem(id: string): Promise<void> {
  const normalizedId = normalizeAndValidateId(id);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("認証が必要です。");
  }

  const { error } = await supabase
    .from("maintenance_items")
    .delete()
    .eq("id", normalizedId)
    .eq("user_id", user.id); // 所有者チェックを追加

  if (error) {
    console.error("Error deleting maintenance item:", error);
    throw new Error("項目の削除に失敗しました。");
  }
}
