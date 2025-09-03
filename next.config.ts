import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  productionBrowserSourceMaps: false,
  transpilePackages: ['lucide-react'],
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Optimize images
  images: {
    unoptimized: true
  }
};

export default nextConfig;