import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import Calendar from "./Calendar";

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  args: {
    currentDate: new Date("2026-05-15T00:00:00.000Z"),
    setCurrentDate: fn(),
    onDayClick: fn(),
    logs: [
      {
        id: "log-1",
        item_id: "item-1",
        completed_at: "2026-05-03T09:00:00.000Z",
      },
      {
        id: "log-2",
        item_id: "item-2",
        completed_at: "2026-05-15T12:00:00.000Z",
      },
      {
        id: "log-3",
        item_id: "item-3",
        completed_at: "2026-05-15T18:00:00.000Z",
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
