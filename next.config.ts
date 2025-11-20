import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pino', 'pino-pretty', 'thread-stream', '@solana/kit', '@solana-program/compute-budget', 'x402'],
  webpack: (config, { webpack }) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false
    };
    // Ignore problematic modules
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^tap$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^tape$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /\/test\//,
        contextRegExp: /thread-stream/,
      })
    );

    return config;
  },
  turbopack: {},
};

export default nextConfig;
