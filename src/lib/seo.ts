import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

interface BuildMetadataInput {
  title: string;
  description?: string;
  /** 站点根路径起的绝对路径，如 "/gallery" */
  path?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  tags?: string[];
  noIndex?: boolean;
}

/** 统一的 SEO 元数据构造：标题模板、canonical、Open Graph、Twitter Card */
export function buildMetadata({
  title,
  description,
  path = "/",
  image,
  type = "website",
  publishedTime,
  tags,
  noIndex = false,
}: BuildMetadataInput): Metadata {
  const url = `${siteConfig.url}${path}`;
  const desc = description ?? siteConfig.description;
  const ogImage = image ? `${siteConfig.url}${image}` : undefined;

  return {
    title,
    description: desc,
    keywords: tags?.length ? [...tags, ...siteConfig.keywords] : [...siteConfig.keywords],
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: type === "article" ? "article" : "website",
      url,
      title,
      description: desc,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}
