import type { NextConfig } from "next";
import { readFileSync } from "fs";
import { join } from "path";

let appVersion = '0.9.1';
try {
  const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
  appVersion = pkg.version;
} catch (e) {}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || appVersion,
  },
  experimental: {
    // @ts-ignore - Explicit UI budget bounds
    performanceBudgets: {
      'app/page': { maxFirstLoad: 100000 },
    },
  },
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: "camera=(), microphone=(), geolocation=(), payment=(self)"
          },
          {
            key: 'Strict-Transport-Security',
            value: "max-age=31536000; includeSubDomains; preload"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
