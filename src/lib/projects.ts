/**
 * 项目数据源
 * ------------------------------------------------------------------
 * 唯一数据源：content/projects.json
 * 新增项目 = 往 JSON 里加一条（或用 npm run new-project）。
 */
import projectsJson from "../../content/projects.json";

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

export function getAllProjectIds(): string[] {
  return projects.map((p) => p.id);
}

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

/** 首页精选项目 */
export function getFeaturedProjects(limit = 3): Project[] {
  const featured = projects.filter((p) => p.featured);
  return (featured.length ? featured : projects).slice(0, limit);
}

/** 项目用到的全部标签（去重） */
export function getAllProjectTags(): string[] {
  return Array.from(new Set(projects.flatMap((p) => p.tags)));
}

export function getProjectCounts(): Record<string, number> {
  const counts: Record<string, number> = { all: projects.length };
  for (const s of ["进行中", "已完成", "搁置"] as const) {
    counts[s] = projects.filter((p) => p.status === s).length;
  }
  return counts;
}
