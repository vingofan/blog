"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const ICON_COPY =
  '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M10.5 5.5v-2a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 3.5v5A1.5 1.5 0 0 0 4 10h1.5" stroke="currentColor" stroke-width="1.3"/></svg>';
const ICON_DONE =
  '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 非 https 或权限被拒时的退路
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

/**
 * 给正文里的代码块（包括贴出来的 prompt）加一个复制按钮。
 * 正文是 Markdown 渲染后整段塞进页面的 HTML，没法在里面放组件，所以在浏览器里补。
 * 按钮挂在包住 <pre> 的外层上，而不是 <pre> 里面——<pre> 会横向滚动，按钮放里面会跟着滚走。
 */
export default function CodeCopy() {
  const pathname = usePathname();

  useEffect(() => {
    const pres = document.querySelectorAll<HTMLPreElement>(".prose-photo pre, .prose-dream pre");
    pres.forEach((pre) => {
      if (pre.parentElement?.classList.contains("code-block")) return;

      const wrap = document.createElement("div");
      wrap.className = "code-block";
      pre.replaceWith(wrap);
      wrap.appendChild(pre);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "code-copy";
      btn.setAttribute("aria-label", "复制");
      btn.title = "复制";
      btn.innerHTML = ICON_COPY;
      let timer = 0;
      btn.addEventListener("click", async () => {
        const ok = await copyText((pre.querySelector("code") ?? pre).textContent ?? "");
        if (!ok) return;
        btn.innerHTML = ICON_DONE;
        btn.dataset.copied = "true";
        btn.setAttribute("aria-label", "已复制");
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          btn.innerHTML = ICON_COPY;
          delete btn.dataset.copied;
          btn.setAttribute("aria-label", "复制");
        }, 1600);
      });
      wrap.appendChild(btn);
    });
  }, [pathname]);

  return null;
}
