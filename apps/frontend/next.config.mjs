import webpack from "next/dist/compiled/webpack/webpack-lib.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ethcannes/ui", "@ethcannes/types"],
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // @wagmi/connectors v8 dynamically imports porto and @base-org/account
    // for connectors we don't use — ignore them to prevent build failures
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(porto|porto\/internal|@base-org\/account)$/,
      })
    );
    return config;
  },
};

export default nextConfig;
