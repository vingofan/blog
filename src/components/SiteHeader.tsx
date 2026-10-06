"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cx } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import Logo from "@/components/Logo";

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 路由变化时收起移动端菜单
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cx(
        "sticky top-0 z-50 transition-colors duration-300",
        scrolled
          ? "border-b border-(--color-line-soft) bg-(--color-base)/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-6 sm:h-20">
        <Link href="/" className="group flex items-center gap-3">
          <Logo size={28} className="shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[0.95rem] font-semibold tracking-[0.1em] text-(--color-fg)">
              {siteConfig.name}
            </span>
            <span className="mt-1 hidden font-mono text-[0.6rem] tracking-[0.22em] text-(--color-fg-subtle) sm:block">
              LIN XI
            </span>
          </span>
        </Link>

        {/* 桌面导航 */}
        <nav aria-label="主导航" className="hidden items-center gap-8 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cx(
                "link-underline text-[0.85rem] tracking-wide transition-colors",
                isActive(item.href)
                  ? "text-(--color-fg)"
                  : "text-(--color-fg-muted) hover:text-(--color-fg)"
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/search"
            aria-label="搜索"
            className="text-(--color-fg-muted) transition-colors hover:text-(--color-fg)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M11 11l4 4" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </Link>
        </nav>

        {/* 移动端按钮 */}
        <div className="flex items-center gap-1 md:hidden">
          <Link
            href="/search"
            aria-label="搜索"
            className="flex h-10 w-10 items-center justify-center text-(--color-fg-muted)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M11 11l4 4" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="打开菜单"
            className="flex h-10 w-10 items-center justify-center text-(--color-fg)"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              {open ? (
                <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.4" />
              ) : (
                <path d="M2 6h16M2 13h16" stroke="currentColor" strokeWidth="1.4" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 移动端菜单 */}
      {open && (
        <nav
          id="mobile-nav"
          aria-label="移动端导航"
          className="border-t border-(--color-line-soft) bg-(--color-base)/95 backdrop-blur-xl md:hidden"
        >
          <ul className="container-page flex flex-col py-2">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cx(
                    "block border-b border-(--color-line-soft) py-3.5 text-sm tracking-wide last:border-0",
                    isActive(item.href)
                      ? "text-(--color-fg)"
                      : "text-(--color-fg-muted)"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
