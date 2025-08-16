import type { NextConfig } from "next";
import "@/env";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
  /* config options here */
};

export default nextConfig;
