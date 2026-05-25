import React, { ReactNode } from "react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useMaintenanceItems, {
  MAINTENANCE_ITEMS_QUERY_KEY,
} from "@/hooks/useMaintenanceItems";
import * as services from "@/service/maintenanceService";
import type {
  MaintenanceItem,
  InsertMaintenanceItem,
} from "@/types/maintenance";

// サービスのモック化
vi.mock("@/service/maintenanceService", () => ({
  getMaintenanceItems: vi.fn(),
  createMaintenanceItem: vi.fn(),
}));

const mockGetMaintenanceItems = vi.mocked(services.getMaintenanceItems);
const mockCreateMaintenanceItem = vi.mocked(services.createMaintenanceItem);

// テスト用のダミーデータ生成ヘルパー
const createMockItem = (
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

describe("useMaintenanceItems", () => {
  const createWrapper = () => {
    const testQueryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    );

    return { testQueryClient, wrapper };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Query: fetchMaintenanceItems", () => {
    test("正常にgetMaintenanceItemsが呼ばれ、データが取得できること", async () => {
      const mockData = [createMockItem()];
      mockGetMaintenanceItems.mockResolvedValue(mockData);

      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useMaintenanceItems(), { wrapper });

      // ローディングからSuccessに変わるまで待つ
      await waitFor(() => {
        expect(result.current.fetchMaintenanceItems.isSuccess).toBe(true);
      });

      expect(mockGetMaintenanceItems).toHaveBeenCalledTimes(1);
      expect(result.current.fetchMaintenanceItems.data).toEqual(mockData);
    });

    test("取得エラー時にisErrorがtrueになること", async () => {
      mockGetMaintenanceItems.mockRejectedValue(new Error("Fetch Error"));

      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useMaintenanceItems(), { wrapper });

      await waitFor(() => {
        expect(result.current.fetchMaintenanceItems.isError).toBe(true);
      });

      expect(mockGetMaintenanceItems).toHaveBeenCalledTimes(1);
    });
  });

  describe("Mutation: createMaintenanceItem", () => {
    test("作成に成功した際、クエリのinvalidateが行われること", async () => {
      const { wrapper, testQueryClient } = createWrapper();
      // invalidateQueriesが呼ばれるかをスパイする
      const resetSpy = vi.spyOn(testQueryClient, "invalidateQueries");

      const insertData: InsertMaintenanceItem = {
        name: "新しいテスト",
        icon: null,
        interval_days: 7,
        last_completed_at: new Date().toISOString(),
        memo: "",
      };

      // invalidate後の再フェッチに対応するためデフォルトで空配列を返すようにする
      mockGetMaintenanceItems.mockResolvedValue([]);

      const mockResponse = createMockItem({ id: "new-id", ...insertData });
      mockCreateMaintenanceItem.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useMaintenanceItems(), { wrapper });

      // mutateをトリガー
      result.current.createMaintenanceItem.mutate(insertData);

      await waitFor(() => {
        expect(result.current.createMaintenanceItem.isSuccess).toBe(true);
      });

      expect(mockCreateMaintenanceItem).toHaveBeenCalledTimes(1);
      // 第2引数が自動付与される場合があるため、第1引数のみ確認する
      expect(mockCreateMaintenanceItem.mock.calls[0][0]).toEqual(insertData);
      expect(resetSpy).toHaveBeenCalledWith({
        queryKey: MAINTENANCE_ITEMS_QUERY_KEY,
      });
    });

    test("作成に失敗した際、エラーがコンソールに出力されること", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockCreateMaintenanceItem.mockRejectedValue(new Error("Create Error"));
      // 再フェッチ対策
      mockGetMaintenanceItems.mockResolvedValue([]);

      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useMaintenanceItems(), { wrapper });

      const insertData: InsertMaintenanceItem = {
        name: "エラーテスト",
        icon: null,
        interval_days: 7,
        last_completed_at: new Date().toISOString(),
        memo: "",
      };

      result.current.createMaintenanceItem.mutate(insertData);

      await waitFor(() => {
        expect(result.current.createMaintenanceItem.isError).toBe(true);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "メンテナンス項目の作成に失敗しました。",
      );
      consoleErrorSpy.mockRestore();
    });
  });
});
