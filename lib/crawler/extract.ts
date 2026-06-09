import type { Page } from "playwright-core";

export async function extractPage(page: Page) {
  return page.evaluate(() => {
    const clone = document.documentElement.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("script, style, noscript, svg").forEach((node) => node.remove());

    const description = document.querySelector('meta[name="description"]')?.getAttribute("content") ?? null;
    const headings = Array.from(document.querySelectorAll("h1,h2,h3"))
      .map((el) => (el.textContent ?? "").replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .slice(0, 60);
    const links = Array.from(document.querySelectorAll("a[href]"))
      .map((a) => (a as HTMLAnchorElement).href)
      .filter(Boolean);
    const visibleText = (document.body?.innerText ?? "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();

    return {
      title: document.title || null,
      description,
      headings,
      links,
      visibleText,
      html: document.documentElement.outerHTML
    };
  });
}
