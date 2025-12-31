import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withPlugins from "next-compose-plugins";

const withNextIntl = createNextIntlPlugin("./src/i18n/i18n.ts");

const nextConfig: NextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cloudinary-marketing-res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "admin.esports.gg",
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
      },
      {
        protocol: "https",
        hostname: "hwres.ldmnq.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos", // 👈 thêm cái này
      },
      {
        protocol: "http", // hoặc "https" nếu bạn host bằng https
        hostname: "commondatastorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "bondy.io.vn", // 👈 thêm cái này
      },
    ],
  },
};

export default withPlugins([withNextIntl], nextConfig);
