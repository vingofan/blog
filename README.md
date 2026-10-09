# 林夕相心

一个个人博客，四个内容板块：**摄影**（作品集）、**Skills**（教给 AI 的技能包）、**产品**（做出来能用的东西）、**文章**（写下来的字）。
顶栏导航：首页 · 摄影 · Skills · 产品 · 文章 · 关于我。
深色极简排版 + 低饱和科技感细节；文章用本地 Markdown 写作，作品与项目用 JSON 管理。

**在线地址**：<https://vingoo.app.workbuddy.host/>
**仓库**：<https://github.com/vingofan/blog>

**技术栈**：Next.js（App Router）· React · TypeScript · Tailwind CSS v4
**无数据库、无 CMS**：所有内容都是仓库里的文件，改完提交即可。

| 板块 | 路由 | 内容来源 |
| --- | --- | --- |
| 摄影 | `/gallery` | `content/photos.json`（+ `section: photography` 的摄影笔记） |
| Skills | `/skills` | `content/projects.json` 里 `kind: "skill"` 的条目 |
| 产品 | `/products` | `content/projects.json` 里 `kind: "product"`（或没写 kind）的条目 |
| 文章 | `/blog` | `content/posts/*.md`（`section: article`，不写也算） |

旧地址 `/projects`、`/writing`、`/dreams` 会跳到新位置（见 `next.config.ts`）；`/archive` 已删除。

---

## 快速开始

```bash
git clone https://github.com/vingofan/blog.git
cd blog
npm install
npm run dev          # http://localhost:3000
```

首次运行若 `public/images` 下没有图片，执行：

```bash
npm run placeholders # 生成全部占位图（23 张 + 头像）
```

其他命令：

npm run new-post     # 新建文章（见下方用法）
npm run new-photo    # 新增作品（见下方用法）
npm run build        # 生产构建
npm start            # 启动构建产物
npm run lint         # TypeScript 类型检查
npm run placeholders # 重新生成占位图
```

`npm run new-post` 完整用法：

```bash
npm run new-post -- "西湖蓝调时刻" westlake-blue-hour --tags 风光,蓝调时刻

# 可选参数
#   --tags 标签A,标签B        逗号分隔
#   --category landscape      分类，只影响占位图配色
#   --section article         板块：article（文章）/ photography（摄影笔记），默认 article
#   --date 2026-10-01         默认今天
#   --draft                   建为草稿，不上线
#   --force                   覆盖同名文件
```

`npm run new-photo` 完整用法（两种模式）：

```bash
# 模式一：单张，连元数据一起写（不给 --file 就先生成占位图）
npm run new-photo -- add "窗边的下午" window-afternoon \
  --category portrait --tags 人像,自然光 \
  --caption "下午三点的西晒" --location "杭州 · 馒头山" \
  --camera "Sony A7 IV" --lens "85mm F1.4" --settings "f/1.8 1/200 ISO200" \
  --ratio 2:3 --featured

# 模式二：批量导入已有照片（shell 负责展开通配符，自动读取真实宽高）
npm run new-photo -- import ~/Desktop/西湖/*.jpg --category landscape --tags 风光,西湖

# 通用参数
#   --file <路径>     复制这张图进来并自动读真实宽高（支持 jpg/png/webp/svg）
#   --category <id>   必须存在于 content/categories.json
#   --ratio W:H       占位图比例，默认 3:2
#   --featured        加入首页首屏轮播
#   --force           同名 id 已存在时覆盖
```

两种模式都会自动写进 `content/photos.json`，并按需要生成占位图。
`width` / `height` 会自动从图片文件里读出（JPEG / PNG / WebP 都支持），
这两个值用于瀑布流占位，直接决定图片加载时会不会跳动。

`npm run new-project` 完整用法：

```bash
npm run new-project -- "项目名" my-slug \
  --tagline "一句话简介" --status 进行中 --year 2026 \
  --tags 工具,AI --stack Next.js,Tailwind --link 演示 https://example.com

# 可选参数
#   --status 进行中 / 已完成 / 搁置（默认 进行中）
#   --year 2026 / 2025-2026       默认今年
#   --stack 技术A,技术B
#   --link "链接名 https://..."    可重复传
#   --body "Markdown 正文"         \n 表示换行
#   --featured / --force
```

写进 `content/projects.json`。加 `--kind skill` 进 Skills 板块（`/skills/<slug>`），不加或 `--kind product` 进产品板块（`/products/<slug>`）。
正文（body）支持 Markdown，写完在详情页里渲染。

---

## 更新内容：30 秒速查

不用改代码，也不用改任何配置文件——构建时会自动扫描这两个目录。

**发文章最快的方式**（一条命令，frontmatter + 封面占位图都自动生成）：

```bash
npm run new-post -- "文章标题" my-english-slug --tags 标签A,标签B
```

| 想做什么 | 怎么做 |
| --- | --- |
| 发一篇文章 | `npm run new-post -- "标题" slug --tags A,B`；或手工复制 `content/templates/post-template.md` → 改名 `YYYY-MM-DD-slug.md` → 放进 `content/posts/` → 把 `draft` 改成 `false` |
| 加一张作品 | `npm run new-photo -- add "标题" slug --category portrait --tags A,B`（`--file ~/a.jpg` 可带上照片） |
| 批量导入照片 | `npm run new-photo -- import ~/Desktop/*.jpg --category landscape --tags 风光` |
| 加一个产品 | `npm run new-project -- "产品名" slug --tagline 一句话简介` |
| 加一个 Skill | `npm run new-project -- "Skill 名" slug --kind skill --tagline 一句话简介` |
| 换掉占位图 | 同名文件覆盖进 `public/images/photos/`，再把 JSON 里对应的 `.svg` 改成 `.jpg` |
| 加/改分类 | 编辑 `content/categories.json` |
| 改站名、作者、导航 | 编辑 `src/config/site.ts` |
| 改板块（名称/顺序/说明） | 编辑 `src/config/sections.ts` |
| 同步到线上 | 跟助理说「同步到线上」重新发布一次（链接不变，覆盖线上内容） |

本地改完 `npm run dev` 会**即时生效**，不用重启（文章与搜索索引在开发模式下每次请求重新读取）。

---

## 目录结构

```
photo-blog/
├── content/                      ← 你只改这里的内容源
│   ├── posts/                    ← 文章（一个 .md 一篇）
│   │   └── 2026-09-18-westlake-blue-hour.md
│   └── templates/
│       └── post-template.md      ← 新文章模板（放这里不会被当成文章）
│   ├── photos.json               ← 作品数据（标题/分类/尺寸/EXIF…）
│   └── categories.json           ← 作品分类（人像/风光/街拍/建筑）
│
├── public/images/
│   ├── photos/                   ← 作品图
│   ├── covers/                   ← 文章封面图
│   └── avatar.svg                ← 头像
│
├── scripts/
│   └── generate-placeholders.mjs ← 占位图生成器
│
└── src/
    ├── app/                      ← 路由（每个文件夹一个页面）
    │   ├── page.tsx              首页
    │   ├── blog/                 文章列表 + [slug] 详情
    │   ├── skills/               Skills 列表 + [slug] 详情
    │   ├── products/             产品列表 + [slug] 详情
    │   ├── gallery/              作品集（分类筛选 + 灯箱）
    │   ├── tags/                 标签总览 + [tag] 结果页
    │   ├── search/               关键词搜索
    │   ├── about/                关于我
    │   ├── sitemap.ts            SEO：站点地图
    │   ├── robots.ts             SEO：robots 规则
    │   └── globals.css           全局样式与设计变量
    ├── components/               ← 可复用组件
    │   ├── HeroVideo.tsx          首页黑豹一镜到底视频
    │   ├── HeroLightning.tsx      首页闪电降临动效
    │   ├── GalleryStage.tsx       摄影页：左墙画框 + 右瀑布流
    │   ├── GalleryGrid.tsx        分类筛选 + 瀑布流
    │   ├── Lightbox.tsx           灯箱放大预览
    │   ├── LazyImage.tsx          懒加载图片（渐显 + 占位）
    │   ├── SearchPanel.tsx        即时搜索
    │   ├── PostCard.tsx           文章卡片
    │   ├── SiteHeader.tsx         导航（含移动端菜单）
    │   └── SiteFooter.tsx         页脚
    ├── lib/                      ← 数据读取与工具函数
    │   ├── posts.ts               文章读取 / 排序 / 标签 / 归档
    │   ├── photos.ts              作品读取 / 分类筛选
    │   ├── markdown.ts            Markdown → HTML（含图注、锚点）
    │   ├── search.ts              搜索索引构建（服务端）
    │   └── search-engine.ts       搜索匹配算法（客户端）
    └── config/site.ts            ← 站点信息（改这里改全站）
```

---

## 新增一篇文章

在 `content/posts/` 下新建一个 `.md` 文件，**文件名决定 URL**：

```
content/posts/2026-10-05-my-new-post.md
→ 访问地址 /blog/my-new-post
```

（文件名前缀必须是 `YYYY-MM-DD-`，日期只用于排序和显示。）

文件开头写 YAML frontmatter：

```markdown
---
title: "文章标题"
date: "2026-10-05"
updated: "2026-10-06"          # 可选
excerpt: "列表页和搜索结果里显示的摘要"
description: "用于 SEO 的描述"  # 可选，不填就用 excerpt
cover: "/images/covers/my-cover.jpg"
coverAlt: "封面图的替代文本"
category: "landscape"          # 仅用于占位图配色，不影响功能
tags: ["风光", "曝光"]
draft: false                   # true 则不上线
author: "林夕"                   # 可选
readingTime: 6                 # 可选，不填会按字数自动估算
---

正文开始…
```

**不需要改任何代码**，也不需要写配置文件——构建时会自动扫描这个目录。

> ⚠️ YAML 里的引号容易踩坑：frontmatter 的 `excerpt`、`description` 如果文本内部还要用引号，
> **请用中文引号「」而不是英文双引号**。`excerpt: "聊聊怎么读懂直方图上的"右侧溢出""` 会导致构建直接失败。

> 封面图缺失时可以自己造：`npm run placeholders` 会根据 frontmatter 里的 `cover` 字段补一张 SVG 占位图（前提是路径以 `.svg` 结尾）。

### 正文里的图片与图注

推荐写法（Markdown 原生语法，`""` 里的文字自动变成图注）：

```markdown
![替代文本](/images/photos/xxx.jpg "这里是显示在图片下方的说明文字")
```

渲染结果：

```html
<figure>
  <img src="…" alt="替代文本" loading="lazy" />
  <figcaption>这里是显示在图片下方的说明文字</figcaption>
</figure>
```

也可以直接手写 HTML，需要更复杂的布局时用这个：

```markdown
<figure>
  <img src="/images/photos/xxx.jpg" alt="替代文本" loading="lazy" />
  <figcaption>自定义说明</figcaption>
</figure>
```

其它支持的语法：标题（会自动生成锚点，二级标题还会在右侧生成目录）、加粗、列表、引用、代码块、表格（移动端可横向滚动）、链接。

---

## 新增一张作品

两步：

**1. 把图片放进** `public/images/photos/`

建议保持 2:3 / 3:2 / 1:1 等常见比例，长边 1600–2400px，导出质量控制在 200–500KB 比较合适。

**2. 在 `content/photos.json` 里加一条**

```json
{
  "id": "portrait-morning-coffee",         // 唯一标识，不重复即可
  "title": "早上的第一杯咖啡",
  "category": "portrait",                  // 必须存在于 categories.json
  "src": "/images/photos/portrait-morning-coffee.jpg",
  "width": 1600,                           // 真实像素宽，用于瀑布流占位，避免抖动
  "height": 2400,                          // 真实像素高
  "alt": "晨光里端着咖啡低头笑的侧影",      // 无障碍与 SEO 必需
  "caption": "窗解开了一条缝，光刚好落在杯沿上。",
  "location": "杭州 · 天目里",
  "camera": "Sony A7 IV",
  "lens": "85mm F1.4 GM",
  "settings": "f/1.8 · 1/200s · ISO 200",
  "date": "2026-10-02",
  "tags": ["人像", "自然光"],
  "featured": true                         // true 会出现在首页首屏轮播
}
```

`width` / `height` 一定要填真实值——它以 `aspect-ratio` 的形式占位，能彻底避免图片加载时的布局跳动。

### 直接用占位图替换真实照片

占位图的文件名和 `photos.json` 里的 `src` 是一一对应的。**把你的 jpg 按同名不同后缀放进去，然后把 JSON 里的 `.svg` 改成 `.jpg` 即可**：

```diff
- "src": "/images/photos/portrait-window-light.svg",
+ "src": "/images/photos/portrait-window-light.jpg",
```

如果你的照片比例和占位图不一致，记得同步改 `width` / `height`。

---

## 调整作品分类

编辑 `content/categories.json`：

```json
[
  { "id": "portrait",     "label": "人像", "description": "自然光下的人像练习。" },
  { "id": "landscape",    "label": "风光", "description": "山、海与天际线。" },
  { "id": "street",       "label": "街拍", "description": "街头没有剧本。" },
  { "id": "architecture", "label": "建筑", "description": "把结构压成几何。" }
]
```

改完同步确认 `photos.json` 里每条的 `category` 用的都是这里存在的 `id`。

---

## 修改站点信息与 SEO

**1. 站点名称、作者、导航、社交链接** — `src/config/site.ts`

**2. 域名（影响 canonical、sitemap、OG 图）** — 建一个 `.env.local`：

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

不设置的话默认用 `https://example.com`，上线前务必改掉。

**3. 页面标题与描述** — 每个页面里都有一个 `buildMetadata({...})` 调用，直接改即可：

```ts
export const metadata = buildMetadata({
  title: "作品集",
  description: "…",
  path: "/gallery",
});
```

每篇文章的 SEO 信息来自它自己的 frontmatter（`description` 或 `excerpt` + `cover` + `tags`）。

**已内置的 SEO/语义化能力**

- 每页独立的 `<title>` `<meta description>` `<meta keywords>` 与 `<link rel="canonical">`
- Open Graph / Twitter Card（`summary_large_image`，自动取封面图）
- 自动生成的 `/sitemap.xml` 与 `/robots.txt`
- `WebSite` + `BlogPosting` 结构化数据（JSON-LD）
- 语义化标签：`<header>` `<nav>` `<main>` `<article>` `<figure>` `<figcaption>` `<time datetime>` `<section>`
- `sr-only` 跳转链接、图片必填 `alt`、焦点可见样式、尊重 `prefers-reduced-motion`

---

## 视觉与交互说明

| 能力 | 实现位置 |
| --- | --- |
| 深色极简主题变量（配色/字体/容器宽度） | `src/app/globals.css` 的 `@theme` 段 |
| 首页黑豹视频 Hero（闪电降临 → 豹子亮出） | `components/HeroVideo.tsx` + `HeroLightning.tsx` |
| 摄影页左墙画框 + 右瀑布流舞台 | `components/GalleryStage.tsx` |
| 瀑布流（1/2/3/4 列自适应） | `globals.css` 的 `.masonry`，纯 CSS columns |
| 灯箱（← → 切换、Esc 关闭、`i` 切信息、触屏滑动） | `components/Lightbox.tsx` |
| 图片懒加载 + 骨架微光 + 渐显 | `components/LazyImage.tsx` |
| 分类筛选（选中态写入 URL，可分享） | `components/GalleryGrid.tsx` |
| 关键词即时搜索（标题/标签/正文加权） | `components/SearchPanel.tsx` + `lib/search-engine.ts` |
| 文章图文混排与图注 | `lib/markdown.ts` 的 figure 插件 |
| 文章右侧目录 | `lib/markdown.ts` 的 `extractToc` + 详情页 aside |

### 想换成 next/image？

现在刻意用了原生 `<img>`，因为占位图是 SVG（`next/image` 默认不处理 SVG），而且避免你在替换真实照片时被优化器的配置绊住。

换成真实 JPEG 之后，想启用自动 WebP/AVIF 压缩与响应式 srcset，只需在 `next.config.ts` 里把 `images.remotePatterns` 配好，再把 `LazyImage.tsx` / `Lightbox.tsx` / `GalleryStage.tsx` / `Logo.tsx` / `EmptyHint.tsx` 里的 `<img>` 换成 `<Image fill sizes="…" />` 即可，其余布局无需改动。

---

## 部署

**Vercel**：导入仓库即可，记得在环境变量里设置 `SITE_URL`（或 `NEXT_PUBLIC_SITE_URL`）。

**WorkBuddy 发布为应用**：项目根目录直接发布，语言选 `node`，端口 `3000`：

```bash
# 安装 + 构建
export SITE_URL=<发布后拿到的域名> && npm install && npx next build
# 启动
export SITE_URL=<发布后拿到的域名> && npx next start
```

`next start` 默认绑定 `0.0.0.0` 且读取 `PORT` 环境变量，无需额外参数。
`SITE_URL` 必须在**构建和启动两个阶段都注入**——`sitemap.xml` 在构建期生成，canonical 在渲染期读取。

> **注意**：发布是「覆盖式上传」，**不会删除本地已删掉的文件**。
> 所以如果你删过文章或图片，直接重新发布后线上仍会残留旧内容
> （因为旧的 `.md` 还在沙箱里，构建时被重新读进去）。
> 这种情况需要在构建前显式清理对应路径，清理完记得换回普通命令。

**自有服务器 / Docker**：

```bash
npm ci
npm run build
npm start          # 默认监听 3000
```

**静态导出**（Netlify / GitHub Pages / COS 等纯静态托管）：
由于 `/search` 与 `/gallery` 使用动态 searchParams，整站更适合跑 Node 服务。若确实要纯静态托管，把这两个页面改成客户端取 `window.location` 即可，其余页面天然支持 SSG。
