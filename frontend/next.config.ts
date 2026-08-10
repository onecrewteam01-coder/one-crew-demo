import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // If building on Vercel, use the deployed Render URL, otherwise fallback to local/custom env
    NEXT_PUBLIC_API_URL: process.env.VERCEL
      ? "https://one-crew-demo.onrender.com"
      : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"),
  },
};

export default nextConfig;