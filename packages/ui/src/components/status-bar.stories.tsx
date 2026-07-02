import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatusBar } from "./status-bar";

const meta: Meta<typeof StatusBar> = {
  title: "Shell/StatusBar",
  component: StatusBar,
  args: { environment: "development", connectionStatus: "connected" },
};

export default meta;
type Story = StoryObj<typeof StatusBar>;

export const Default: Story = {};
