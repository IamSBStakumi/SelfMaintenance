import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "react-toastify";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import TaskContent from "@/app/task/[id]/TaskContent";
import useMaintenanceItem from "@/hooks/useMaintenanceItem";
import { createMaintenanceItem } from "@/test/factories/maintenanceItemFactory";

vi.mock("@/hooks/useMaintenanceItem", () => ({
  default: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockUseMaintenanceItem = vi.mocked(useMaintenanceItem);
const mockToast = vi.mocked(toast);

const setupUseMaintenanceItemMock = ({
  deleteMutate = vi.fn().mockImplementation((_, options) => {
    options?.onSuccess?.();
  }),
  isDeletePending = false,
}: {
  deleteMutate?: ReturnType<typeof vi.fn>;
  isDeletePending?: boolean;
} = {}) => {
  mockUseMaintenanceItem.mockReturnValue({
    updateMaintenanceItem: {
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    },
    deleteMaintenanceItem: {
      mutate: deleteMutate,
      isPending: isDeletePending,
    },
  } as unknown as ReturnType<typeof useMaintenanceItem>);

  return { deleteMutate };
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

    render(<TaskContent taskData={createMaintenanceItem()} />);

    expect(
      screen.getByRole("button", { name: "このタスクを削除する" }),
    ).toBeInTheDocument();
  });

  test("削除確認をキャンセルした場合は削除しないこと", async () => {
    const user = userEvent.setup();
    const { deleteMutate } = setupUseMaintenanceItemMock();

    render(<TaskContent taskData={createMaintenanceItem()} />);

    const deleteButton = screen.getByRole("button", {
      name: "このタスクを削除する",
    });
    await user.click(deleteButton);

    const dialog = screen.getByRole("dialog", {
      name: "タスクを削除しますか？",
    });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "キャンセル" })).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(
      screen.queryByRole("dialog", { name: "タスクを削除しますか？" }),
    ).not.toBeInTheDocument();
    expect(deleteButton).toHaveFocus();
    expect(deleteMutate).not.toHaveBeenCalled();
  });

  test("Escapeキーで削除確認モーダルを閉じること", async () => {
    const user = userEvent.setup();
    const { deleteMutate } = setupUseMaintenanceItemMock();

    render(<TaskContent taskData={createMaintenanceItem()} />);

    await user.click(
      screen.getByRole("button", { name: "このタスクを削除する" }),
    );
    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("dialog", { name: "タスクを削除しますか？" }),
    ).not.toBeInTheDocument();
    expect(deleteMutate).not.toHaveBeenCalled();
  });

  test("Tabキーのフォーカスを削除確認モーダル内に閉じ込めること", async () => {
    const user = userEvent.setup();
    setupUseMaintenanceItemMock();

    render(<TaskContent taskData={createMaintenanceItem()} />);

    await user.click(
      screen.getByRole("button", { name: "このタスクを削除する" }),
    );

    const cancelButton = screen.getByRole("button", { name: "キャンセル" });
    const confirmButton = screen.getByRole("button", { name: "削除する" });

    expect(cancelButton).toHaveFocus();

    await user.tab();
    expect(confirmButton).toHaveFocus();

    await user.tab();
    expect(cancelButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(confirmButton).toHaveFocus();
  });

  test("削除中状態への更新ではフォーカスを元のボタンへ戻さないこと", async () => {
    const user = userEvent.setup();
    setupUseMaintenanceItemMock();

    const { rerender } = render(
      <TaskContent taskData={createMaintenanceItem()} />,
    );

    const deleteButton = screen.getByRole("button", {
      name: "このタスクを削除する",
    });
    await user.click(deleteButton);

    expect(screen.getByRole("button", { name: "キャンセル" })).toHaveFocus();

    const focusSpy = vi.spyOn(deleteButton, "focus");
    setupUseMaintenanceItemMock({ isDeletePending: true });

    rerender(<TaskContent taskData={createMaintenanceItem()} />);

    expect(focusSpy).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "キャンセル" })).toHaveFocus();
  });

  test("削除確認後に削除し、成功通知を表示すること", async () => {
    const user = userEvent.setup();
    const { deleteMutate } = setupUseMaintenanceItemMock();

    render(<TaskContent taskData={createMaintenanceItem()} />);

    await user.click(
      screen.getByRole("button", { name: "このタスクを削除する" }),
    );
    await user.click(screen.getByRole("button", { name: "削除する" }));

    await waitFor(() => {
      expect(deleteMutate).toHaveBeenCalledTimes(1);
    });
    expect(mockToast.success).toHaveBeenCalledWith("タスクを削除しました。");
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
    expect(
      screen.queryByRole("dialog", { name: "タスクを削除しますか？" }),
    ).not.toBeInTheDocument();
  });

  test("削除に失敗した場合はエラー通知を表示すること", async () => {
    const user = userEvent.setup();
    setupUseMaintenanceItemMock({
      deleteMutate: vi.fn().mockImplementation((_, options) => {
        options?.onError?.(new Error("Delete Error"));
      }),
    });

    render(<TaskContent taskData={createMaintenanceItem()} />);

    await user.click(
      screen.getByRole("button", { name: "このタスクを削除する" }),
    );
    await user.click(screen.getByRole("button", { name: "削除する" }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "タスクの削除に失敗しました。",
      );
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});
