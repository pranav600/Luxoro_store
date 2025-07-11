import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  eslint: {
    // Ignore ESLint errors during production build (e.g., on Vercel)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
