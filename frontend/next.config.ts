import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Silence the multiple lockfiles warning on Vercel
  // turbopack: {
  //   root: path.resolve(__dirname, ".."),
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
      },
      {
        // Backend on Render/Railway/etc — wildcard for any subdomain
        protocol: 'https',
        hostname: '**.onrender.com',
      },
      {
        protocol: 'https',
        hostname: '**.railway.app',
      },
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
