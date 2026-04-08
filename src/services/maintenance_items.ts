"use server";

import { createClient } from "@/lib/supabase/server";
import {
  InsertMaintenanceItem,
  MaintenanceItem,
  UpdateMaintenanceItem,
} from "@/types/maintenance";

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
  if (!id || id.trim().length === 0) {
    throw new Error("指定されたIDは不正です。");
  }

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
    .eq("id", id)
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
      ...data,
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
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("認証が必要です。");
  }

  const { data: updatedData, error } = await supabase
    .from("maintenance_items")
    .update(data)
    .eq("id", id)
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
 * 指定したIDのメンテナンス項目を削除します。
 */
export async function deleteMaintenanceItem(id: string): Promise<void> {
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
    .eq("id", id)
    .eq("user_id", user.id); // 所有者チェックを追加

  if (error) {
    console.error("Error deleting maintenance item:", error);
    throw new Error("項目の削除に失敗しました。");
  }
}
