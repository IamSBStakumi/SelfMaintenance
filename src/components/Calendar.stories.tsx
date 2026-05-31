import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import Calendar from "./Calendar";

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  args: {
    currentDate: new Date(2026, 4, 15),
    setCurrentDate: fn(),
    onDayClick: fn(),
    logs: [
      {
        id: "log-1",
        item_id: "item-1",
        completed_at: new Date(2026, 4, 3, 9, 0, 0).toISOString(),
      },
      {
        id: "log-2",
        item_id: "item-2",
        completed_at: new Date(2026, 4, 15, 12, 0, 0).toISOString(),
      },
      {
        id: "log-3",
        item_id: "item-3",
        completed_at: new Date(2026, 4, 15, 18, 0, 0).toISOString(),
      },
    ],
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithLogs: Story = {};

export const Empty: Story = {
  args: {
    logs: [],
  },
};
