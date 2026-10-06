import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        这张照片好像没存档
      </h1>
      <p className="mt-4 max-w-md text-sm leading-loose text-(--color-fg-muted)">
        页面不存在，或者已经被移走了。你可以回到首页，或者直接去看看作品集。
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="border border-(--color-line) px-5 py-2.5 text-[0.8rem] tracking-wide transition-colors hover:border-(--color-accent) hover:text-(--color-accent)"
        >
          回到首页
        </Link>
        <Link
          href="/gallery"
          className="px-5 py-2.5 text-[0.8rem] tracking-wide text-(--color-fg-muted) transition-colors hover:text-(--color-fg)"
        >
          浏览作品集
        </Link>
      </div>
    </div>
  );
}
