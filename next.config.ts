/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        // Optionally, you can specify pathname patterns if needed
        // pathname: '/your-account-name/**',
      },
    ],
  },
  // ... other config options
};

module.exports = nextConfig;