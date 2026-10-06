import Link from "next/link";
import LazyImage from "./LazyImage";
import type { PostMeta } from "@/lib/types";
import { formatDateCN } from "@/lib/utils";

interface PostCardProps {
  post: PostMeta;
  /** horizontal = 横向图文卡片（列表页），vertical = 竖版（首页网格） */
  variant?: "horizontal" | "vertical";
  priority?: boolean;
}

export default function PostCard({
  post,
  variant = "vertical",
  priority = false,
}: PostCardProps) {
  if (variant === "horizontal") {
    return (
      <article className="group border-b border-(--color-line-soft) py-8 first:pt-0 last:border-0">
        <Link href={post.url} className="grid gap-6 sm:grid-cols-[280px_1fr] sm:gap-8">
          <LazyImage
            src={post.cover}
            alt={post.coverAlt || post.title}
            width={1600}
            height={900}
            priority={priority}
            className="w-full overflow-hidden rounded-lg"
            imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.7rem] tracking-widest text-(--color-fg-subtle)">
              <time dateTime={post.date}>{post.date}</time>
              <span aria-hidden>·</span>
              <span>{post.readingMinutes} 分钟</span>
            </div>
            <h2 className="mt-3 text-xl font-semibold leading-snug text-(--color-fg) transition-colors group-hover:text-(--color-accent) sm:text-2xl">
              {post.title}
            </h2>
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-(--color-fg-muted)">
              {post.excerpt}
            </p>
            {!!post.tags.length && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-(--color-line) px-2.5 py-0.5 font-mono text-[0.65rem] tracking-wider text-(--color-fg-subtle)"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group">
      <Link href={post.url} className="block">
        <LazyImage
          src={post.cover}
          alt={post.coverAlt || post.title}
          width={1600}
          height={900}
          priority={priority}
          className="w-full overflow-hidden rounded-lg"
          imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <time
          dateTime={post.date}
          className="mt-4 block font-mono text-[0.7rem] tracking-widest text-(--color-fg-subtle)"
        >
          {formatDateCN(post.date)}
        </time>
        <h3 className="mt-2 text-[1rem] font-semibold leading-snug text-(--color-fg) transition-colors group-hover:text-(--color-accent)">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-(--color-fg-muted)">
          {post.excerpt}
        </p>
      </Link>
    </article>
  );
}
