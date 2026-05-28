import React, { ReactNode } from "react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useMaintenanceItem, {
  MAINTENANCE_ITEM_QUERY_KEY,
} from "@/hooks/useMaintenanceItem";
import { MAINTENANCE_ITEMS_QUERY_KEY } from "@/hooks/useMaintenanceItems";
import * as services from "@/services/maintenanceService";
import type {
  MaintenanceItem,
  UpdateMaintenanceItem,
} from "@/types/maintenance";

// Next.js のルーターモック
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// サービスのモック化
vi.mock("@/services/maintenanceService", () => ({
  getMaintenanceItemById: vi.fn(),
  updateMaintenanceItem: vi.fn(),
  updateMaintenanceItemNextCycle: vi.fn(),
}));

const mockGetMaintenanceItemById = vi.mocked(services.getMaintenanceItemById);
const mockUpdateMaintenanceItem = vi.mocked(services.updateMaintenanceItem);
const mockUpdateMaintenanceItemNextCycle = vi.mocked(
  services.updateMaintenanceItemNextCycle,
);

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

describe("useMaintenanceItem", () => {
  const queryClients: QueryClient[] = [];

  const createWrapper = () => {
    const testQueryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    queryClients.push(testQueryClient);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    );

    return { testQueryClient, wrapper };
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    queryClients.forEach((client) => client.clear());
    queryClients.length = 0;
    vi.restoreAllMocks();
  });

  describe("Query: fetchMaintenanceItem", () => {
    test("正常にgetMaintenanceItemByIdが呼ばれ、データが取得できること", async () => {
      const mockData = createMockItem();
      mockGetMaintenanceItemById.mockResolvedValue(mockData);

      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useMaintenanceItem("item1"), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.fetchMaintenanceItem.isSuccess).toBe(true);
      });

      expect(mockGetMaintenanceItemById).toHaveBeenCalledTimes(1);
      expect(mockGetMaintenanceItemById.mock.calls[0][0]).toEqual("item1");
      expect(result.current.fetchMaintenanceItem.data).toEqual(mockData);
    });

    test("空のIDを渡した場合はクエリがフェッチされない(enabled: false)こと", async () => {
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useMaintenanceItem(""), { wrapper });

      expect(result.current.fetchMaintenanceItem.fetchStatus).toBe("idle");
      expect(mockGetMaintenanceItemById).not.toHaveBeenCalled();
    });
  });

  describe("Mutation: updateMaintenanceItem", () => {
    test("更新が成功した際、クエリのinvalidateとルーターの遷移が行われること", async () => {
      const { wrapper, testQueryClient } = createWrapper();
      const resetSpy = vi.spyOn(testQueryClient, "invalidateQueries");

      const updateData: UpdateMaintenanceItem = { name: "更新後" };
      const mockResponse = createMockItem({ name: "更新後" });

      // 再フェッチ対策
      mockGetMaintenanceItemById.mockResolvedValue(mockResponse);
      mockUpdateMaintenanceItem.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useMaintenanceItem("item1"), {
        wrapper,
      });

      result.current.updateMaintenanceItem.mutate(updateData);

      await waitFor(() => {
        expect(result.current.updateMaintenanceItem.isSuccess).toBe(true);
      });

      expect(mockUpdateMaintenanceItem).toHaveBeenCalledTimes(1);
      expect(mockUpdateMaintenanceItem.mock.calls[0][0]).toEqual("item1");
      expect(mockUpdateMaintenanceItem.mock.calls[0][1]).toEqual(updateData);
      expect(resetSpy).toHaveBeenCalledWith({
        queryKey: MAINTENANCE_ITEM_QUERY_KEY("item1"),
      });
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    test("更新に失敗した際、エラーがコンソールに出力され、遷移しないこと", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockUpdateMaintenanceItem.mockRejectedValue(new Error("Update Error"));
      mockGetMaintenanceItemById.mockResolvedValue(createMockItem());

      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useMaintenanceItem("item1"), {
        wrapper,
      });

      result.current.updateMaintenanceItem.mutate({ name: "エラー用" });

      await waitFor(() => {
        expect(result.current.updateMaintenanceItem.isError).toBe(true);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "定期タスクの更新に失敗しました。",
      );
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("Mutation: updateMaintenanceItemNextCycle", () => {
    test("更新が成功した際、一覧と詳細の両方のクエリがinvalidateされること", async () => {
      const { wrapper, testQueryClient } = createWrapper();
      const resetSpy = vi.spyOn(testQueryClient, "invalidateQueries");

      const mockResponse = createMockItem();
      // 再フェッチ対策
      mockGetMaintenanceItemById.mockResolvedValue(mockResponse);
      mockUpdateMaintenanceItemNextCycle.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useMaintenanceItem("item1"), {
        wrapper,
      });

      result.current.updateMaintenanceItemNextCycle.mutate();

      await waitFor(() => {
        expect(result.current.updateMaintenanceItemNextCycle.isSuccess).toBe(
          true,
        );
      });

      expect(mockUpdateMaintenanceItemNextCycle).toHaveBeenCalledTimes(1);
      expect(mockUpdateMaintenanceItemNextCycle.mock.calls[0][0]).toEqual(
        "item1",
      );

      // 一覧と詳細の両方のキーに対して呼ばれることを確認
      expect(resetSpy).toHaveBeenCalledWith({
        queryKey: MAINTENANCE_ITEMS_QUERY_KEY,
      });
      expect(resetSpy).toHaveBeenCalledWith({
        queryKey: MAINTENANCE_ITEM_QUERY_KEY("item1"),
      });
    });

    test("更新に失敗した際、エラーがコンソールに出力されること", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockUpdateMaintenanceItemNextCycle.mockRejectedValue(
        new Error("Update Error"),
      );
      mockGetMaintenanceItemById.mockResolvedValue(createMockItem());

      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useMaintenanceItem("item1"), {
        wrapper,
      });

      result.current.updateMaintenanceItemNextCycle.mutate();

      await waitFor(() => {
        expect(result.current.updateMaintenanceItemNextCycle.isError).toBe(
          true,
        );
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "定期タスクの更新に失敗しました。",
      );
      consoleErrorSpy.mockRestore();
    });
  });
});
