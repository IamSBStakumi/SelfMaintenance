import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import TaskForm, { TaskFormValues } from "@/components/TaskForm";

const defaultValues: TaskFormValues = {
  name: "コンタクト交換",
  icon: "👀",
  interval_days: 30,
  last_completed_at: "2026-05-01",
  memo: "右目から交換",
};

const getInput = (container: HTMLElement, selector: string) => {
  const input = container.querySelector(selector);

  if (!input) {
    throw new Error(`${selector} が見つかりません`);
  }

  return input as HTMLInputElement | HTMLTextAreaElement;
};

describe("TaskForm", () => {
  test("初期値を各入力欄へ反映すること", () => {
    const { container } = render(
      <TaskForm defaultValues={defaultValues} onSubmit={vi.fn()} />,
    );

    expect(getInput(container, "#icon")).toHaveValue(defaultValues.icon);
    expect(getInput(container, "#task-name")).toHaveValue(defaultValues.name);
    expect(getInput(container, "#interval-days")).toHaveValue(
      defaultValues.interval_days,
    );
    expect(getInput(container, "#last-completed-at")).toHaveValue(
      defaultValues.last_completed_at,
    );
    expect(getInput(container, "#memo")).toHaveValue(defaultValues.memo);
  });

  test("入力値を検証して送信ハンドラへ渡すこと", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <TaskForm
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitButtonText="保存する"
      />,
    );

    await user.clear(getInput(container, "#task-name"));
    await user.type(getInput(container, "#task-name"), "  歯ブラシ交換  ");
    await user.clear(getInput(container, "#interval-days"));
    await user.type(getInput(container, "#interval-days"), "14");
    await user.clear(getInput(container, "#memo"));
    await user.type(getInput(container, "#memo"), "洗面台ストック確認");
    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      name: "歯ブラシ交換",
      icon: "👀",
      interval_days: 14,
      last_completed_at: "2026-05-01",
      memo: "洗面台ストック確認",
    });
  });

  test("必須項目が空の場合は送信しないこと", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const { container } = render(
      <TaskForm
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitButtonText="保存する"
      />,
    );

    await user.clear(getInput(container, "#task-name"));
    await user.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
      expect(container.querySelector(".text-rose-500")).toBeInTheDocument();
    });
  });

  test("送信エラー時にエラーメッセージを表示すること", async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const onSubmit = vi.fn().mockRejectedValue(new Error("送信失敗"));
    render(
      <TaskForm
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitButtonText="保存する"
      />,
    );

    await user.click(screen.getByRole("button", { name: "保存する" }));

    expect(await screen.findByText(/処理に失敗/)).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
