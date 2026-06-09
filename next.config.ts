import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "@sparticuz/chromium"]
};

export default nextConfig;
