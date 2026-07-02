import type { Metadata } from "next";

import { AuthProvider } from "@apzhub/auth";
import { ThemeProvider } from "@apzhub/theme";

import { AppProviders } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "APZHUB",
  description: "Enterprise Operating Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="min-h-full bg-[var(--color-background)] text-[var(--color-foreground)]">
        <ThemeProvider>
          <AuthProvider>
            <AppProviders>{children}</AppProviders>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
