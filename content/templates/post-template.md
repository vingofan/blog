---
title: "把标题写在这里"
date: "2026-10-01"
updated: "2026-10-01"
excerpt: "一句话摘要，显示在文章列表、搜索结果和社交分享卡片上。"
description: "可选的 SEO 描述，不写就自动沿用 excerpt。"
cover: "/images/covers/blue-hour-westlake.svg"
coverAlt: "封面图的替代文本，读屏和 SEO 都要用"
category: "landscape"
section: "article"
tags: ["标签一", "标签二"]
draft: true
author: "林夕"
readingTime: 5
---

## 小标题会自动生成锚点，并在右侧生成目录

正文段落。中文引号在正文里随便用，**只有 frontmatter 里的 `excerpt` / `description`
才需要避开英文双引号**（要用就写「」）。

![替代文本](/images/photos/landscape-westlake-blue-hour.svg "引号里的这段文字会自动变成图片下方的图注")

### 列表

- 第一点
- 第二点

### 引用

> 引用块会渲染成左侧带竖线的样式。

### 表格（移动端可横向滚动）

| 项目 | 说明 |
| --- | --- |
| 光圈 | f/8 |
| 快门 | 8s |

### 代码块

```text
行内代码用 `code`，代码块用三个反引号
```

---

> **写完记得做三件事**
> 1. 把文件名改成 `YYYY-MM-DD-你的-slug.md` 并放进 `content/posts/`
> 2. 确认 `section` 写对了：`article`=文章、`photography`=摄影笔记（挂在摄影页下）
> 3. 把上面的 `draft: true` 改成 `draft: false`（或删掉这一行），否则文章不会上线
