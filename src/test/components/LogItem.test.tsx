import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import LogItem from "@/app/calendar/LogItem";
import type { MaintenanceItem, MaintenanceLog } from "@/types/maintenance";

const createLog = (override: Partial<MaintenanceLog> = {}): MaintenanceLog => ({
  id: "log-1",
  item_id: "item-1",
  user_id: "user-1",
  completed_at: "2026-04-15T10:00:00Z",
  notes: null,
  maintenance_item_name: "完了時のタスク",
  maintenance_item_icon: "🧼",
  created_at: "2026-04-15T10:00:00Z",
  ...override,
});

const createItem = (
  override: Partial<MaintenanceItem> = {},
): MaintenanceItem => ({
  id: "item-1",
  user_id: "user-1",
  name: "現在のタスク",
  icon: "🧽",
  interval_days: 7,
  last_completed_at: "2026-04-15T10:00:00Z",
  memo: null,
  created_at: "2026-04-01T10:00:00Z",
  updated_at: "2026-04-01T10:00:00Z",
  ...override,
});

describe("LogItem", () => {
  test("スナップショットがある場合は完了時点のタスク名とアイコンを表示すること", () => {
    render(<LogItem log={createLog()} item={createItem()} />);

    expect(screen.getByText("完了時のタスク")).toBeInTheDocument();
    expect(screen.getByText("🧼")).toBeInTheDocument();
    expect(screen.queryByText("現在のタスク")).not.toBeInTheDocument();
  });

  test("タスク削除済みでもスナップショットから履歴を表示すること", () => {
    render(<LogItem log={createLog({ item_id: null })} item={undefined} />);

    expect(screen.getByText("完了時のタスク")).toBeInTheDocument();
    expect(screen.getByText("🧼")).toBeInTheDocument();
  });

  test("古いログでスナップショットがない場合は既存のフォールバックを表示すること", () => {
    render(
      <LogItem
        log={createLog({
          item_id: null,
          maintenance_item_name: null,
          maintenance_item_icon: null,
        })}
        item={undefined}
      />,
    );

    expect(screen.getByText("削除されたタスク")).toBeInTheDocument();
    expect(screen.getByText("✅")).toBeInTheDocument();
  });
});
