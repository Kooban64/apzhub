import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // Playwright runs a second `next dev` (e.g. local identity on another port); use a separate output dir to avoid `.next` contention.
  ...(process.env.APZHUB_NEXT_DIST_DIR ? { distDir: process.env.APZHUB_NEXT_DIST_DIR } : {}),
};

export default nextConfig;
