import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Disabling Turbopack to resolve dependency parsing issues in node_modules until they are patched */
  experimental: {
    // turbo: {
    //   rules: {
    //     "*.md": ["raw-loader"],
    //     "*.txt": ["raw-loader"],
    //   },
    // },
  },
  // Force webpack for production build if Vercel is defaulting to turbo
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
