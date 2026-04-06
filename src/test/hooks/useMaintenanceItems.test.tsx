import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

import useMaintenanceItems, {
  MAINTENANCE_ITEMS_QUERY_KEY,
} from "@/hooks/useMaintenanceItems";
import type { MaintenanceItem } from "@/types/maintenance";

// getMaintenanceItems Server Action をモック化
const mockGetMaintenanceItems = vi.fn();
const mockCreateMaintenanceItem = vi.fn();
vi.mock("@/services/maintenance_items", () => ({
  getMaintenanceItems: () => mockGetMaintenanceItems(),
  createMaintenanceItem: () => mockCreateMaintenanceItem(),
}));

// テスト用のモックデータ
const mockItems: MaintenanceItem[] = [
  {
    id: "uuid-1",
    user_id: "user-uuid-1",
    name: "コンタクトレンズの交換",
    icon: "👁",
    interval_days: 14,
    last_completed_at: "2026-03-20T00:00:00.000Z",
    memo: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-03-20T00:00:00.000Z",
  },
  {
    id: "uuid-2",
    user_id: "user-uuid-1",
    name: "歯のクリーニング",
    icon: null,
    interval_days: 90,
    last_completed_at: "2026-01-10T00:00:00.000Z",
    memo: "次回は歯科医院Aで予約",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-10T00:00:00.000Z",
  },
];

// テスト用の QueryClient + Provider を生成するユーティリティ
function createWrapper() {
  // テストごとに独立したキャッシュを持つ QueryClient を生成します
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // テスト中は自動リトライを無効化し、失敗を即座に検出できるようにします
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  // displayName を設定して React DevTools での識別しやすさを向上
  Wrapper.displayName = "TestQueryClientProvider";

  return Wrapper;
}

describe("useMaintenanceItems", () => {
  beforeEach(() => {
    // 各テスト前にモックの呼び出し履歴をリセット
    mockGetMaintenanceItems.mockClear();
  });

  it("MAINTENANCE_ITEMS_QUERY_KEY が正しい値でエクスポートされていること", () => {
    expect(MAINTENANCE_ITEMS_QUERY_KEY).toEqual(["maintenance_items"]);
  });

  it("データ取得が成功した場合、items が返却されること", async () => {
    // 成功レスポンスをモック
    mockGetMaintenanceItems.mockResolvedValue(mockItems);

    const { result } = renderHook(() => useMaintenanceItems(), {
      wrapper: createWrapper(),
    });

    // 初期状態は isPending: true
    expect(result.current.fetchMaintenanceItems.isPending).toBe(true);
    expect(result.current.fetchMaintenanceItems.data).toBeUndefined();

    // データ取得完了を待機
    await waitFor(() =>
      expect(result.current.fetchMaintenanceItems.isPending).toBe(false),
    );

    // 取得したデータが正しく返却されているか確認
    expect(result.current.fetchMaintenanceItems.isError).toBe(false);
    expect(result.current.fetchMaintenanceItems.data).toEqual(mockItems);
    expect(result.current.fetchMaintenanceItems.data).toHaveLength(2);
  });

  it("データが空配列の場合、空の配列が返却されること", async () => {
    mockGetMaintenanceItems.mockResolvedValue([]);

    const { result } = renderHook(() => useMaintenanceItems(), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(result.current.fetchMaintenanceItems.isPending).toBe(false),
    );

    expect(result.current.fetchMaintenanceItems.isError).toBe(false);
    expect(result.current.fetchMaintenanceItems.data).toEqual([]);
  });

  it("データ取得に失敗した場合、isError が true になること", async () => {
    // エラーレスポンスをモック
    mockGetMaintenanceItems.mockRejectedValue(
      new Error("メンテナンス項目の取得に失敗しました。"),
    );

    const { result } = renderHook(() => useMaintenanceItems(), {
      wrapper: createWrapper(),
    });

    // エラー状態になるまで待機
    await waitFor(() =>
      expect(result.current.fetchMaintenanceItems.isError).toBe(true),
    );

    expect(result.current.fetchMaintenanceItems.isPending).toBe(false);
    expect(result.current.fetchMaintenanceItems.data).toBeUndefined();
  });

  it("getMaintenanceItems が1度だけ呼び出されること", async () => {
    mockGetMaintenanceItems.mockResolvedValue(mockItems);

    const { result } = renderHook(() => useMaintenanceItems(), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(result.current.fetchMaintenanceItems.isPending).toBe(false),
    );

    // 同一マウント中にフェッチが重複して呼ばれていないことを確認
    expect(mockGetMaintenanceItems).toHaveBeenCalledTimes(1);
  });
});
