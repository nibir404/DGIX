import type { NextConfig } from "next";

const internalBff = (process.env.DGIX_INTERNAL_BFF_URL || "http://127.0.0.1:18118").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  turbopack: { root: __dirname },
  async rewrites() {
    return [
      {
        source: "/bff/:path*",
        destination: `${internalBff}/bff/:path*`,
      },
      {
        source: "/checkout/:path*",
        destination: `${internalBff}/checkout/:path*`,
      },
    ];
  },
};

export default nextConfig;
