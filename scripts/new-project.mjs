/**
 * 新建项目脚手架（好玩的项目板块）
 * ------------------------------------------------------------------
 * 用法：
 *   npm run new-project -- "项目名" my-slug --tagline "一句话简介"
 *   npm run new-project -- "项目名" my-slug --status 进行中 --year 2026 --tags 工具,AI
 *   npm run new-project -- "项目名" my-slug --stack Next.js,Tailwind --link 演示 https://x.com
 *
 * 可选参数：
 *   --tagline 一句话简介（卡片正面显示）
 *   --status 进行中 | 已完成 | 搁置（默认 进行中）
 *   --year 2026 / 2025-2026（默认今年）
 *   --tags 标签A,标签B
 *   --stack 技术A,技术B
 *   --link "链接名 https://..."（可重复传多次）
 *   --cover /images/...（可选封面）
 *   --body "Markdown 正文"（可选，也可以之后直接编辑 JSON）
 *   --featured 首页精选
 *   --force 同名 id 已存在时覆盖
 *
 * 写的是 content/projects.json，详情页路由 /projects/<slug>。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const FILE = path.join(root, "content", "projects.json");

const STATUSES = new Set(["进行中", "已完成", "搁置"]);

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  const links = [];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--link") {
      const value = argv[i + 1];
      if (value && !value.startsWith("--")) {
        const idx = value.indexOf(" ");
        if (idx > 0) {
          links.push({ label: value.slice(0, idx), href: value.slice(idx + 1).trim() });
        } else {
          links.push({ label: "链接", href: value });
        }
        i += 1;
      }
      continue;
    }
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) {
        flags[key] = true;
      } else {
        flags[key] = next;
        i += 1;
      }
    } else {
      positional.push(a);
    }
  }
  return { positional, flags, links };
}

const { positional, flags, links } = parseArgs(process.argv.slice(2));

const name = positional[0] || flags.name;
const id = flags.slug || positional[1];

if (!name || !id) {
  console.error(
    [
      '用法：npm run new-project -- "项目名" my-slug --tagline "一句话简介"',
      "",
      '示例：npm run new-project -- "照片水印工具" watermark --tagline 批量给照片加水印的小脚本 --status 进行中',
      "",
      "slug 必须是小写字母/数字/连字符，它决定 URL：/projects/<slug>",
    ].join("\n")
  );
  process.exit(1);
}

if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
  console.error(`slug 不合法：${id}\n只能包含小写字母、数字和连字符，例如 watermark-tool`);
  process.exit(1);
}

const list = JSON.parse(fs.readFileSync(FILE, "utf8"));
if (!Array.isArray(list)) {
  console.error("content/projects.json 不是一个数组，已停止。");
  process.exit(1);
}

const existing = list.findIndex((p) => p.id === id);
if (existing >= 0 && !flags.force) {
  console.error(`已存在同名项目：${id}\n加 --force 覆盖，或换个 slug。`);
  process.exit(1);
}

const status = STATUSES.has(flags.status) ? flags.status : "进行中";
if (flags.status && !STATUSES.has(flags.status)) {
  console.warn(`未知状态：${flags.status}，已按「进行中」处理。可选：进行中 / 已完成 / 搁置`);
}

const split = (v, fallback = []) =>
  v
    ? String(v)
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : fallback;

const project = {
  id,
  name,
  tagline: flags.tagline || "一句话说明这个项目是干什么的。",
  status,
  year: flags.year || String(new Date().getFullYear()),
  tags: split(flags.tags, ["未分类"]),
  ...(flags.stack ? { stack: split(flags.stack) } : {}),
  ...(links.length ? { links } : {}),
  ...(flags.cover ? { cover: flags.cover } : {}),
  ...(flags.body ? { body: String(flags.body).replace(/\\n/g, "\n") } : { body: "" }),
  ...(flags.featured ? { featured: true } : {}),
};

if (existing >= 0) list[existing] = project;
else list.push(project);

fs.writeFileSync(FILE, `${JSON.stringify(list, null, 2)}\n`, "utf8");

console.log(
  [
    "",
    `✅ 已${existing >= 0 ? "更新" : "创建"}：content/projects.json → ${id}`,
    "",
    `   名称     ${project.name}`,
    `   访问地址 /projects/${id}`,
    `   状态     ${project.status} · ${project.year}`,
    `   标签     ${project.tags.join(" / ")}`,
    project.links?.length ? `   链接     ${project.links.map((l) => l.label).join(" / ")}` : null,
    "",
    "接下来：",
    "  1. 编辑 content/projects.json，把 tagline 和 body（Markdown）补完整",
    "  2. npm run dev 打开 http://localhost:3000/projects 预览",
    "",
  ]
    .filter(Boolean)
    .join("\n")
);
