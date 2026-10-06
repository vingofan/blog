/**
 * 新建文章脚手架
 * ------------------------------------------------------------------
 * 用法：
 *   npm run new-post -- "文章标题" my-english-slug
 *   npm run new-post -- "文章标题" my-slug --tags 风光,曝光 --category landscape
 *   npm run new-post -- "文章标题" my-slug --section dream
 *   npm run new-post -- "文章标题" my-slug --date 2026-10-01 --draft
 *
 * 可选参数：
 *   --slug <slug>      URL 用的英文 slug（也可作为第二个位置参数）
 *   --date YYYY-MM-DD  默认今天
 *   --tags 标签A,标签B
 *   --category 分类id   默认 landscape（仅影响占位图配色）
 *   --section 板块      writing（默认）/ dream / photography
 *   --cover 路径        默认 /images/covers/<slug>.svg
 *   --draft            生成但不上线（frontmatter 里 draft: true）
 *   --force            同名文件已存在时覆盖
 *
 * npm script 里串了 generate-placeholders.mjs，所以封面占位图会自动生成。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(root, "content", "posts");
const TEMPLATE = path.join(root, "content", "templates", "post-template.md");

/** YAML 双引号字符串：转义反斜杠与双引号 */
const q = (s) => `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
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
  return { positional, flags };
}

const { positional, flags } = parseArgs(process.argv.slice(2));

const title = positional[0] || flags.title;
const slug = flags.slug || positional[1];

if (!title || !slug) {
  console.error(
    [
      "用法：npm run new-post -- \"文章标题\" my-english-slug [选项]",
      "",
      "示例：npm run new-post -- \"西湖蓝调时刻\" westlake-blue-hour --tags 风光,蓝调时刻",
      "",
      "slug 必须是小写字母/数字/连字符，它会直接决定文章 URL（/blog/<slug>）。",
    ].join("\n")
  );
  process.exit(1);
}

if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error(`slug 不合法：${slug}\n只能包含小写字母、数字和连字符，例如 westlake-blue-hour`);
  process.exit(1);
}

const date = flags.date || today();
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error(`日期格式应为 YYYY-MM-DD，收到：${date}`);
  process.exit(1);
}

const tags = String(flags.tags || "未分类")
  .split(/[,，]/)
  .map((t) => t.trim())
  .filter(Boolean);

const category = flags.category || "landscape";
const cover = flags.cover || `/images/covers/${slug}.svg`;
const draft = Boolean(flags.draft);
const author = flags.author || "林夕";

// 板块：writing（写字的地方）/ dream（白日梦）/ photography（摄影笔记）
const SECTIONS = new Set(["writing", "dream", "photography"]);
const section = SECTIONS.has(flags.section) ? flags.section : "writing";
if (flags.section && !SECTIONS.has(flags.section)) {
  console.warn(
    `未知板块：${flags.section}，已按 writing 处理。可选：writing / dream / photography`
  );
}

fs.mkdirSync(POSTS_DIR, { recursive: true });

const fileName = `${date}-${slug}.md`;
const outPath = path.join(POSTS_DIR, fileName);

if (fs.existsSync(outPath) && !flags.force) {
  console.error(`已存在同名文件：content/posts/${fileName}\n加 --force 覆盖，或换个 slug。`);
  process.exit(1);
}

const frontmatter = [
  "---",
  `title: ${q(title)}`,
  `date: ${q(date)}`,
  `excerpt: ${q("一句话摘要，显示在列表、搜索结果和分享卡片上。")}`,
  `cover: ${q(cover)}`,
  `coverAlt: ${q("封面图的替代文本")}`,
  `category: ${q(category)}`,
  `section: ${q(section)}`,
  `tags: [${tags.map(q).join(", ")}]`,
  `draft: ${draft ? "true" : "false"}`,
  `author: ${q(author)}`,
  "---",
  "",
].join("\n");

// 若模板存在，正文部分沿用模板的说明区块，方便第一次上手
let body = [
  "## 小标题会自动生成锚点，并在右侧生成目录",
  "",
  "正文段落。",
  "",
  `![替代文本](/images/photos/landscape-westlake-blue-hour.svg "引号里的文字会自动变成图注")`,
  "",
].join("\n");

if (fs.existsSync(TEMPLATE)) {
  const tpl = fs.readFileSync(TEMPLATE, "utf8");
  const tplBody = tpl.replace(/^---[\s\S]*?\n---\n?/, "");
  body = tplBody;
}

fs.writeFileSync(outPath, frontmatter + body, "utf8");

// 顺带把封面占位图生成出来（幂等，已存在会覆盖）
// 注意：npm run 会把它自己的参数追加到整条 script 末尾，
// 所以这里不能在 package.json 里用 && 串接生成器，只能在脚本内部调用。
if (cover.endsWith(".svg")) {
  try {
    const { execFileSync } = await import("node:child_process");
    execFileSync(process.execPath, [path.join(__dirname, "generate-placeholders.mjs")], {
      cwd: root,
      stdio: "ignore",
    });
  } catch {
    // 占位图生成失败不影响建文章，提示一下即可
    console.warn("（封面占位图未自动生成，可手动执行 npm run placeholders）");
  }
}

console.log(
  [
    "",
    `✅ 已创建：content/posts/${fileName}`,
    "",
    `   标题     ${title}`,
    `   板块     ${section}（writing=写字的地方 / dream=白日梦 / photography=摄影笔记）`,
    `   访问地址 /blog/${slug}`,
    `   封面图   ${cover}（占位图会自动生成）`,
    `   标签     ${tags.join(" / ")}`,
    `   状态     ${draft ? "草稿（draft: true，不会上线）" : "已发布（draft: false）"}`,
    "",
    "接下来：",
    "  1. 编辑这个文件，补正文和图片",
    "  2. npm run dev 打开 http://localhost:3000 预览（改完即时生效，不用重启）",
    draft ? "  3. 确认没问题后把 draft 改成 false" : "  3. 确认没问题后跟助理说「同步到线上」",
    "",
  ].join("\n")
);
