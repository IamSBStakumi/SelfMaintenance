import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { addMonths, subMonths } from "date-fns";
import { describe, expect, test, vi } from "vitest";
import Calendar from "@/components/Calendar";

const currentDate = new Date("2026-05-15T00:00:00.000Z");

const getEnabledDayButton = (day: string) => {
  const button = screen
    .getAllByRole("button", { name: day })
    .find((element) => !(element as HTMLButtonElement).disabled);

  if (!button) {
    throw new Error(`${day}日のボタンが見つかりません`);
  }

  return button;
};

describe("Calendar", () => {
  test("当月の日付クリック時に選択日を通知すること", async () => {
    const user = userEvent.setup();
    const onDayClick = vi.fn();

    render(
      <Calendar
        logs={[]}
        onDayClick={onDayClick}
        currentDate={currentDate}
        setCurrentDate={vi.fn()}
      />,
    );

    await user.click(getEnabledDayButton("15"));

    expect(onDayClick).toHaveBeenCalledTimes(1);
    expect(onDayClick.mock.calls[0][0]).toEqual(new Date(2026, 4, 15));
  });

  test("前月・次月ボタンで表示月を更新すること", async () => {
    const user = userEvent.setup();
    const setCurrentDate = vi.fn();

    render(
      <Calendar
        logs={[]}
        onDayClick={vi.fn()}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
      />,
    );

    const navigationButtons = screen.getAllByRole("button").slice(0, 2);
    await user.click(navigationButtons[0]);
    await user.click(navigationButtons[1]);

    expect(setCurrentDate).toHaveBeenNthCalledWith(
      1,
      subMonths(currentDate, 1),
    );
    expect(setCurrentDate).toHaveBeenNthCalledWith(
      2,
      addMonths(currentDate, 1),
    );
  });

  test("当月外の日付はクリックできないこと", async () => {
    const user = userEvent.setup();
    const onDayClick = vi.fn();

    render(
      <Calendar
        logs={[]}
        onDayClick={onDayClick}
        currentDate={currentDate}
        setCurrentDate={vi.fn()}
      />,
    );

    const disabledDay = screen
      .getAllByRole("button", { name: "26" })
      .find((element) => (element as HTMLButtonElement).disabled);

    expect(disabledDay).toBeDefined();
    await user.click(disabledDay as HTMLButtonElement);
    expect(onDayClick).not.toHaveBeenCalled();
  });

  test("完了ログがある日に視覚マーカーを表示すること", () => {
    const { container } = render(
      <Calendar
        logs={[
          {
            id: "log-1",
            item_id: "item-1",
            completed_at: "2026-05-15T10:00:00.000Z",
          },
          {
            id: "log-2",
            item_id: "item-2",
            completed_at: "2026-05-15T11:00:00.000Z",
          },
        ]}
        onDayClick={vi.fn()}
        currentDate={currentDate}
        setCurrentDate={vi.fn()}
      />,
    );

    expect(container.querySelector(".bg-emerald-500")).toBeInTheDocument();
    expect(container.querySelector(".bg-indigo-400")).toBeInTheDocument();
  });
});
