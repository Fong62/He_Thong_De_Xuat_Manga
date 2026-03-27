import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'uploads.mangadex.org',
          pathname: '/**',
        },
      ],
    },
};

export default nextConfig;
