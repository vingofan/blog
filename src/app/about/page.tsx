import type { Metadata } from "next";
import Link from "next/link";
import PageHeading from "@/components/PageHeading";
import { siteConfig, siteTagline } from "@/config/site";
import { sections } from "@/config/sections";
import { getPostsBySection } from "@/lib/posts";
import { photos } from "@/lib/photos";
import { projects } from "@/lib/projects";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "关于我",
  description: `${siteConfig.author}的个人站点${siteConfig.name}：摄影、写字、白日梦和好玩的项目，以及这个站点是怎么搭起来的。`,
  path: "/about",
});

const GEAR = [
  { label: "主力机身", value: "Panasonic DC-S5M2X" },
  { label: "备用机身", value: "SONY ILCE-6000" },
  { label: "口袋机", value: "iPhone 15 Pro Max" },
  { label: "最常用镜头", value: "20-60mm / 85mm" },
  { label: "后期软件", value: "Capture One + Lightroom Classic" },
];

const TIMELINE = [
  { year: "2021", text: "从胶片机开始拍照，第一台是二手的 FM2。" },
  { year: "2023", text: "开始认真做后期，也第一次给别人拍摄。" },
  { year: "2025", text: "在深圳安定下来，开始把拍照之外的事也记下来。" },
  { year: "2026", text: "把这个站点重做成四个角落：摄影、写字、白日梦、好玩的项目。" },
];

export default function AboutPage() {
  const counts: Record<string, number> = {
    photography: photos.length,
    writing: getPostsBySection("writing").length,
    dream: getPostsBySection("dream").length,
    project: projects.length,
  };

  return (
    <div className="container-page pt-14 sm:pt-20">
      <PageHeading
        eyebrow="关于我"
        title={`你好，我是${siteConfig.author}`}
        description={`${siteConfig.role}，常驻${siteConfig.location}。${siteTagline}`}
      />

      <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_320px] lg:gap-20">
        {/* 正文 */}
        <div className="prose-photo" data-reveal>
          <p>
            拍照是我最早开始做的事，但它慢慢变成生活里的一块，而不是全部。
            除了镜头，我还需要一个地方放写下来的字、没实现的想法，
            和那些做完也不指望有回报的小东西——所以这个站点现在是四个角落。
          </p>

          <h2 id="four-corners">四个角落</h2>
          <p>
            每个角落的更新节奏都不一样：照片攒够一批就发，文字想清楚了才写，
            白日梦随时记，项目则完全看心情。没有哪一块是主业。
          </p>
          <ul>
            {sections.map((s) => (
              <li key={s.id}>
                <strong>
                  <Link href={s.href}>{s.label}</Link>
                </strong>
                （{counts[s.id] ?? 0}）：{s.tagline}。{s.description}
              </li>
            ))}
          </ul>

          <h2 id="how-i-shoot">拍照这件事</h2>
          <p>
            风光靠查表和提前踩点，人像靠聊天，街头靠走重复的路。
            三者唯一的共性是——<strong>大部分时间都花在不按快门的地方</strong>。
          </p>
          <blockquote>
            与其拍一百张一样的照片，不如同一个机位去六次。
          </blockquote>

          <h2 id="about-site">关于这个站点</h2>
          <p>
            站点用 Next.js App Router 搭建，内容全部来自本地 Markdown 与 JSON 文件，没有数据库，
            也没有后台。想加内容就在 <code>content/</code> 下加文件，或者用脚手架：
            <code>npm run new-post</code>、<code>npm run new-photo</code>、<code>npm run new-project</code>。
          </p>

          <h2 id="contact">联系</h2>
          {/* 只列联系方式，不加说明文字 */}
          <ul>
            <li>
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            </li>
            {siteConfig.social.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer noopener">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* 侧栏 */}
        <aside className="flex flex-col gap-10 lg:sticky lg:top-28 lg:self-start" data-reveal>
          <div>
            <p className="text-lg font-semibold">{siteConfig.author}</p>
            <p className="mt-1 text-sm text-(--color-fg-muted)">{siteConfig.role}</p>
            <p className="mt-1 font-mono text-[0.7rem] tracking-wider text-(--color-fg-subtle)">
              {siteConfig.location}
            </p>
          </div>

          <div>
            <h2 className="eyebrow">四个角落</h2>
            <ul className="mt-4 flex flex-col">
              {sections.map((s) => (
                <li
                  key={s.id}
                  className="border-b border-(--color-line-soft) last:border-0"
                >
                  <Link
                    href={s.href}
                    className="group flex items-center justify-between gap-3 py-3"
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="tech-index">{s.index}</span>
                      <span className="text-sm text-(--color-fg-muted) transition-colors group-hover:text-(--color-fg)">
                        {s.label}
                      </span>
                    </span>
                    <span className="font-mono text-[0.65rem] text-(--color-fg-subtle)">
                      {counts[s.id] ?? 0}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="eyebrow">拍照用的</h2>
            <dl className="mt-4 flex flex-col">
              {GEAR.map((g) => (
                <div
                  key={g.label}
                  className="flex items-baseline justify-between gap-4 border-b border-(--color-line-soft) py-2.5 text-sm last:border-0"
                >
                  <dt className="text-(--color-fg-subtle)">{g.label}</dt>
                  <dd className="text-right text-(--color-fg-muted)">{g.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h2 className="eyebrow">时间线</h2>
            <ol className="mt-4 flex flex-col gap-5">
              {TIMELINE.map((t) => (
                <li key={t.year} className="flex gap-4">
                  <span className="shrink-0 font-mono text-[0.7rem] tracking-wider text-(--color-accent-dim)">
                    {t.year}
                  </span>
                  <span className="text-[0.85rem] leading-relaxed text-(--color-fg-muted)">
                    {t.text}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <Link
            href="/gallery"
            className="border border-(--color-line) px-5 py-3 text-center text-[0.8rem] tracking-wide transition-colors hover:border-(--color-accent) hover:text-(--color-accent)"
          >
            看看照片 →
          </Link>
        </aside>
      </div>
    </div>
  );
}
