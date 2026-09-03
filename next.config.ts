import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: "http://172.16.20.249:3000/:path*",
      },
    ];
  },
};

export default nextConfig;
