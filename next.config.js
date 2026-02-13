/** @type {import('next').NextConfig} */
// Force Cache Invalidation: 2026-02-13-1543-CLEAN-BUILD
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
