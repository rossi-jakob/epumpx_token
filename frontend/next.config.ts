import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },

  // /* config options here */
  // pageExtensions: ["mdx", "md", "jsx", "js", "tsx", "ts"],
  // reactStrictMode: true,
  // webpack: (config) => {
  //   config.externals.push("pino-pretty", "lokijs", "encoding");
  //   config.resolve.fallback = { fs: false, net: false, tls: false };
  //   return config;
  // },
  // images: {
  //   unoptimized: true,
  //   remotePatterns: [
  //     {
  //       protocol: "https",
  //       hostname: "bvb-webapp.com",
  //     },
  //     {
  //       protocol: "https",
  //       hostname: "arweave.net",
  //     },
  //   ],
  // },
  output: "export",
  distDir: "build",
  //output: 'export',
  eslint: {
    ignoreDuringBuilds: true
  },
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
