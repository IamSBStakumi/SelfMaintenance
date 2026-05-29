import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import TaskForm, { TaskFormValues } from "./TaskForm";

const defaultValues: TaskFormValues = {
  name: "コンタクトレンズ交換",
  icon: "👀",
  interval_days: 14,
  last_completed_at: "2026-05-15",
  memo: "右目から交換。ストックが少なければ補充する。",
};

const meta = {
  title: "Components/TaskForm",
  component: TaskForm,
  args: {
    defaultValues,
    onSubmit: fn(),
    submitButtonText: "保存する",
  },
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof TaskForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {};

export const Edit: Story = {
  args: {
    submitButtonText: "更新する",
    defaultValues: {
      ...defaultValues,
      name: "浄水カートリッジ交換",
      icon: "💧",
      interval_days: 90,
      memo: "交換後に購入履歴へ型番を残す。",
    },
  },
};
