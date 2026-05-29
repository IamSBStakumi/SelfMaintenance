import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ErrorAlert from "./ErrorAlert";

const meta = {
  title: "Components/ErrorAlert",
  component: ErrorAlert,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ErrorAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
