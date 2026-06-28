import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        destination: "/service",
        permanent: true,
        source: "/thailand-fda-service",
      },
      {
        destination: "/service/:path*",
        permanent: true,
        source: "/thailand-fda-service/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        hostname: "images.unsplash.com",
        pathname: "/**",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
