import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // 占位图与替换后的本地图片都放在 public/images 下。
    // 若之后接入图床/CDN，把远程域名加进 remotePatterns 即可继续用 next/image 优化。
    remotePatterns: [],
  },
};

export default nextConfig;
