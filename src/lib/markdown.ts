/**
 * Markdown 渲染管线
 * ------------------------------------------------------------------
 * 支持：GFM（表格、删除线等）、正文内 raw HTML、图片自动加图注、标题锚点。
 *
 * 图注写法（推荐）：
 *   ![替代文本](/images/a.jpg "这里是图片说明")
 *   → 渲染成 <figure><img><figcaption>这里是图片说明</figcaption></figure>
 *
 * 也支持直接手写 HTML：
 *   <figure><img src="..." alt="..."><figcaption>说明</figcaption></figure>
 */
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";

import type { TocItem } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** hast 节点的最小描述，避免额外引入 @types/hast */
interface HNode {
  type: string;
  tagName?: string;
  properties?: Record<string, any>;
  children?: HNode[];
  value?: string;
}

/** 标题文本 → 锚点 id（保留中文，去掉标点，空格转横线） */
export function slugifyHeader(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[`*_~()（）【】\[\]{}:：,，。.、!！?？'"]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * 给 h2/h3 加 id（供目录锚点与分享链接使用）
 * 注意：这里的规则必须与 extractToc() 完全一致，否则锚点会对不上。
 */
function rehypeHeadingIds() {
  return (tree: any): void => {
    const walk = (node: HNode): void => {
      if (!Array.isArray(node.children)) return;
      for (const child of node.children) {
        if (child.type !== "element") continue;
        walk(child);
        const tag = (child.tagName || "").toLowerCase();
        if (tag !== "h2" && tag !== "h3") continue;
        const text = collectText(child).trim();
        if (!text) continue;
        const id = slugifyHeader(text);
        if (!id) continue;
        child.properties = { ...(child.properties || {}), id, tabIndex: -1 };
      }
    };
    walk(tree);
  };
}

function collectText(node: HNode): string {
  if (typeof node.value === "string") return node.value;
  if (!Array.isArray(node.children)) return "";
  return node.children.map(collectText).join("");
}

/**
 * 把一个只包含单张图片、且带 title 的段落升级成 figure + figcaption。
 * 同时给所有正文图片补 loading="lazy" 与 decoding="async"（懒加载）。
 */
function rehypeFigureCaptions() {
  return (tree: any): void => {
    const walk = (node: HNode): void => {
      if (!Array.isArray(node.children)) return;

      // 先处理子节点，再处理自身（自底向上）
      for (const child of node.children) walk(child);

      if (node.type !== "element" || node.tagName !== "p") return;

      const meaningful = node.children.filter(
        (c) => !(c.type === "text" && !String(c.value || "").trim())
      );
      if (meaningful.length !== 1) return;

      const img = meaningful[0];
      if (img.type !== "element" || img.tagName !== "img") return;

      const props = img.properties || {};
      const caption = props.title ?? props.alt;
      if (!caption) return;

      delete props.title;
      // 正文里的图片统一懒加载 + 异步解码
      img.properties = {
        ...props,
        loading: "lazy",
        decoding: "async",
      };

      node.tagName = "figure";
      node.properties = { className: ["figure"] };
      node.children = [
        img,
        {
          type: "element",
          tagName: "figcaption",
          properties: {},
          children: [{ type: "text", value: String(caption) }],
        },
      ];
    };
    walk(tree);
  };
}

/** 给表格套一层容器，方便在移动端横向滚动 */
function rehypeResponsiveTable() {
  return (tree: any): void => {
    const walk = (node: any): void => {
      if (!Array.isArray(node.children)) return;
      for (const child of node.children) walk(child);
      node.children = node.children.map((child: any) => {
        if (child.type === "element" && child.tagName === "table") {
          return {
            type: "element",
            tagName: "div",
            properties: { className: ["table-wrap"] },
            children: [child],
          };
        }
        return child;
      });
    };
    walk(tree);
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeHeadingIds)
  .use(rehypeFigureCaptions)
  .use(rehypeResponsiveTable)
  .use(rehypeStringify);

/** 把 Markdown 渲染为 HTML 字符串 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await processor.process(markdown);
  return String(file);
}

/**
 * 从原始 Markdown 提取目录（仅 h2 / h3）。
 * 之所以不从 HTML 里提取：避免把代码块内的 "#" 也算进来。
 */
export function extractToc(markdown: string): TocItem[] {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, "");
  const lines = withoutCode.split(/\r?\n/);
  const toc: TocItem[] = [];

  for (const line of lines) {
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;
    const text = match[2].replace(/[*_`]/g, "").trim();
    const id = slugifyHeader(text);
    if (!id) continue;
    toc.push({ id, text, depth: match[1].length });
  }
  return toc;
}

/** 估算中文阅读时长（分钟） */
export function estimateReadingMinutes(markdown: string): number {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*`_\-]/g, " ");
  const cjk = (plain.match(/[\u4e00-\u9fff\u3040-\u30ff]/g) || []).length;
  const words = (plain.match(/[A-Za-z0-9]+/g) || []).length;
  return Math.max(1, Math.round(cjk / 400 + words / 220));
}
