import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import SplashScreen from "@/app/page";

// next/navigation の useRouter をモック化
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

// Supabase クライアントのモック化
const mockGetSession = vi.fn();
vi.mock("@/lib/supabase/supabase", () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
    },
  }),
}));

describe("SplashScreen", () => {
  beforeEach(() => {
    // タイマーをフェイクに変更し、モック履歴をクリア
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockReplace.mockClear();
    mockGetSession.mockClear();

    // デフォルトのセッションを null に設定
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
  });

  afterEach(() => {
    // クリーンアップ
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test("初期レンダリングでタイトルやサブタイトルが正しく表示されること", () => {
    render(<SplashScreen />);

    // タイトルとサブタイトルが表示されているか確認
    expect(screen.getByText("SelfMaintenance")).toBeInTheDocument();
    expect(
      screen.getByText("あなたの快適な日々をサポート"),
    ).toBeInTheDocument();
  });

  test("2.5秒後に自動で /login へ遷移 (router.replace) すること", async () => {
    render(<SplashScreen />);

    // マウント直後はまだ遷移していない
    expect(mockReplace).not.toHaveBeenCalled();

    // タイマーを2.5秒進める
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    // 非同期処理 (getSession) の解決を待機
    await act(async () => {
      await Promise.resolve();
    });

    // 指定時間経過後に呼び出されたことを確認
    expect(mockReplace).toHaveBeenCalledWith("/login");
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  test("画面がクリック・タップされたとき即座に /login へ遷移すること", async () => {
    render(<SplashScreen />);

    // 画面全体（親コンテナ）の要素を取得してクリックを発火
    const skipContainer = screen.getByTitle("クリックしてスキップ");

    // クリックイベントとそれに伴う非同期処理の完了を待機
    await act(async () => {
      fireEvent.click(skipContainer);
    });

    // タイマーを待たずに即座に遷移関数が呼ばれたことを確認
    expect(mockReplace).toHaveBeenCalledWith("/login");
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  test("セッションが確立している場合、2.5秒後に自動で /dashboard へ遷移 (router.replace) すること", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: {} },
      error: null,
    });

    render(<SplashScreen />);

    // マウント直後はまだ遷移していない
    expect(mockReplace).not.toHaveBeenCalled();

    // タイマーを2.5秒進める
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    // 非同期処理 (getSession) の解決を待機
    await act(async () => {
      await Promise.resolve();
    });

    // 指定時間経過後に呼び出されたことを確認
    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  test("セッションが確立している場合、画面がクリック・タップされたとき即座に /dashboard へ遷移すること", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: {} },
      error: null,
    });
    render(<SplashScreen />);

    // 画面全体（親コンテナ）の要素を取得してクリックを発火
    const skipContainer = screen.getByTitle("クリックしてスキップ");

    // クリックイベントとそれに伴う非同期処理の完了を待機
    await act(async () => {
      fireEvent.click(skipContainer);
    });

    // タイマーを待たずに即座に遷移関数が呼ばれたことを確認
    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  test("50ms経過後にmountedステートが切り替わり、アニメーション用クラスが付与されること", () => {
    render(<SplashScreen />);

    const animationDiv = screen.getByTestId("splash-screen-content");

    // マウント直後はアニメーション前のクラスを持つ
    expect(animationDiv).toHaveClass("opacity-0");

    act(() => {
      vi.advanceTimersByTime(50);
    });

    // 50ms経過でアニメーション後のクラスに切り替わる
    expect(animationDiv).toHaveClass("opacity-100");
  });

  test("コンポーネントがアンマウントされた際、タイマーが適切にクリアされ予期せぬ遷移が起きないこと", async () => {
    const { unmount } = render(<SplashScreen />);

    // 2.5秒経過する前にアンマウントする
    unmount();

    // 2.5秒経過させる
    await act(async () => {
      vi.advanceTimersByTime(2500);
      await Promise.resolve();
    });

    // アンマウント時にタイマーがクリアされていれば、遷移処理は発火しない
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
