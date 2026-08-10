import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Fix Turbopack's workspace root detection in a monorepo
    root: __dirname,
  },
};

export default nextConfig;
