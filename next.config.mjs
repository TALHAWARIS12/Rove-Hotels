/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:3000",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "rove_super_secret_auth_key_2026_change_in_prod",
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rovem.beetlecdn.com',
      },
    ],
  },
  output: "standalone",
  experimental: {
    memoryBasedWorkersCount: true,
  },
};

export default nextConfig;
