import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
