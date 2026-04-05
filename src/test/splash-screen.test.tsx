import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import SplashScreen from "@/app/page";

// next/navigation の useRouter をモック化
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

describe("SplashScreen", () => {
  beforeEach(() => {
    // タイマーをフェイクに変更し、ルーターのモック履歴をクリア
    vi.useFakeTimers();
    mockReplace.mockClear();
  });

  afterEach(() => {
    // クリーンアップ
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("初期レンダリングでタイトルやサブタイトルが正しく表示されること", () => {
    render(<SplashScreen />);

    // タイトルとサブタイトルが表示されているか確認
    expect(screen.getByText("SelfMaintenance")).toBeInTheDocument();
    expect(
      screen.getByText("あなたの快適な日々をサポート"),
    ).toBeInTheDocument();
  });

  it("2.5秒後に自動で /login へ遷移 (router.replace) すること", () => {
    render(<SplashScreen />);

    // マウント直後はまだ遷移していない
    expect(mockReplace).not.toHaveBeenCalled();

    // タイマーを2.5秒進める
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    // 指定時間経過後に呼び出されたことを確認
    expect(mockReplace).toHaveBeenCalledWith("/login");
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  it("画面がクリック・タップされたとき即座に /login へ遷移すること", () => {
    render(<SplashScreen />);

    // 画面全体（親コンテナ）の要素を取得してクリックを発火
    const skipContainer = screen.getByTitle("クリックしてスキップ");
    fireEvent.click(skipContainer);

    // タイマーを待たずに即座に遷移関数が呼ばれたことを確認
    expect(mockReplace).toHaveBeenCalledWith("/login");
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });
});
