import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getMaintenanceItems,
  getMaintenanceItemById,
  createMaintenanceItem,
  updateMaintenanceItem,
  updateMaintenanceItemNextCycle,
  deleteMaintenanceItem,
} from "@/services/maintenance_items";
import type {
  MaintenanceItem,
  InsertMaintenanceItem,
} from "@/types/maintenance";

// モック用の定義
const mockGetUser = vi.fn();
const mockFrom = vi.fn();

// Supabaseクライアントのモック
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}));

// Supabaseの戻り値型のシミュレーション
type MockSupabaseResponse<T> = {
  data: T | null;
  error: Error | unknown | null;
};

// チェーンメソッドを管理するためのインターフェース
interface MockChain<T> {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  then: (resolve: (val: MockSupabaseResponse<T>) => void) => void;
}

describe("src/services/maintenance_items", () => {
  // すべてのテストで共通してモックをリセットする
  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトで認証が成功している状態をシミュレート
    mockGetUser.mockResolvedValue({
      data: { user: { id: "test-user-id" } },
      error: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * Supabaseのメソッドチェーンをシミュレートするヘルパー
   * 指定した returnValue が `await` した際に返却されるようになります。
   */
  const createMockChain = <T>(
    returnValue: MockSupabaseResponse<T>,
  ): MockChain<T> => {
    const chain: MockChain<T> = {
      select: vi.fn(() => chain),
      insert: vi.fn(() => chain),
      update: vi.fn(() => chain),
      delete: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      order: vi.fn(() => chain),
      single: vi.fn(() => chain),
      then: (resolve: (val: MockSupabaseResponse<T>) => void) =>
        resolve(returnValue),
    };
    return chain;
  };

  /**
   * テスト用のダミーのMaintenanceItemを生成する
   */
  const createMockItem = (
    override: Partial<MaintenanceItem> = {},
  ): MaintenanceItem => ({
    id: "item1",
    user_id: "test-user-id",
    name: "テスト項目",
    icon: null,
    interval_days: 30,
    last_completed_at: new Date().toISOString(),
    memo: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...override,
  });

  describe("getMaintenanceItems", () => {
    it("認証エラーの場合、エラーがスローされること", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: new Error("Auth Error"),
      });

      await expect(getMaintenanceItems()).rejects.toThrow(
        "認証に失敗しました。ログインしているか確認してください。",
      );
    });

    it("正常にデータを取得できること", async () => {
      const mockData: MaintenanceItem[] = [createMockItem()];
      const chain = createMockChain<MaintenanceItem[]>({
        data: mockData,
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const result = await getMaintenanceItems();

      expect(mockFrom).toHaveBeenCalledWith("maintenance_items");
      expect(chain.select).toHaveBeenCalledWith("*");
      expect(chain.eq).toHaveBeenCalledWith("user_id", "test-user-id");
      expect(chain.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result).toEqual(mockData);
    });

    it("DB取得時にエラーが発生した場合、エラーがスローされること", async () => {
      const chain = createMockChain<MaintenanceItem[]>({
        data: null,
        error: new Error("DB Error"),
      });
      mockFrom.mockReturnValue(chain);

      await expect(getMaintenanceItems()).rejects.toThrow(
        "メンテナンス項目の取得に失敗しました。",
      );
    });
  });

  describe("getMaintenanceItemById", () => {
    it("不正なIDのとき、エラーがスローされること", async () => {
      await expect(getMaintenanceItemById("  ")).rejects.toThrow(
        "指定されたIDは不正です。",
      );
    });

    it("正常に指定したIDのデータを1件取得できること", async () => {
      const mockData = createMockItem();
      const chain = createMockChain<MaintenanceItem>({
        data: mockData,
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const result = await getMaintenanceItemById("item1");

      expect(mockFrom).toHaveBeenCalledWith("maintenance_items");
      expect(chain.select).toHaveBeenCalledWith("*");
      expect(chain.eq).toHaveBeenCalledWith("id", "item1");
      expect(chain.eq).toHaveBeenCalledWith("user_id", "test-user-id");
      expect(chain.single).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it("DB取得時にエラーが発生した場合、エラーがスローされること", async () => {
      const chain = createMockChain<MaintenanceItem>({
        data: null,
        error: new Error("DB Error"),
      });
      mockFrom.mockReturnValue(chain);

      await expect(getMaintenanceItemById("item1")).rejects.toThrow(
        "メンテナンス項目の取得に失敗しました。",
      );
    });
  });

  describe("createMaintenanceItem", () => {
    const validInsertData: InsertMaintenanceItem = {
      name: "テスト作成",
      icon: null,
      interval_days: 10,
      last_completed_at: new Date().toISOString(),
      memo: "メモ",
    };

    it("未認証の場合、エラーがスローされること", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      await expect(createMaintenanceItem(validInsertData)).rejects.toThrow(
        "認証が必要です。",
      );
    });

    it("正常にデータを作成できること", async () => {
      const createdData = createMockItem({
        name: validInsertData.name,
        interval_days: validInsertData.interval_days,
        memo: validInsertData.memo,
        id: "new_item",
      });
      const chain = createMockChain<MaintenanceItem>({
        data: createdData,
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const result = await createMaintenanceItem(validInsertData);

      expect(mockFrom).toHaveBeenCalledWith("maintenance_items");
      expect(chain.insert).toHaveBeenCalledWith({
        ...validInsertData,
        user_id: "test-user-id",
      });
      expect(chain.select).toHaveBeenCalled();
      expect(chain.single).toHaveBeenCalled();
      expect(result).toEqual(createdData);
    });

    it("DB作成時にエラーが発生した場合、エラーがスローされること", async () => {
      const chain = createMockChain<MaintenanceItem>({
        data: null,
        error: new Error("DB Error"),
      });
      mockFrom.mockReturnValue(chain);

      await expect(createMaintenanceItem(validInsertData)).rejects.toThrow(
        "項目の作成に失敗しました。",
      );
    });
  });

  describe("updateMaintenanceItem", () => {
    it("正常にデータを更新できること", async () => {
      const mockUpdatedData = createMockItem({ name: "更新後" });
      const chain = createMockChain<MaintenanceItem>({
        data: mockUpdatedData,
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const result = await updateMaintenanceItem("item1", { name: "更新後" });

      expect(mockFrom).toHaveBeenCalledWith("maintenance_items");
      expect(chain.update).toHaveBeenCalledWith({ name: "更新後" });
      expect(chain.eq).toHaveBeenCalledWith("id", "item1");
      expect(chain.eq).toHaveBeenCalledWith("user_id", "test-user-id");
      expect(chain.select).toHaveBeenCalled();
      expect(chain.single).toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedData);
    });

    it("DB更新時にエラーが発生した場合、エラーがスローされること", async () => {
      const chain = createMockChain<MaintenanceItem>({
        data: null,
        error: new Error("DB Error"),
      });
      mockFrom.mockReturnValue(chain);

      await expect(
        updateMaintenanceItem("item1", { name: "更新エラー" }),
      ).rejects.toThrow("項目の更新に失敗しました。");
    });
  });

  describe("updateMaintenanceItemNextCycle", () => {
    it("last_completed_atが現在時刻で更新されること", async () => {
      vi.useFakeTimers();
      const mockNow = new Date("2026-04-16T12:00:00Z");
      vi.setSystemTime(mockNow);

      const mockUpdatedData = createMockItem({
        last_completed_at: mockNow.toISOString(),
      });
      const chain = createMockChain<MaintenanceItem>({
        data: mockUpdatedData,
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const result = await updateMaintenanceItemNextCycle("item1");

      expect(chain.update).toHaveBeenCalledWith({
        last_completed_at: mockNow.toISOString(),
      });
      expect(result).toEqual(mockUpdatedData);
    });
  });

  describe("deleteMaintenanceItem", () => {
    it("正常にデータを削除できること", async () => {
      // 成功時はnullが返る
      const chain = createMockChain<null>({ data: null, error: null });
      mockFrom.mockReturnValue(chain);

      await expect(deleteMaintenanceItem("item1")).resolves.not.toThrow();

      expect(mockFrom).toHaveBeenCalledWith("maintenance_items");
      expect(chain.delete).toHaveBeenCalled();
      expect(chain.eq).toHaveBeenCalledWith("id", "item1");
      expect(chain.eq).toHaveBeenCalledWith("user_id", "test-user-id");
    });

    it("DB削除時にエラーが発生した場合、エラーがスローされること", async () => {
      const chain = createMockChain<null>({
        data: null,
        error: new Error("DB Error"),
      });
      mockFrom.mockReturnValue(chain);

      await expect(deleteMaintenanceItem("item1")).rejects.toThrow(
        "項目の削除に失敗しました。",
      );
    });
  });
});
