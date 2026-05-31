import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import Button from "./Button";

const meta = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "Googleでログイン",
    onClick: fn(),
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "ログイン中...",
  },
};
