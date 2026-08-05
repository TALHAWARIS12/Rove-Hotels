/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rovem.beetlecdn.com',
      },
    ],
  },
};

export default nextConfig;
