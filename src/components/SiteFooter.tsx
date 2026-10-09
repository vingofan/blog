import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-28 border-t border-(--color-line-soft) bg-(--color-base-soft)">
      <div>
        <div className="container-page flex flex-col gap-3 py-6 font-mono text-[0.7rem] tracking-wider text-(--color-fg-subtle) sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {siteConfig.author}. 保留所有权利。</p>
          <ul className="flex gap-5">
            {siteConfig.social.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="transition-colors hover:text-(--color-fg)"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
