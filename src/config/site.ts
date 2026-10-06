// 站点级配置：改这里就能全站生效（SEO、导航、社交链接）
export const siteConfig = {
  name: "林夕相心",
  author: "林夕",
  role: "拍照 · 写字 · 做点小东西",
  location: "中国 · 深圳",
  email: "821314574@qq.com",
  // 部署上线前改成真实域名，站点地图与 canonical 链接都读它。
  // 优先级：SITE_URL（运行时可注入）> NEXT_PUBLIC_SITE_URL > 占位域名
  url:
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://example.com",
  locale: "zh-CN",
  description:
    "一个人的四个角落：镜头里看到的世界、写下来才算数的字、还没实现的白日梦，以及那些好玩的小项目。",
  keywords: [
    "个人博客",
    "林夕相心",
    "摄影作品集",
    "随笔",
    "白日梦",
    "独立项目",
    "生活记录",
  ],
  social: [{ label: "GitHub", href: "https://github.com/vingofan" }],
  nav: [
    { label: "首页", href: "/" },
    { label: "摄影", href: "/gallery" },
    { label: "写字的地方", href: "/writing" },
    { label: "白日梦", href: "/dreams" },
    { label: "好玩的项目", href: "/projects" },
    { label: "关于", href: "/about" },
  ],
} as const;

/** 站点副标题：首页与 SEO 共用 */
export const siteTagline =
  "摄影只是生活的一块。这里还放着写下来的字、没做完的梦，和一些没什么用但很好玩的东西。";

export type SiteConfig = typeof siteConfig;
