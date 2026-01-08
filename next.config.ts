import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL; // 예: http://43.202.121.32:8080

    return [
      { source: "/students/:path*", destination: `${API_BASE}/students/:path*` },
      { source: "/mentors/:path*", destination: `${API_BASE}/mentors/:path*` },
      { source: "/enrollment/:path*", destination: `${API_BASE}/enrollment/:path*` },
      { source: "/work/:path*", destination: `${API_BASE}/work/:path*` },
      { source: "/others/:path*", destination: `${API_BASE}/others/:path*` },

      // 혹시 /api/** 를 프론트에서 직접 치는 코드가 섞여 있으면 이것도 같이
      { source: "/api/:path*", destination: `${API_BASE}/api/:path*` },
    ];
  },
};

export default nextConfig;