import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
    // You can uncomment the next line if sourcemaps keep pointing outside and causing devtools noise
    // serverSourceMaps: false,
  },
  productionBrowserSourceMaps: false,
};

export default nextConfig;
