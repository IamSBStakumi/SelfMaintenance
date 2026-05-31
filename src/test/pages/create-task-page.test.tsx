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

const getInput = (container: HTMLElement, selector: string) => {
  const input = container.querySelector(selector);

  if (!input) {
    throw new Error(`${selector} が見つかりません`);
  }

  return input as HTMLInputElement | HTMLTextAreaElement;
};

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

    const { container } = render(<CreateTaskPage />);

    expect(
      screen.getByRole("heading", { name: "タスク新規登録" }),
    ).toBeInTheDocument();
    expect(getInput(container, "#task-name")).toHaveValue("");
    expect(getInput(container, "#icon")).toHaveValue("✨");
    expect(getInput(container, "#interval-days")).toHaveValue(30);
    expect(getInput(container, "#last-completed-at")).toHaveValue("2026-05-31");
    expect(getInput(container, "#memo")).toHaveValue("");
  });

  test("フォーム送信時に作成payloadを渡し、成功時にダッシュボードへ遷移すること", async () => {
    const user = userEvent.setup();
    const { mutateAsync } = setupCreateMutation();
    const { container } = render(<CreateTaskPage />);

    await user.type(getInput(container, "#task-name"), "コンタクト交換");
    await user.clear(getInput(container, "#icon"));
    await user.type(getInput(container, "#icon"), "👀");
    await user.clear(getInput(container, "#interval-days"));
    await user.type(getInput(container, "#interval-days"), "14");
    await user.clear(getInput(container, "#last-completed-at"));
    await user.type(getInput(container, "#last-completed-at"), "2026-05-01");
    await user.type(getInput(container, "#memo"), "右目から交換");

    await user.click(
      screen.getByRole("button", { name: "新しいタスクを登録する" }),
    );

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledTimes(1);
    });
    expect(mutateAsync).toHaveBeenCalledWith({
      name: "コンタクト交換",
      icon: "👀",
      interval_days: 14,
      last_completed_at: startOfDay(parseISO("2026-05-01")).toISOString(),
      memo: "右目から交換",
    });
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  test("任意項目が空の場合はnullとして作成payloadに渡すこと", async () => {
    const user = userEvent.setup();
    const { mutateAsync } = setupCreateMutation();
    const { container } = render(<CreateTaskPage />);

    await user.type(getInput(container, "#task-name"), "歯ブラシ交換");
    await user.clear(getInput(container, "#icon"));
    await user.clear(getInput(container, "#interval-days"));
    await user.type(getInput(container, "#interval-days"), "30");
    await user.clear(getInput(container, "#last-completed-at"));
    await user.type(getInput(container, "#last-completed-at"), "2026-05-02");

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
    const { container } = render(<CreateTaskPage />);

    await user.type(getInput(container, "#task-name"), "失敗するタスク");
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
