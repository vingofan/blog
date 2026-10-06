/**
 * 占位图生成器
 * ------------------------------------------------------------------
 * 作用：根据 content/photos.json 与 content/posts/*.md 的 frontmatter，
 * 在 public/images 下自动生成 SVG 占位图。
 *
 * 用法：npm run placeholders
 *
 * 替换成真实照片时：
 *   1. 把你的 jpg/webp 按相同文件名放进 public/images/photos/（覆盖同名 svg）
 *      或改成新文件名后同步修改 photos.json 里的 src / width / height；
 *   2. 重新运行 npm run placeholders 即可补全缺失文件。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const PHOTOS_JSON = path.join(root, "content", "photos.json");
const POSTS_DIR = path.join(root, "content", "posts");
const PUBLIC_DIR = path.join(root, "public");

/** 每个分类一组配色，保证占位图之间可区分 */
const PALETTES = {
  portrait: ["#3f2a2f", "#8d5b52", "#d9a08c"],
  landscape: ["#0f2a33", "#1f6678", "#79bcc4"],
  street: ["#241a33", "#4b2c6b", "#b58ad9"],
  architecture: ["#1b1f24", "#404b57", "#93a6b8"],
  default: ["#1a1a1a", "#3d3d3d", "#9a9a9a"],
};

const escapeXml = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/**
 * @param {string} file  public 下的相对路径，如 /images/photos/a.svg
 * @param {object} opts
 */
function writePlaceholder(file, opts) {
  const { width, height, label, title, palette = "default", id } = opts;
  const outPath = path.join(PUBLIC_DIR, file.replace(/^\//, ""));
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const [c1, c2, c3] = PALETTES[palette] || PALETTES.default;
  const short = Math.min(width, height);
  const gradientId = `g-${id}`;
  const noiseId = `n-${id}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(title || label)}">
  <defs>
    <linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="55%" stop-color="${c2}"/>
      <stop offset="100%" stop-color="${c3}"/>
    </linearGradient>
    <filter id="${noiseId}" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#${gradientId})"/>
  <rect width="100%" height="100%" filter="url(#${noiseId})" opacity="0.07"/>
  <g fill="#ffffff" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC, Microsoft YaHei, sans-serif">
    <text x="50%" y="${height / 2 - short * 0.03}" font-size="${Math.round(short * 0.055)}" font-weight="600" letter-spacing="${Math.round(short * 0.012)}" opacity="0.92">${escapeXml(label)}</text>
    <text x="50%" y="${height / 2 + short * 0.035}" font-size="${Math.round(short * 0.036)}" opacity="0.65">${escapeXml(title)}</text>
  </g>
  <text x="50%" y="${height - Math.round(short * 0.045)}" fill="#ffffff" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="${Math.round(short * 0.026)}" opacity="0.45">PLACEHOLDER ${width}x${height}</text>
</svg>
`;

  fs.writeFileSync(outPath, svg, "utf8");
  return outPath;
}

/** 极简 frontmatter 解析（只取 YAML 顶层 key: value 与数组） */
function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  if (!match) return {};
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line);
    if (!kv) continue;
    let value = kv[2].trim().replace(/^["']|["']$/g, "");
    if (value.startsWith("[") && value.endsWith("]")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    }
    data[kv[1]] = value;
  }
  return data;
}

let created = 0;

// 1) 作品图
const photos = JSON.parse(fs.readFileSync(PHOTOS_JSON, "utf8"));
for (const photo of photos) {
  if (!photo.src || !photo.src.endsWith(".svg")) continue;
  const out = writePlaceholder(photo.src, {
    width: photo.width,
    height: photo.height,
    label: photo.categoryLabel || photo.category,
    title: photo.title,
    palette: photo.category,
    id: photo.id,
  });
  if (out) created += 1;
}

// 2) 文章封面
if (fs.existsSync(POSTS_DIR)) {
  for (const name of fs.readdirSync(POSTS_DIR)) {
    if (!name.endsWith(".md")) continue;
    const fm = parseFrontmatter(fs.readFileSync(path.join(POSTS_DIR, name), "utf8"));
    if (!fm.cover || !fm.cover.endsWith(".svg")) continue;
    const out = writePlaceholder(fm.cover, {
      width: 1600,
      height: 900,
      label: typeof fm.category === "string" ? fm.category.toUpperCase() : "COVER",
      title: fm.title || name,
      palette: fm.category || "default",
      id: name.replace(/\.md$/, ""),
    });
    if (out) created += 1;
  }
}

// 3) 头像
writePlaceholder("/images/avatar.svg", {
  width: 800,
  height: 800,
  label: "AVATAR",
  title: "替换为你的照片",
  palette: "default",
  id: "avatar",
});

console.log(`[placeholders] 已生成/更新 ${created} 张占位图 + 头像`);
