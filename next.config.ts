import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 只影响本地开发：允许用局域网地址（手机连同一个 Wi-Fi）访问开发服务器。
  // 不加的话，Next 会拒绝来自非 localhost 的热更新连接，页面脚本不激活——
  // 手机上能看到页面，但菜单点不动、动效也不跑。电脑的局域网 IP 变了要跟着改。
  allowedDevOrigins: ["192.168.31.231"],
  // 板块重新划分后改了地址的旧路由，跳到新位置，免得已经发出去的链接失效。
  // /archive 是直接删掉的，不在这里。
  async redirects() {
    return [
      { source: "/projects", destination: "/products", permanent: true },
      { source: "/projects/:slug", destination: "/products/:slug", permanent: true },
      { source: "/writing", destination: "/blog", permanent: true },
      { source: "/dreams", destination: "/blog", permanent: true },
    ];
  },
  images: {
    // 占位图与替换后的本地图片都放在 public/images 下。
    // 若之后接入图床/CDN，把远程域名加进 remotePatterns 即可继续用 next/image 优化。
    remotePatterns: [],
  },
};

export default nextConfig;
