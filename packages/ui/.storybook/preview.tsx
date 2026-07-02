import "@apzhub/theme/styles.css";

import type { Preview } from "@storybook/react-vite";
import { ThemeProvider } from "@apzhub/theme";
import React from "react";

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="bg-[var(--color-background)] p-6 text-[var(--color-foreground)]">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default preview;
