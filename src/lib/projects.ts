/**
 * 项目数据源
 * ------------------------------------------------------------------
 * 唯一数据源：content/projects.json
 * Skills 和产品两个板块共用这一份数据，靠每条的 kind 字段区分（skill / product，不写算 product）。
 * 新增 = 往 JSON 里加一条（或用 npm run new-project -- ... --kind skill）。
 */
import projectsJson from "../../content/projects.json";

import { WORK_PATH, type WorkKind } from "@/config/sections";
import type { Project } from "./types";

const STATUS_ORDER: Record<string, number> = {
  进行中: 0,
  已完成: 1,
  搁置: 2,
};

/** 全部项目：进行中优先，其次按年份倒序 */
export const projects: Project[] = (
  projectsJson as unknown as Project[]
)
  .slice()
  .sort((a, b) => {
    const sa = STATUS_ORDER[a.status] ?? 9;
    const sb = STATUS_ORDER[b.status] ?? 9;
    if (sa !== sb) return sa - sb;
    return a.year < b.year ? 1 : a.year > b.year ? -1 : 0;
  });

/** 一条内容属于哪个板块：没写 kind 的算产品 */
export function kindOf(project: Project): WorkKind {
  return project.kind === "skill" ? "skill" : "product";
}

/** 详情页地址：Skills 在 /skills/<id>，产品在 /products/<id> */
export function workUrl(project: Project): string {
  return `${WORK_PATH[kindOf(project)]}/${project.id}`;
}

/** 某个板块（Skills / 产品）的全部内容 */
export function getWorks(kind: WorkKind): Project[] {
  return projects.filter((p) => kindOf(p) === kind);
}

export function getWork(kind: WorkKind, id: string): Project | undefined {
  return getWorks(kind).find((p) => p.id === id);
}

/** 首页精选：标了 featured 的优先，没有就取前几条 */
export function getFeaturedWorks(kind: WorkKind, limit = 3): Project[] {
  const all = getWorks(kind);
  const featured = all.filter((p) => p.featured);
  return (featured.length ? featured : all).slice(0, limit);
}

/** 某个板块里各状态的数量 */
export function getWorkCounts(kind: WorkKind): Record<string, number> {
  const all = getWorks(kind);
  const counts: Record<string, number> = { all: all.length };
  for (const s of ["进行中", "已完成", "搁置"] as const) {
    counts[s] = all.filter((p) => p.status === s).length;
  }
  return counts;
}
