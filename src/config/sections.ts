/**
 * 四个内容板块的集中定义
 * ------------------------------------------------------------------
 * 首页入口卡、关于页都读这里。加板块 = 在这里加一条 + 给一个路由。
 * 数据来源：
 *   photography → content/photos.json
 *   skill / product → content/projects.json（按每一条的 kind 字段分；没写 kind 的算 product）
 *   article → content/posts/*.md
 * 顶栏的导航（含「首页」「关于我」这两个不算内容板块的入口）在 src/config/site.ts。
 */
export type SectionId = "photography" | "skill" | "product" | "article";

/** 文章归属的板块（写在 frontmatter 的 section 字段里）：摄影笔记挂在摄影页下，其余都是文章 */
export type PostSectionId = "photography" | "article";

/** projects.json 里一条内容属于哪个板块 */
export type WorkKind = "skill" | "product";

export interface SectionDef {
  id: SectionId;
  /** 展示名 */
  label: string;
  /** 英文小标，等宽字体呈现，用于科技感点缀 */
  code: string;
  /** 编号，如 01 */
  index: string;
  href: string;
  /** 一句话气质描述 */
  tagline: string;
  /** 板块首页用的说明 */
  description: string;
  /** 数量的单位，如「张」「篇」 */
  unit: string;
}

export const sections: SectionDef[] = [
  {
    id: "photography",
    label: "摄影",
    code: "PHOTOGRAPHY",
    index: "01",
    href: "/gallery",
    tagline: "光落在哪里，就拍哪里",
    description:
      "随手拍的那些。有的等了很久，有的只是路过时正好抬了一下头。器材不统一，风格也不统一，但都是当时真的站在那里的证据。",
    unit: "张",
  },
  {
    id: "skill",
    label: "Skills",
    code: "SKILLS",
    index: "02",
    href: "/skills",
    tagline: "教给 AI 的手艺",
    description:
      "写给 AI 用的技能包：把一件事怎么做好的步骤、参数和踩过的坑固定下来，下次直接调用，不用再从头讲一遍。",
    unit: "个",
  },
  {
    id: "product",
    label: "产品",
    code: "PRODUCTS",
    index: "03",
    href: "/products",
    tagline: "做出来，能用的",
    description:
      "做出来并且真的能用的东西：工具、插件、小应用，也包括一些做着玩的实验。有的还在长，有的已经定型。",
    unit: "个",
  },
  {
    id: "article",
    label: "文章",
    code: "ARTICLES",
    index: "04",
    href: "/blog",
    tagline: "写下来才算数",
    description:
      "正经写下来的东西。可能是复盘，可能是某件小事的完整来龙去脉，也可能只是想把一句话说清楚。不追热点，也不追更新频率。",
    unit: "篇",
  },
];

export function getSection(id: SectionId): SectionDef | undefined {
  return sections.find((s) => s.id === id);
}

/** Skills / 产品 两个板块各自的路由前缀 */
export const WORK_PATH: Record<WorkKind, string> = {
  skill: "/skills",
  product: "/products",
};
