import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const devBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    // Only proxy /api requests in development (local Spring Boot backend)
    if (!isDev) return [];

    return [
      {
        source: "/api/:path*",
        destination: `${devBackendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
