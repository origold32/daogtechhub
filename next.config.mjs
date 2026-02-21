/** @type {import('next').NextConfig} */

import withSvgr from "next-svgr";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lasu.edu.ng",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "eftd-bucket.s3.eu-west-3.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  webpack(config, { isServer }) {
    // Disable source maps only in production to save memory
    if (!isServer && process.env.NODE_ENV === "production") {
      config.devtool = false;
    }

    return config;
  },
  experimental: {
    scrollRestoration: false,
  },
  reactStrictMode: false, // helps reduce memory use in development
};
export default withSvgr(nextConfig);
