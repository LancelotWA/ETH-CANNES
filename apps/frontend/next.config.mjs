/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ethcannes/ui", "@ethcannes/types"],
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // @wagmi/connectors v8 has an optional import to porto/internal
    // which we don't use — tell webpack to ignore it
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "porto/internal": false,
    };
    return config;
  },
};

export default nextConfig;
