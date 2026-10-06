/**
 * 四个板块的集中定义
 * ------------------------------------------------------------------
 * 首页入口、关于页、页脚都读这里。加板块 = 在这里加一条 + 给一个路由。
 * 注意：project 板块的内容来自 content/projects.json，
 * photography 来自 content/photos.json，writing / dream 来自 content/posts/*.md。
 */
export type SectionId = "photography" | "writing" | "dream" | "project";

/** 文章归属的板块（写在 frontmatter 的 section 字段里） */
export type PostSectionId = "photography" | "writing" | "dream";

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
  },
  {
    id: "writing",
    label: "写字的地方",
    code: "WRITING",
    index: "02",
    href: "/writing",
    tagline: "写下来才算数",
    description:
      "正经写下来的东西。可能是复盘，可能是某件小事的完整来龙去脉，也可能只是想把一句话说清楚。不追热点，也不追更新频率。",
  },
  {
    id: "dream",
    label: "白日梦",
    code: "DAYDREAM",
    index: "03",
    href: "/dreams",
    tagline: "还没发生，也没关系",
    description:
      "没实现的、不可能实现的、或者只是想想就很开心的。短的几句话，长的也可以写成一篇。这里没有 KPI。",
  },
  {
    id: "project",
    label: "好玩的项目",
    code: "PROJECTS",
    index: "04",
    href: "/projects",
    tagline: "没什么用，但很好玩",
    description:
      "做着玩的东西。有的是工具，有的是一次实验，有的做到一半就搁在那儿了——搁着也算一种状态。",
  },
];

export function getSection(id: SectionId): SectionDef | undefined {
  return sections.find((s) => s.id === id);
}
