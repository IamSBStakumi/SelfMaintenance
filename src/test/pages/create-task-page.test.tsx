import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { parseISO, startOfDay } from "date-fns";
import { toast } from "react-toastify";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import CreateTaskPage from "@/app/create_task/page";
import { useCreateMaintenanceItem } from "@/hooks/useMaintenanceItems";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/hooks/useMaintenanceItems", () => ({
  useCreateMaintenanceItem: vi.fn(),
}));

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
  },
}));

const mockUseCreateMaintenanceItem = vi.mocked(useCreateMaintenanceItem);
const mockToast = vi.mocked(toast);

const setupCreateMutation = (
  mutateAsync: ReturnType<typeof vi.fn> = vi.fn().mockResolvedValue(undefined),
) => {
  mockUseCreateMaintenanceItem.mockReturnValue({
    mutateAsync,
  } as unknown as ReturnType<typeof useCreateMaintenanceItem>);

  return { mutateAsync };
};

describe("CreateTaskPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("初期値をフォームへ反映すること", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-31T10:00:00.000Z"));
    setupCreateMutation();

    render(<CreateTaskPage />);

    expect(
      screen.getByRole("heading", { name: "タスク新規登録" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("タスク名 *")).toHaveValue("");
    expect(screen.getByLabelText("アイコン")).toHaveValue("✨");
    expect(screen.getByLabelText("実施周期 (日間) *")).toHaveValue(30);
    expect(screen.getByLabelText("前回の実施日 *")).toHaveValue("2026-05-31");
    expect(screen.getByLabelText("メモ (任意)")).toHaveValue("");
  });

  test("フォーム送信時に作成payloadを渡し、成功時にダッシュボードへ遷移すること", async () => {
    const user = userEvent.setup();
    const { mutateAsync } = setupCreateMutation();
    render(<CreateTaskPage />);

    await user.type(screen.getByLabelText("タスク名 *"), "コンタクト交換");
    await user.clear(screen.getByLabelText("アイコン"));
    await user.type(screen.getByLabelText("アイコン"), "👀");
    await user.clear(screen.getByLabelText("実施周期 (日間) *"));
    await user.type(screen.getByLabelText("実施周期 (日間) *"), "14");
    await user.clear(screen.getByLabelText("前回の実施日 *"));
    await user.type(screen.getByLabelText("前回の実施日 *"), "2026-05-01");
    await user.type(screen.getByLabelText("メモ (任意)"), "右目から交換");

    await user.click(
      screen.getByRole("button", { name: "新しいタスクを登録する" }),
    );

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        name: "コンタクト交換",
        icon: "👀",
        interval_days: 14,
        last_completed_at: startOfDay(parseISO("2026-05-01")).toISOString(),
        memo: "右目から交換",
      });
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("任意項目が空の場合はnullとして作成payloadに渡すこと", async () => {
    const user = userEvent.setup();
    const { mutateAsync } = setupCreateMutation();
    render(<CreateTaskPage />);

    await user.type(screen.getByLabelText("タスク名 *"), "歯ブラシ交換");
    await user.clear(screen.getByLabelText("アイコン"));
    await user.clear(screen.getByLabelText("実施周期 (日間) *"));
    await user.type(screen.getByLabelText("実施周期 (日間) *"), "30");
    await user.clear(screen.getByLabelText("前回の実施日 *"));
    await user.type(screen.getByLabelText("前回の実施日 *"), "2026-05-02");

    await user.click(
      screen.getByRole("button", { name: "新しいタスクを登録する" }),
    );

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: null,
          memo: null,
        }),
      );
    });
  });

  test("作成失敗時にtoast errorを表示し、遷移しないこと", async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    setupCreateMutation(vi.fn().mockRejectedValue(new Error("作成失敗")));
    render(<CreateTaskPage />);

    await user.type(screen.getByLabelText("タスク名 *"), "失敗するタスク");
    await user.click(
      screen.getByRole("button", { name: "新しいタスクを登録する" }),
    );

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("作成失敗");
    });
    expect(mockPush).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "タスクの作成に失敗しました。",
      expect.any(Error),
    );
  });
});
