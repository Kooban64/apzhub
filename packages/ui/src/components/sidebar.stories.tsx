import type { Meta, StoryObj } from "@storybook/react-vite";

import { Sidebar } from "./sidebar";

const meta: Meta<typeof Sidebar> = {
  title: "Shell/Sidebar",
  component: Sidebar,
  args: {
    items: [
      { id: "home", label: "Home", active: true },
      { id: "settings", label: "Settings" },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {};
