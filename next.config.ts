import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 最小化配置，避免任何潜在冲突
  reactStrictMode: true,
  swcMinify: true
};

export default nextConfig;
