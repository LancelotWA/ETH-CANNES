/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ethcannes/ui", "@ethcannes/types"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
