import type { Meta, StoryObj } from "@storybook/react-vite";

import { ShellLayout } from "./shell-layout";

const meta: Meta<typeof ShellLayout> = {
  title: "Shell/Layout",
  component: ShellLayout,
  args: {
    userName: "Dev User",
    environment: "development",
    sidebarItems: [{ id: "home", label: "Home", active: true }],
    activityBarItems: [
      {
        id: "platform-home",
        label: "Home",
        active: true,
        ariaLabel: "Home workspace",
      },
    ],
    children: <p>Workspace content</p>,
  },
};

export default meta;
type Story = StoryObj<typeof ShellLayout>;

export const Default: Story = {};
