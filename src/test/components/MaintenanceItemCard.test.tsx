import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi, beforeEach } from "vitest";
import MaintenanceItemCard from "@/app/dashboard/MaintenanceItemCard";
import useMaintenanceItem from "@/hooks/useMaintenanceItem";
import { MaintenanceItem } from "@/types/maintenance";
import { toast } from "react-toastify";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

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

const item: MaintenanceItem = {
  id: "item-1",
  user_id: "user-1",
  name: "Water plants",
  icon: "🪴",
  interval_days: 7,
  last_completed_at: "2026-05-20T00:00:00.000Z",
  memo: "ベランダ側を忘れない",
  created_at: "2026-05-01T00:00:00.000Z",
  updated_at: "2026-05-01T00:00:00.000Z",
};

const setupHook = ({
  isPending = false,
  mutateAsync = vi.fn().mockResolvedValue(undefined),
}: {
  isPending?: boolean;
  mutateAsync?: ReturnType<typeof vi.fn>;
} = {}) => {
  mockUseMaintenanceItem.mockReturnValue({
    updateMaintenanceItemNextCycle: {
      isPending,
      mutateAsync,
    },
  } as unknown as ReturnType<typeof useMaintenanceItem>);

  return { mutateAsync };
};

describe("MaintenanceItemCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("タスク情報を表示してカードクリックで詳細へ遷移すること", async () => {
    const user = userEvent.setup();
    setupHook();

    render(<MaintenanceItemCard item={item} />);

    expect(
      screen.getByRole("heading", { name: item.name }),
    ).toBeInTheDocument();
    expect(screen.getByText(item.memo as string)).toBeInTheDocument();

    await user.click(screen.getByRole("link"));
    expect(mockPush).toHaveBeenCalledWith("/task/item-1");
  });

  test("Enterキーで詳細へ遷移すること", async () => {
    const user = userEvent.setup();
    setupHook();

    render(<MaintenanceItemCard item={item} />);

    screen.getByRole("link").focus();
    await user.keyboard("{Enter}");

    expect(mockPush).toHaveBeenCalledWith("/task/item-1");
  });

  test("完了ボタンはカード遷移を止めて更新と通知を行うこと", async () => {
    const user = userEvent.setup();
    const { mutateAsync } = setupHook();

    render(<MaintenanceItemCard item={item} />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockToast.success).toHaveBeenCalledTimes(1);
  });

  test("更新中は完了ボタンを無効化すること", () => {
    setupHook({ isPending: true });

    render(<MaintenanceItemCard item={item} />);

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
