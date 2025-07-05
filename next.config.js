/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sfo2.digitaloceanspaces.com",
        pathname: "**",
      },
    ],
  },
  webpack: (config, { buildId, def, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias.canvas = false;
    config.resolve.fallback = { fs: false, os: false, path: false };
    config.resolve.alias.encodig = false;
    return config;
  },
};

module.exports = nextConfig;
