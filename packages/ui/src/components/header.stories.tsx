import type { Meta, StoryObj } from "@storybook/react-vite";

import { Header } from "./header";

const meta: Meta<typeof Header> = {
  title: "Shell/Header",
  component: Header,
  args: { userName: "Dev User" },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {};
