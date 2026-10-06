import type { Metadata } from "next";

import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import RevealOnScroll from "@/components/RevealOnScroll";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

const SITE_TITLE = `${siteConfig.name} · 摄影 · 写字 · 白日梦 · 项目`;

export const metadata: Metadata = {
  ...buildMetadata({
    title: SITE_TITLE,
    description: siteConfig.description,
    path: "/",
  }),
  metadataBase: new URL(siteConfig.url),
  title: {
    default: SITE_TITLE,
    template: `%s · ${siteConfig.name}`,
  },
};

/** 结构化数据：提升搜索结果的展示形态 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  author: {
    "@type": "Person",
    name: siteConfig.author,
    jobTitle: siteConfig.role,
    email: siteConfig.email,
  },
  inLanguage: siteConfig.locale,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={siteConfig.locale}>
      <body className="min-h-dvh bg-(--color-base) text-(--color-fg) antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:rounded focus:bg-(--color-accent) focus:px-4 focus:py-2 focus:text-sm focus:text-black"
        >
          跳到主要内容
        </a>

        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />

        <RevealOnScroll />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
