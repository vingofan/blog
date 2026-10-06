import Link from "next/link";
import SectionNav from "@/components/SectionNav";
import ProjectCard from "@/components/ProjectCard";
import PostCard from "@/components/PostCard";
import LazyImage from "@/components/LazyImage";
import HeroVideo from "@/components/HeroVideo";
import LightningTitle from "@/components/LightningTitle";
import HeroLightning from "@/components/HeroLightning";
import { siteConfig, siteTagline } from "@/config/site";
import { getPostsBySection } from "@/lib/posts";
import { getFeaturedPhotos, photos } from "@/lib/photos";
import { getFeaturedProjects, projects } from "@/lib/projects";
import { formatDateCN } from "@/lib/utils";

export default function HomePage() {
  const writing = getPostsBySection("writing").slice(0, 3);
  const dreams = getPostsBySection("dream").slice(0, 3);
  const featuredPhotos = getFeaturedPhotos(3);
  const featuredProjects = getFeaturedProjects(3);

  const counts = {
    photography: photos.length,
    writing: getPostsBySection("writing").length,
    dream: getPostsBySection("dream").length,
    project: projects.length,
  };

  return (
    <>
      {/* Hero：站名 + 四个板块的概览
          min-height 撑满一屏，让底部那条「滚动提示」成为这一屏的出口，
          而不是悬在内容与下一段之间的空隙。
          负 margin + 等量 padding：让 Hero（连同背景视频）钻到透明的顶栏下面铺满整个视口，
          文字位置不变。 */}
      <section className="grid-bg hero-stage glow-top relative -mt-16 flex min-h-svh flex-col overflow-hidden border-b border-(--color-line-soft) pt-16 sm:-mt-20 sm:pt-20">
        {/* 背景动效：雪豹从暗处显形、走过来，在右侧趴下看着你；演完后循环一段趴着的待机画面。
            宽屏下 Hero 的网格底纹让位给它（见 globals.css 的 .hero-stage）。 */}
        <HeroVideo />
        <div className="container-page relative flex flex-1 flex-col py-16 sm:py-20">
          <p className="eyebrow lt-late" style={{ "--ld": "0.85s" } as React.CSSProperties}>
            一个人的四个角落
          </p>

          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl">
            <LightningTitle name={siteConfig.name} />
          </h1>

          {/* sm:text-[1rem] 而非 sm:text-base —— --color-base 被注册成同名颜色后，
              text-base 会连带把颜色染成底色，这行字就隐形了（详见 globals.css 注释） */}
          <p
            className="lt-late mt-7 max-w-xl text-sm leading-loose text-(--color-fg-muted) sm:text-[1rem] lg:max-w-[25rem]"
            style={{ "--ld": "1s" } as React.CSSProperties}
          >
            {siteTagline}
          </p>

          <div
            className="lt-late mt-9 flex flex-wrap gap-3"
            style={{ "--ld": "1.15s" } as React.CSSProperties}
          >
            <Link
              href="/gallery"
              className="border border-(--color-line) px-5 py-2.5 text-[0.8rem] tracking-wide text-(--color-fg) transition-colors hover:border-(--color-accent) hover:text-(--color-accent)"
            >
              看看照片
            </Link>
            <Link
              href="/about"
              className="px-5 py-2.5 text-[0.8rem] tracking-wide text-(--color-fg-muted) transition-colors hover:text-(--color-fg)"
            >
              关于我 →
            </Link>
          </div>

          {/* 概览数字 */}
          <dl
            className="lt-late mt-12 flex flex-wrap gap-x-10 gap-y-4 font-mono text-[0.7rem] tracking-wider sm:mt-14"
            style={{ "--ld": "1.3s" } as React.CSSProperties}
          >
            {[
              { label: "摄影", value: counts.photography, unit: "张" },
              { label: "写字", value: counts.writing, unit: "篇" },
              { label: "白日梦", value: counts.dream, unit: "则" },
              { label: "项目", value: counts.project, unit: "个" },
            ]
              // 还没有内容的板块先不报数——首屏写着「0 篇」只会让人觉得这里是空的
              .filter((item) => item.value > 0)
              .map((item) => (
              <div key={item.label} className="flex items-baseline gap-2">
                <dt className="text-(--color-fg-subtle)">{item.label}</dt>
                <dd className="text-(--color-fg)">
                  {item.value}
                  <span className="ml-0.5 text-(--color-fg-subtle)">{item.unit}</span>
                </dd>
              </div>
            ))}
          </dl>

          {/* 视频不出场时（窄屏、减少动态效果）的替身：同一只豹子的定格 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="hero-still"
            src="/images/hero/leopard-rest.webp"
            width={1090}
            height={700}
            alt=""
            aria-hidden
          />

          {/* 滚动提示：贴在 Hero 底部，点一下直接跳到「四个角落」。
              mt-auto 让它始终落在这一屏的底边，视口再矮也不会把内容顶出去。 */}
          <div
            className="lt-late mt-auto flex justify-center pt-10 sm:pt-12"
            style={{ "--ld": "1.5s" } as React.CSSProperties}
          >
            <a
              href="#sections"
              className="scroll-cue"
              aria-label="向下滚动，看四个板块"
            >
              <span className="scroll-cue-arrow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M2 5l5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </a>
          </div>
        </div>
        {/* 闪电层放最后：盖在文字和视频之上，不拦截点击 */}
        <HeroLightning />
      </section>

      {/* 四个板块入口 */}
      <section
        id="sections"
        className="container-page mt-16 scroll-mt-20 sm:mt-20"
        data-reveal
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">四个角落</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
              这里有什么
            </h2>
          </div>
        </div>
        <SectionNav counts={counts} className="mt-8" />
      </section>

      {/* 摄影预览 */}
      {featuredPhotos.length > 0 && (
        <section className="container-page mt-24 sm:mt-32" data-reveal>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-(--color-line-soft) pb-5">
            <div>
              <p className="eyebrow">01 · 摄影</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                最近在拍的
              </h2>
            </div>
            <Link
              href="/gallery"
              className="link-underline text-sm text-(--color-fg-muted) transition-colors hover:text-(--color-fg)"
            >
              进入作品集 →
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {featuredPhotos.map((photo, i) => (
              <Link
                key={photo.id}
                href="/gallery"
                className="group block"
                data-reveal
                data-reveal-delay={i * 90}
              >
                <LazyImage
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  className="w-full overflow-hidden rounded-lg"
                  imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <p className="mt-3 text-sm text-(--color-fg) transition-colors group-hover:text-(--color-accent)">
                  {photo.title}
                </p>
                {photo.caption && (
                  <p className="mt-1 line-clamp-2 text-[0.8rem] leading-relaxed text-(--color-fg-subtle)">
                    {photo.caption}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 最新文字 */}
      {writing.length > 0 && (
        <section className="container-page mt-24 sm:mt-32" data-reveal>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-(--color-line-soft) pb-5">
            <div>
              <p className="eyebrow">02 · 写字的地方</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                最近写下的
              </h2>
            </div>
            <Link
              href="/writing"
              className="link-underline text-sm text-(--color-fg-muted) transition-colors hover:text-(--color-fg)"
            >
              全部文章 →
            </Link>
          </div>

          <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {writing.map((post, i) => (
              <div key={post.slug} data-reveal data-reveal-delay={i * 90}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 白日梦 */}
      {dreams.length > 0 && (
        <section className="container-page mt-24 sm:mt-32" data-reveal>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-(--color-line-soft) pb-5">
            <div>
              <p className="eyebrow">03 · 白日梦</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                想着玩的
              </h2>
            </div>
            <Link
              href="/dreams"
              className="link-underline text-sm text-(--color-fg-muted) transition-colors hover:text-(--color-fg)"
            >
              全部白日梦 →
            </Link>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-3">
            {dreams.map((dream, i) => (
              <li key={dream.slug} data-reveal data-reveal-delay={i * 90}>
                <Link href={dream.url} className="tech-card group block h-full p-6">
                  <time
                    dateTime={dream.date}
                    className="font-mono text-[0.65rem] tracking-wider text-(--color-fg-subtle)"
                  >
                    {formatDateCN(dream.date)}
                  </time>
                  <p className="mt-3 text-sm leading-relaxed text-(--color-fg-muted) transition-colors group-hover:text-(--color-fg)">
                    {dream.excerpt || dream.title}
                  </p>
                  {dream.wordCount > 200 && (
                    <span className="mt-4 inline-block font-mono text-[0.65rem] tracking-wider text-(--color-tech) opacity-80">
                      阅读全文 →
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 好玩的项目 */}
      {featuredProjects.length > 0 && (
        <section className="container-page mt-24 sm:mt-32" data-reveal>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-(--color-line-soft) pb-5">
            <div>
              <p className="eyebrow">04 · 好玩的项目</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                做着玩的
              </h2>
            </div>
            <Link
              href="/projects"
              className="link-underline text-sm text-(--color-fg-muted) transition-colors hover:text-(--color-fg)"
            >
              全部项目 →
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project, i) => (
              <div key={project.id} data-reveal data-reveal-delay={i * 90}>
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 关于我 */}
      <section className="container-page mt-28 sm:mt-36" data-reveal>
        <div className="card-dark glow-top relative p-8 sm:p-12">
          <p className="eyebrow">关于我</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {siteConfig.author} · {siteConfig.role}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-loose text-(--color-fg-muted) sm:text-[1rem]">
            常驻{siteConfig.location}。拍照只是生活里的一块，另外几块是写字、胡思乱想，
            和做一些没什么用但很好玩的小东西。这个站点就是这四块的存放处——
            不追日更，也不追热点，攒够了才放上来。
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/about"
              className="border border-(--color-line) px-5 py-2.5 text-[0.8rem] tracking-wide text-(--color-fg) transition-colors hover:border-(--color-accent) hover:text-(--color-accent)"
            >
              了解更多
            </Link>
            <Link
              href="/archive"
              className="px-5 py-2.5 text-[0.8rem] tracking-wide text-(--color-fg-muted) transition-colors hover:text-(--color-fg)"
            >
              浏览归档
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
