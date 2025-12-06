import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Explicitly set the project root for Turbopack to silence root inference warnings.
  turbopack: {
    root: __dirname,
  },
};

export default withBundleAnalyzer(nextConfig);
