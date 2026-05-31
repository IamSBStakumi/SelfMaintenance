import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "react-toastify";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import TaskContent from "@/app/task/[id]/TaskContent";
import useMaintenanceItem from "@/hooks/useMaintenanceItem";
import type { MaintenanceItem } from "@/types/maintenance";

vi.mock("@/hooks/useMaintenanceItem", () => ({
  default: vi.fn(),
}));

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockUseMaintenanceItem = vi.mocked(useMaintenanceItem);
const mockToast = vi.mocked(toast);

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

const setupUseMaintenanceItemMock = ({
  deleteMutateAsync = vi.fn().mockResolvedValue(undefined),
  isDeletePending = false,
}: {
  deleteMutateAsync?: ReturnType<typeof vi.fn>;
  isDeletePending?: boolean;
} = {}) => {
  mockUseMaintenanceItem.mockReturnValue({
    updateMaintenanceItem: {
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    },
    deleteMaintenanceItem: {
      mutateAsync: deleteMutateAsync,
      isPending: isDeletePending,
    },
  } as unknown as ReturnType<typeof useMaintenanceItem>);

  return { deleteMutateAsync };
};

describe("TaskContent", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("削除ボタンを表示すること", () => {
    setupUseMaintenanceItemMock();

    render(<TaskContent taskData={createMockItem()} />);

    expect(
      screen.getByRole("button", { name: "このタスクを削除する" }),
    ).toBeInTheDocument();
  });

  test("削除確認をキャンセルした場合は削除しないこと", async () => {
    const user = userEvent.setup();
    const { deleteMutateAsync } = setupUseMaintenanceItemMock();

    render(<TaskContent taskData={createMockItem()} />);

    await user.click(
      screen.getByRole("button", { name: "このタスクを削除する" }),
    );
    expect(
      screen.getByRole("dialog", { name: "タスクを削除しますか？" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(
      screen.queryByRole("dialog", { name: "タスクを削除しますか？" }),
    ).not.toBeInTheDocument();
    expect(deleteMutateAsync).not.toHaveBeenCalled();
  });

  test("Escapeキーで削除確認モーダルを閉じること", async () => {
    const user = userEvent.setup();
    const { deleteMutateAsync } = setupUseMaintenanceItemMock();

    render(<TaskContent taskData={createMockItem()} />);

    await user.click(
      screen.getByRole("button", { name: "このタスクを削除する" }),
    );
    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("dialog", { name: "タスクを削除しますか？" }),
    ).not.toBeInTheDocument();
    expect(deleteMutateAsync).not.toHaveBeenCalled();
  });

  test("削除確認後に削除し、成功通知を表示すること", async () => {
    const user = userEvent.setup();
    const { deleteMutateAsync } = setupUseMaintenanceItemMock();

    render(<TaskContent taskData={createMockItem()} />);

    await user.click(
      screen.getByRole("button", { name: "このタスクを削除する" }),
    );
    await user.click(screen.getByRole("button", { name: "削除する" }));

    await waitFor(() => {
      expect(deleteMutateAsync).toHaveBeenCalledTimes(1);
    });
    expect(mockToast.success).toHaveBeenCalledWith("タスクを削除しました。");
    expect(
      screen.queryByRole("dialog", { name: "タスクを削除しますか？" }),
    ).not.toBeInTheDocument();
  });

  test("削除に失敗した場合はエラー通知を表示すること", async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    setupUseMaintenanceItemMock({
      deleteMutateAsync: vi.fn().mockRejectedValue(new Error("Delete Error")),
    });

    render(<TaskContent taskData={createMockItem()} />);

    await user.click(
      screen.getByRole("button", { name: "このタスクを削除する" }),
    );
    await user.click(screen.getByRole("button", { name: "削除する" }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "タスクの削除に失敗しました。",
      );
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "タスクの削除に失敗しました。",
      expect.any(Error),
    );
  });
});
