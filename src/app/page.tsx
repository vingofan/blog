import Link from "next/link";
import SectionNav from "@/components/SectionNav";
import ProjectCard from "@/components/ProjectCard";
import PostCard from "@/components/PostCard";
import LazyImage from "@/components/LazyImage";
import HeroVideo from "@/components/HeroVideo";
import LightningTitle from "@/components/LightningTitle";
import ParticleTitle from "@/components/ParticleTitle";
import HeroLightning from "@/components/HeroLightning";
import { siteConfig, siteTagline } from "@/config/site";
import { getPostsBySection } from "@/lib/posts";
import { getFeaturedPhotos, photos } from "@/lib/photos";
import { getFeaturedWorks, getWorks } from "@/lib/projects";
import { sections } from "@/config/sections";

export default function HomePage() {
  const articles = getPostsBySection("article");
  const featuredPhotos = getFeaturedPhotos(3);
  const featuredSkills = getFeaturedWorks("skill", 3);
  const featuredProducts = getFeaturedWorks("product", 3);

  // 键和 sections.ts 里的板块 id 一一对应
  const counts: Record<string, number> = {
    photography: photos.length,
    skill: getWorks("skill").length,
    product: getWorks("product").length,
    article: articles.length,
  };

  return (
    <>
      {/* Hero：站名 + 四个板块的概览
          min-height 撑满一屏，让底部那条「滚动提示」成为这一屏的出口，
          而不是悬在内容与下一段之间的空隙。
          负 margin + 等量 padding：让 Hero（连同背景视频）钻到透明的顶栏下面铺满整个视口，
          文字位置不变。 */}
      <section className="grid-bg hero-stage glow-top relative -mt-16 flex min-h-svh flex-col overflow-hidden border-b border-(--color-line-soft) pt-16 sm:-mt-20 sm:pt-20">
        {/* 背景：黑豹站着、走来、咆哮、趴下，演完后循环一段趴着的待机画面。
            它是整屏的背景，文字叠在上面；视频不出场时（窄屏、减少动态效果）由 hero-still 这张定格顶上。
            出场顺序：闪电先劈（LightningTitle + HeroLightning）→ 豹子亮出来 → 最后一道闪电熄灭后，站名和文案依次淡入。
            hero-fade 是底部那段渐变回页面底色的过渡。 */}
        <div className="hero-still" aria-hidden />
        <HeroVideo />
        <div className="hero-fade" aria-hidden />
        <div className="container-page relative flex flex-1 flex-col py-16 sm:py-20">
          {/* 文案块：宽屏下竖排贴右上角（站名、副标、小标三列），按钮沉到左下、统计沉到右下（见 globals.css 的 .hero-copy）；窄屏仍然横排靠左 */}
          <div className="hero-copy">
          <p className="eyebrow lt-late pt-host" style={{ "--ld": "0.9s" } as React.CSSProperties}>
            一个人的四个角落
            <ParticleTitle crisp startMs={1620} delayMs={120} from=".lt-stage > .lt-bolt" />
          </p>

          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl">
            <LightningTitle name={siteConfig.name} />
          </h1>

          {/* sm:text-[1rem] 而非 sm:text-base —— --color-base 被注册成同名颜色后，
              text-base 会连带把颜色染成底色，这行字就隐形了（详见 globals.css 注释） */}
          <p
            className="lt-late pt-host mt-7 max-w-xl text-sm leading-loose text-(--color-fg-muted) sm:text-[1rem] lg:max-w-[25rem]"
            style={{ "--ld": "0.9s" } as React.CSSProperties}
          >
            {siteTagline}
            <ParticleTitle crisp startMs={1560} delayMs={60} from=".lt-stage > .lt-bolt" />
          </p>

          <div
            className="lt-late mt-9 flex flex-wrap gap-3"
            style={{ "--ld": "2.35s" } as React.CSSProperties}
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
            style={{ "--ld": "2.5s" } as React.CSSProperties}
          >
            {sections
              .map((sec) => ({ label: sec.label, value: counts[sec.id] ?? 0, unit: sec.unit }))
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

          </div>

          {/* 滚动提示：贴在 Hero 底部，点一下直接跳到「四个角落」。
              mt-auto 让它始终落在这一屏的底边，视口再矮也不会把内容顶出去。 */}
          <div
            className="lt-late mt-auto flex justify-center pt-10 sm:pt-12"
            style={{ "--ld": "2.65s" } as React.CSSProperties}
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

      {/* Skills */}
      {featuredSkills.length > 0 && (
        <section className="container-page mt-24 sm:mt-32" data-reveal>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-(--color-line-soft) pb-5">
            <div>
              <p className="eyebrow">02 · Skills</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                教给 AI 的
              </h2>
            </div>
            <Link
              href="/skills"
              className="link-underline text-sm text-(--color-fg-muted) transition-colors hover:text-(--color-fg)"
            >
              全部 Skills →
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredSkills.map((project, i) => (
              <div key={project.id} data-reveal data-reveal-delay={i * 90}>
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 产品 */}
      {featuredProducts.length > 0 && (
        <section className="container-page mt-24 sm:mt-32" data-reveal>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-(--color-line-soft) pb-5">
            <div>
              <p className="eyebrow">03 · 产品</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                做出来的
              </h2>
            </div>
            <Link
              href="/products"
              className="link-underline text-sm text-(--color-fg-muted) transition-colors hover:text-(--color-fg)"
            >
              全部产品 →
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((project, i) => (
              <div key={project.id} data-reveal data-reveal-delay={i * 90}>
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 文章 */}
      {articles.length > 0 && (
        <section className="container-page mt-24 sm:mt-32" data-reveal>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-(--color-line-soft) pb-5">
            <div>
              <p className="eyebrow">04 · 文章</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                最近写下的
              </h2>
            </div>
            <Link
              href="/blog"
              className="link-underline text-sm text-(--color-fg-muted) transition-colors hover:text-(--color-fg)"
            >
              全部文章 →
            </Link>
          </div>

          <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {articles.slice(0, 3).map((post, i) => (
              <div key={post.slug} data-reveal data-reveal-delay={i * 90}>
                <PostCard post={post} />
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
            常驻{siteConfig.location}。拍照只是生活里的一块，另外几块是给 AI 攒 Skills、
            做点能用的产品，和把想清楚的事写成文章。这个站点就是这四块的存放处——
            不追日更，也不追热点，攒够了才放上来。
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/about"
              className="border border-(--color-line) px-5 py-2.5 text-[0.8rem] tracking-wide text-(--color-fg) transition-colors hover:border-(--color-accent) hover:text-(--color-accent)"
            >
              了解更多
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
