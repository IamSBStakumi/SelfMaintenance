import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getMaintenanceItems,
  getMaintenanceItemById,
  createMaintenanceItem,
  updateMaintenanceItem,
  updateMaintenanceItemNextCycle,
  getMaintenanceLogs,
  deleteMaintenanceItem,
} from "@/services/maintenanceService";
import type {
  MaintenanceItem,
  InsertMaintenanceItem,
  MaintenanceLog,
} from "@/types/maintenance";
import {
  FREE_PLAN_LIMIT_MESSAGE,
  FREE_PLAN_MAINTENANCE_ITEM_LIMIT,
} from "@/constants/planLimits";

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
  count?: number | null;
};

// チェーンメソッドを管理するためのインターフェース
interface MockChain<T> {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  gte: ReturnType<typeof vi.fn>;
  lte: ReturnType<typeof vi.fn>;
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
      gte: vi.fn(() => chain),
      lte: vi.fn(() => chain),
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
    last_completed_at: "2026-04-15T10:00:00Z",
    memo: null,
    created_at: "2026-04-15T10:00:00Z",
    updated_at: "2026-04-15T10:00:00Z",
    ...override,
  });

  describe("getMaintenanceItems", () => {
    test("認証エラーの場合、エラーがスローされること", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: new Error("Auth Error"),
      });

      await expect(getMaintenanceItems()).rejects.toThrow(
        "認証に失敗しました。ログインしているか確認してください。",
      );
    });

    test("未ログインの場合、エラーがスローされること", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(getMaintenanceItems()).rejects.toThrow(
        "認証に失敗しました。ログインしているか確認してください。",
      );
    });

    test("正常にデータを取得できること", async () => {
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

    test("DB取得時にエラーが発生した場合、エラーがスローされること", async () => {
      const chain = createMockChain<MaintenanceItem[]>({
        data: null,
        error: new Error("DB Error"),
      });
      mockFrom.mockReturnValue(chain);

      await expect(getMaintenanceItems()).rejects.toThrow(
        "定期タスクの取得に失敗しました。",
      );
    });
  });

  describe("getMaintenanceItemById", () => {
    test("不正なIDのとき、エラーがスローされること", async () => {
      await expect(getMaintenanceItemById("  ")).rejects.toThrow(
        "指定されたIDは不正です。",
      );
    });

    test("正常に指定したIDのデータを1件取得できること", async () => {
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

    test("DB取得時にエラーが発生した場合、エラーがスローされること", async () => {
      const chain = createMockChain<MaintenanceItem>({
        data: null,
        error: new Error("DB Error"),
      });
      mockFrom.mockReturnValue(chain);

      await expect(getMaintenanceItemById("item1")).rejects.toThrow(
        "定期タスクの取得に失敗しました。",
      );
    });
  });

  describe("createMaintenanceItem", () => {
    const validInsertData: InsertMaintenanceItem = {
      name: "テスト作成",
      icon: null,
      interval_days: 10,
      last_completed_at: "2026-04-15T10:00:00Z",
      memo: "メモ",
    };

    test("未認証の場合、エラーがスローされること", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      await expect(createMaintenanceItem(validInsertData)).rejects.toThrow(
        "認証が必要です。",
      );
    });

    test("入力値が不正な場合、DBへアクセスせずにエラーがスローされること", async () => {
      await expect(
        createMaintenanceItem({
          ...validInsertData,
          name: "   ",
        }),
      ).rejects.toThrow("タスク名を入力してください。");

      expect(mockGetUser).not.toHaveBeenCalled();
      expect(mockFrom).not.toHaveBeenCalled();
    });

    test("正常にデータを作成できること", async () => {
      const createdData = createMockItem({
        name: validInsertData.name,
        interval_days: validInsertData.interval_days,
        memo: validInsertData.memo,
        id: "new_item",
      });
      const countChain = createMockChain<null>({
        data: null,
        error: null,
        count: FREE_PLAN_MAINTENANCE_ITEM_LIMIT - 1,
      });
      const insertChain = createMockChain<MaintenanceItem>({
        data: createdData,
        error: null,
      });
      mockFrom.mockReturnValueOnce(countChain).mockReturnValueOnce(insertChain);

      const result = await createMaintenanceItem(validInsertData);

      expect(mockFrom).toHaveBeenNthCalledWith(1, "maintenance_items");
      expect(countChain.select).toHaveBeenCalledWith("id", {
        count: "exact",
        head: true,
      });
      expect(countChain.eq).toHaveBeenCalledWith("user_id", "test-user-id");
      expect(mockFrom).toHaveBeenNthCalledWith(2, "maintenance_items");
      expect(insertChain.insert).toHaveBeenCalledWith({
        ...validInsertData,
        user_id: "test-user-id",
      });
      expect(insertChain.select).toHaveBeenCalled();
      expect(insertChain.single).toHaveBeenCalled();
      expect(result).toEqual(createdData);
    });

    test("作成時に入力値が正規化されること", async () => {
      const countChain = createMockChain<null>({
        data: null,
        error: null,
        count: 0,
      });
      const insertChain = createMockChain<MaintenanceItem>({
        data: createMockItem({ name: "テスト作成" }),
        error: null,
      });
      mockFrom.mockReturnValueOnce(countChain).mockReturnValueOnce(insertChain);

      await createMaintenanceItem({
        ...validInsertData,
        name: "  テスト作成  ",
        icon: " ",
        memo: "",
      });

      expect(insertChain.insert).toHaveBeenCalledWith({
        ...validInsertData,
        name: "テスト作成",
        icon: null,
        memo: null,
        user_id: "test-user-id",
      });
    });

    test("無料版の上限に達している場合、作成せずにエラーがスローされること", async () => {
      const countChain = createMockChain<null>({
        data: null,
        error: null,
        count: FREE_PLAN_MAINTENANCE_ITEM_LIMIT,
      });
      mockFrom.mockReturnValue(countChain);

      await expect(createMaintenanceItem(validInsertData)).rejects.toThrow(
        FREE_PLAN_LIMIT_MESSAGE,
      );

      expect(countChain.insert).not.toHaveBeenCalled();
    });

    test("タスク数の確認に失敗した場合、エラーがスローされること", async () => {
      const countChain = createMockChain<null>({
        data: null,
        error: new Error("Count Error"),
      });
      mockFrom.mockReturnValue(countChain);

      await expect(createMaintenanceItem(validInsertData)).rejects.toThrow(
        "定期タスク数の確認に失敗しました。",
      );

      expect(countChain.insert).not.toHaveBeenCalled();
    });

    test("DB作成時にエラーが発生した場合、エラーがスローされること", async () => {
      const countChain = createMockChain<null>({
        data: null,
        error: null,
        count: 0,
      });
      const insertChain = createMockChain<MaintenanceItem>({
        data: null,
        error: new Error("DB Error"),
      });
      mockFrom.mockReturnValueOnce(countChain).mockReturnValueOnce(insertChain);

      await expect(createMaintenanceItem(validInsertData)).rejects.toThrow(
        "項目の作成に失敗しました。",
      );
    });

    test("DB側の無料版上限エラーは上限メッセージとしてスローされること", async () => {
      const countChain = createMockChain<null>({
        data: null,
        error: null,
        count: FREE_PLAN_MAINTENANCE_ITEM_LIMIT - 1,
      });
      const insertChain = createMockChain<MaintenanceItem>({
        data: null,
        error: new Error(FREE_PLAN_LIMIT_MESSAGE),
      });
      mockFrom.mockReturnValueOnce(countChain).mockReturnValueOnce(insertChain);

      await expect(createMaintenanceItem(validInsertData)).rejects.toThrow(
        FREE_PLAN_LIMIT_MESSAGE,
      );
    });
  });

  describe("updateMaintenanceItem", () => {
    test("不正なIDのとき、エラーがスローされること", async () => {
      await expect(
        updateMaintenanceItem("  ", { name: "更新" }),
      ).rejects.toThrow("指定されたIDは不正です。");
    });

    test("更新項目が空の場合、DBへアクセスせずにエラーがスローされること", async () => {
      await expect(updateMaintenanceItem("item1", {})).rejects.toThrow(
        "更新する項目を指定してください。",
      );

      expect(mockGetUser).not.toHaveBeenCalled();
      expect(mockFrom).not.toHaveBeenCalled();
    });

    test("入力値が不正な場合、DBへアクセスせずにエラーがスローされること", async () => {
      await expect(
        updateMaintenanceItem("item1", { interval_days: 0 }),
      ).rejects.toThrow("周期には1以上の数値を入力してください。");

      expect(mockGetUser).not.toHaveBeenCalled();
      expect(mockFrom).not.toHaveBeenCalled();
    });

    test("正常にデータを更新できること", async () => {
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

    test("DB更新時にエラーが発生した場合、エラーがスローされること", async () => {
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
    test("不正なIDのとき、エラーがスローされること", async () => {
      await expect(updateMaintenanceItemNextCycle("  ")).rejects.toThrow(
        "指定されたIDは不正です。",
      );
    });

    test("未認証の場合、エラーがスローされること", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      await expect(updateMaintenanceItemNextCycle("item1")).rejects.toThrow(
        "認証が必要です。",
      );
    });

    test("last_completed_atが現在時刻で更新されること", async () => {
      vi.useFakeTimers();
      const mockNow = "2026-04-16T12:00:00.000Z";
      vi.setSystemTime(mockNow);

      const mockUpdatedData = createMockItem({
        last_completed_at: mockNow,
      });
      const chain = createMockChain<MaintenanceItem>({
        data: mockUpdatedData,
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const result = await updateMaintenanceItemNextCycle("item1");

      expect(mockFrom).toHaveBeenNthCalledWith(1, "maintenance_items");
      expect(mockFrom).toHaveBeenNthCalledWith(2, "maintenance_logs");
      expect(chain.update).toHaveBeenCalledWith({
        last_completed_at: mockNow,
      });
      expect(result).toEqual(mockUpdatedData);
    });

    test("完了履歴の作成に失敗した場合でも更新結果が返されること", async () => {
      vi.useFakeTimers();
      const mockNow = "2026-04-30T12:00:00.000Z";
      vi.setSystemTime(mockNow);

      const mockUpdatedData = createMockItem({
        last_completed_at: mockNow,
      });
      // 1回目: maintenance_items の update 用チェーン（成功）
      const itemChain = createMockChain<MaintenanceItem>({
        data: mockUpdatedData,
        error: null,
      });
      // 2回目: maintenance_logs の insert 用チェーン（失敗）
      const logChain = createMockChain<null>({
        data: null,
        error: new Error("Log Error"),
      });
      mockFrom.mockReturnValueOnce(itemChain).mockReturnValueOnce(logChain);

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await updateMaintenanceItemNextCycle("item1");

      expect(mockFrom).toHaveBeenNthCalledWith(1, "maintenance_items");
      expect(mockFrom).toHaveBeenNthCalledWith(2, "maintenance_logs");

      // ログ作成エラーは内部でのみ処理され、戻り値には影響しない
      expect(result).toEqual(mockUpdatedData);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error creating maintenance log:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("deleteMaintenanceItem", () => {
    test("不正なIDのとき、エラーがスローされること", async () => {
      await expect(deleteMaintenanceItem("  ")).rejects.toThrow(
        "指定されたIDは不正です。",
      );
    });

    test("正常にデータを削除できること", async () => {
      // 成功時はnullが返る
      const chain = createMockChain<null>({ data: null, error: null });
      mockFrom.mockReturnValue(chain);

      await deleteMaintenanceItem("item1");

      expect(mockFrom).toHaveBeenCalledWith("maintenance_items");
      expect(chain.delete).toHaveBeenCalled();
      expect(chain.eq).toHaveBeenCalledWith("id", "item1");
      expect(chain.eq).toHaveBeenCalledWith("user_id", "test-user-id");
    });

    test("DB削除時にエラーが発生した場合、エラーがスローされること", async () => {
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

  describe("getMaintenanceLogs", () => {
    test("認証エラーの場合、エラーがスローされること", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: new Error("Auth Error"),
      });

      await expect(
        getMaintenanceLogs("2026-01-01", "2026-12-31"),
      ).rejects.toThrow(
        "認証に失敗しました。ログインしているか確認してください。",
      );
    });

    test("未ログインの場合、エラーがスローされること", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(
        getMaintenanceLogs("2026-01-01", "2026-12-31"),
      ).rejects.toThrow(
        "認証に失敗しました。ログインしているか確認してください。",
      );
    });

    test("正常に指定期間のログを取得できること", async () => {
      const mockData: MaintenanceLog[] = [
        {
          id: "log1",
          item_id: "item1",
          user_id: "test-user-id",
          completed_at: "2026-04-15T10:00:00Z",
          notes: null,
          created_at: "2026-04-15T10:00:00Z",
        },
      ];
      const chain = createMockChain<MaintenanceLog[]>({
        data: mockData,
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const result = await getMaintenanceLogs("2026-04-01", "2026-04-30");

      expect(mockFrom).toHaveBeenCalledWith("maintenance_logs");
      expect(chain.select).toHaveBeenCalledWith("*");
      expect(chain.eq).toHaveBeenCalledWith("user_id", "test-user-id");
      expect(chain.gte).toHaveBeenCalledWith("completed_at", "2026-04-01");
      expect(chain.lte).toHaveBeenCalledWith("completed_at", "2026-04-30");
      expect(chain.order).toHaveBeenCalledWith("completed_at", {
        ascending: false,
      });
      expect(result).toEqual(mockData);
    });

    test("データが存在しない場合、空配列を返すこと", async () => {
      const chain = createMockChain<MaintenanceLog[]>({
        data: null,
        error: null,
      });
      mockFrom.mockReturnValue(chain);

      const result = await getMaintenanceLogs("2026-04-01", "2026-04-30");

      expect(result).toEqual([]);
    });

    test("DB取得時にエラーが発生した場合、エラーがスローされること", async () => {
      const chain = createMockChain<MaintenanceLog[]>({
        data: null,
        error: new Error("DB Error"),
      });
      mockFrom.mockReturnValue(chain);

      await expect(
        getMaintenanceLogs("2026-04-01", "2026-04-30"),
      ).rejects.toThrow("完了履歴の取得に失敗しました。");
    });
  });
});
