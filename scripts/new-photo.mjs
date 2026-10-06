/**
 * 新增作品脚手架
 * ------------------------------------------------------------------
 * 两种用法：
 *
 * 1) 单张：连图片带元数据一起建（不指定 --file 就先生成占位图）
 *    npm run new-photo -- add "窗边的下午" window-afternoon \
 *      --category portrait --tags 人像,自然光 \
 *      --caption "下午三点的西晒" --location "杭州 · 馒头山" \
 *      --camera "Sony A7 IV" --lens "85mm F1.4" --settings "f/1.8 1/200 ISO200" \
 *      --ratio 2:3 --featured
 *
 * 2) 批量导入已有照片（shell 负责展开通配符）
 *    npm run new-photo -- import ~/Desktop/西湖/*.jpg --category landscape --tags 风光,西湖
 *
 * 通用参数：
 *   --file <路径>      复制这张图进 public/images/photos/ 并自动读取真实宽高
 *   --category <id>    必须存在于 content/categories.json
 *   --tags A,B         标签，逗号分隔
 *   --date YYYY-MM-DD  默认今天
 *   --ratio W:H        占位图比例，默认 3:2（仅无 --file 时生效）
 *   --featured         加入首页首屏轮播
 *   --force            同名 id 已存在时覆盖
 *
 * 脚本会自动追加到 content/photos.json，并按需生成占位图。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const PHOTOS_JSON = path.join(root, "content", "photos.json");
const CATEGORIES_JSON = path.join(root, "content", "categories.json");
const PHOTOS_DIR = path.join(root, "public", "images", "photos");

/* ---------------- 参数解析 ---------------- */

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  const multi = new Set(["file"]);
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) {
        flags[key] = true;
      } else {
        if (multi.has(key)) (flags[key] ??= []).push(next);
        else flags[key] = next;
        i += 1;
      }
    } else {
      positional.push(a);
    }
  }
  return { positional, flags };
}

function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/* ---------------- 读取图片真实尺寸（避免瀑布流布局跳动） ---------------- */

/**
 * 从 JPEG 的 APP1/EXIF 段读 orientation（1..8），读不到返回 null。
 * payloadStart 指向 APP1 段长度字段之后的载荷起始处。
 */
function exifOrientation(buf, payloadStart) {
  if (payloadStart + 6 > buf.length) return null;
  if (buf.toString("ascii", payloadStart, payloadStart + 6) !== "Exif\0\0") return null;
  const tiff = payloadStart + 6;
  if (tiff + 8 > buf.length) return null;
  const little = buf.toString("ascii", tiff, tiff + 2) === "II";
  const u16 = (o) => (little ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
  const u32 = (o) => (little ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
  const ifd = tiff + u32(tiff + 4);
  if (ifd + 2 > buf.length) return null;
  const count = u16(ifd);
  for (let e = 0; e < count; e += 1) {
    const entry = ifd + 2 + e * 12;
    if (entry + 10 > buf.length) return null;
    if (u16(entry) === 0x0112) return u16(entry + 8);
  }
  return null;
}

function imageSize(buf) {
  // PNG
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // JPEG —— 宽高要按 EXIF orientation 换算，否则记录的是存储方向、浏览器显示的是旋转后方向
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    let orientation = 1;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) {
        i += 1;
        continue;
      }
      const marker = buf[i + 1];
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        i += 2;
        continue;
      }
      const len = buf.readUInt16BE(i + 2);
      if (marker === 0xe1 && orientation === 1) {
        orientation = exifOrientation(buf, i + 4) ?? orientation;
      }
      const isSOF = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
      if (isSOF) {
        let width = buf.readUInt16BE(i + 7);
        let height = buf.readUInt16BE(i + 5);
        if (orientation >= 5 && orientation <= 8) {
          [width, height] = [height, width];
        }
        return { width, height };
      }
      i += 2 + len;
    }
    return null;
  }
  // WebP
  if (buf.length > 30 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const fourcc = buf.toString("ascii", 12, 16);
    if (fourcc === "VP8 ") {
      return {
        width: buf.readUInt16LE(26) & 0x3fff,
        height: buf.readUInt16LE(28) & 0x3fff,
      };
    }
    if (fourcc === "VP8L") {
      const bits = buf.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (fourcc === "VP8X") {
      return {
        width: (buf.readUIntLE(24, 3) & 0xffffff) + 1,
        height: (buf.readUIntLE(27, 3) & 0xffffff) + 1,
      };
    }
  }
  return null;
}

/* ---------------- 读写数据源 ---------------- */

const categories = JSON.parse(fs.readFileSync(CATEGORIES_JSON, "utf8"));
const categoryIds = new Set(categories.map((c) => c.id));

function readPhotos() {
  return JSON.parse(fs.readFileSync(PHOTOS_JSON, "utf8"));
}

function writePhotos(list) {
  fs.writeFileSync(PHOTOS_JSON, `${JSON.stringify(list, null, 2)}\n`, "utf8");
}

async function regeneratePlaceholders() {
  try {
    const { execFileSync } = await import("node:child_process");
    execFileSync(process.execPath, [path.join(__dirname, "generate-placeholders.mjs")], {
      cwd: root,
      stdio: "ignore",
    });
  } catch {
    console.warn("（占位图未自动生成，可手动执行 npm run placeholders）");
  }
}

/* ---------------- 主流程 ---------------- */

const { positional, flags } = parseArgs(process.argv.slice(2));
const command = positional[0];

const usage = [
  "",
  "用法：",
  "  npm run new-photo -- add \"标题\" slug --category portrait --tags 人像,自然光 [--file ~/a.jpg]",
  "  npm run new-photo -- import ~/Desktop/*.jpg --category landscape --tags 风光",
  "",
  "分类可选：" + categories.map((c) => c.id).join(" / "),
  "",
].join("\n");

if (!command || !["add", "import"].includes(command)) {
  console.error(usage);
  process.exit(1);
}

const category = flags.category || categories[0].id;
if (!categoryIds.has(category)) {
  console.error(`分类不存在：${category}\n可选：${[...categoryIds].join(" / ")}`);
  process.exit(1);
}

const tags = String(flags.tags || "")
  .split(/[,，]/)
  .map((t) => t.trim())
  .filter(Boolean);
const date = flags.date || today();
const featured = Boolean(flags.featured);
const force = Boolean(flags.force);

fs.mkdirSync(PHOTOS_DIR, { recursive: true });

const photos = readPhotos();
const existingIds = new Set(photos.map((p) => p.id));
const added = [];

/** 把一条作品写入 JSON（id 重复时按 force 处理） */
function pushEntry(entry) {
  if (existingIds.has(entry.id)) {
    if (!force) {
      console.warn(`⚠️  跳过（id 已存在）：${entry.id}   加 --force 覆盖，或换 slug`);
      return false;
    }
    const idx = photos.findIndex((p) => p.id === entry.id);
    photos[idx] = entry;
  } else {
    photos.unshift(entry);
    existingIds.add(entry.id);
  }
  added.push(entry);
  return true;
}

/** 复制图片到 public/images/photos/ 并读取真实尺寸 */
function importFile(file) {
  const src = path.resolve(file);
  if (!fs.existsSync(src)) {
    console.warn(`⚠️  跳过（文件不存在）：${file}`);
    return null;
  }
  const ext = path.extname(src).toLowerCase().replace(".", "") || "jpg";
  if (!["jpg", "jpeg", "png", "webp", "svg"].includes(ext)) {
    console.warn(`⚠️  跳过（不支持的格式）：${file}`);
    return null;
  }
  const base = path
    .basename(src, path.extname(src))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const destName = `${base}.${ext}`;
  fs.copyFileSync(src, path.join(PHOTOS_DIR, destName));

  let dims = null;
  if (ext !== "svg") {
    const buf = fs.readFileSync(src);
    dims = imageSize(buf.subarray(0, Math.min(buf.length, 65536)));
  } else {
    const m = /width="(\d+)"[\s\S]*?height="(\d+)"/.exec(fs.readFileSync(src, "utf8"));
    if (m) dims = { width: Number(m[1]), height: Number(m[2]) };
  }
  if (!dims) {
    console.warn(`⚠️  读不出尺寸：${file}，默认按 2400x1600 写入，请手动校正 photos.json`);
    dims = { width: 2400, height: 1600 };
  }
  return { id: base, src: `/images/photos/${destName}`, ...dims, title: base };
}

if (command === "add") {
  const title = positional[1];
  const slug = positional[2];
  if (!title || !slug) {
    console.error("add 需要标题和 slug：npm run new-photo -- add \"标题\" slug");
    process.exit(1);
  }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    console.error(`slug 不合法：${slug}（只能小写字母/数字/连字符）`);
    process.exit(1);
  }

  let src;
  let width;
  let height;

  if (flags.file) {
    const imported = importFile(Array.isArray(flags.file) ? flags.file[0] : flags.file);
    if (!imported) process.exit(1);
    // 用 slug 作为最终文件名，避免原文件名不合规范
    const ext = path.extname(imported.src);
    const finalName = `${slug}${ext}`;
    if (imported.src !== `/images/photos/${finalName}`) {
      fs.renameSync(
        path.join(PHOTOS_DIR, path.basename(imported.src)),
        path.join(PHOTOS_DIR, finalName)
      );
    }
    src = `/images/photos/${finalName}`;
    width = imported.width;
    height = imported.height;
  } else {
    // 没有图片：按 --ratio 生成占位图，之后用同名文件覆盖即可
    const [rw, rh] = String(flags.ratio || "3:2").split(":").map(Number);
    if (!rw || !rh) {
      console.error("--ratio 格式应为 W:H，例如 2:3");
      process.exit(1);
    }
    const long = Number(flags.long) || 2400;
    width = rw >= rh ? long : Math.round((long * rw) / rh);
    height = rw >= rh ? Math.round((long * rh) / rw) : long;
    src = `/images/photos/${slug}.svg`;
  }

  pushEntry({
    id: slug,
    title,
    category,
    src,
    width,
    height,
    alt: flags.alt || title,
    caption: flags.caption || "",
    location: flags.location || "",
    camera: flags.camera || "",
    lens: flags.lens || "",
    settings: flags.settings || "",
    date,
    tags,
    featured,
  });
} else {
  // import：positional[1..] 为文件列表（shell 已展开通配符）
  const files = positional.slice(1);
  const fileFlags = flags.file ? (Array.isArray(flags.file) ? flags.file : [flags.file]) : [];
  const all = [...files, ...fileFlags];
  if (!all.length) {
    console.error("import 需要至少一个文件路径");
    process.exit(1);
  }
  for (const file of all) {
    const imported = importFile(file);
    if (!imported) continue;
    pushEntry({
      id: imported.id,
      title: flags.title || imported.id,
      category,
      src: imported.src,
      width: imported.width,
      height: imported.height,
      alt: flags.alt || imported.id,
      caption: "待补充：一句话说明",
      location: flags.location || "",
      camera: flags.camera || "",
      lens: flags.lens || "",
      settings: flags.settings || "",
      date,
      tags,
      featured,
    });
  }
}

if (!added.length) {
  console.error("没有新增任何作品。");
  process.exit(1);
}

writePhotos(photos);
await regeneratePlaceholders();

console.log(
  [
    "",
    `✅ 已写入 ${added.length} 条到 content/photos.json`,
    "",
    ...added.map(
      (p) =>
        `   ${p.id}\n` +
        `     标题   ${p.title}\n` +
        `     图片   ${p.src}  (${p.width}×${p.height})\n` +
        `     分类   ${p.category}${p.featured ? "  ★ 首页轮播" : ""}`
    ),
    "",
    "接下来：",
    "  1. 打开 content/photos.json 补 caption（图注）/ location / camera / lens / settings",
    "  2. 若用的是占位图，把同名照片覆盖进 public/images/photos/，再把 src 的 .svg 改成实际后缀",
    "  3. npm run dev 预览：改完即时生效，不用重启",
    "  4. 确认后跟助理说「同步到线上」",
    "",
  ].join("\n")
);
