import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "noojoro-backend-production.up.railway.app" },
      { protocol: "https", hostname: "fonts.googleapis.com" },
      { protocol: "https", hostname: "fonts.gstatic.com" },
      // Add your CDN / image storage hostname here if needed
      // { protocol: "https", hostname: "your-cdn.example.com" },
    ],
  },
};

export default nextConfig;
