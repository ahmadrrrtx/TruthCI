import chromium from "@sparticuz/chromium";
import { chromium as playwrightChromium } from "playwright-core";
import { createId } from "@/lib/utils/ids";
import { normalizeUrl } from "@/lib/utils/urls";
import { getEnv } from "@/lib/utils/env";
import { normalizeCrawlUrl } from "./normalize-url";
import { prioritizeUrls } from "./page-prioritizer";
import { extractPage } from "./extract";
import { saveScreenshot } from "./screenshots";
import type { CrawledPage } from "./types";

const MAX_CONTENT_CHARS = 60000;
const MAX_HTML_CHARS = 150000;

export async function crawlProject(rootUrlInput: string, scanId: string): Promise<CrawledPage[]> {
  const rootUrl = normalizeUrl(rootUrlInput);
  const maxPages = Number(getEnv("CRAWL_MAX_PAGES", process.env.VERCEL ? "5" : "8"));
  const timeout = Number(getEnv("CRAWL_PAGE_TIMEOUT_MS", process.env.VERCEL ? "12000" : "15000"));
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || await chromium.executablePath();
  const browser = await playwrightChromium.launch({
    args: chromium.args,
    executablePath,
    headless: true
  });
  const context = await browser.newContext({
    userAgent: "TruthCI/0.1 public-product-truth-engine",
    viewport: { width: 1440, height: 1200 },
    ignoreHTTPSErrors: true
  });

  const pages: CrawledPage[] = [];
  const discovered = new Set<string>([rootUrl]);
  const crawled = new Set<string>();

  try {
    while (pages.length < maxPages) {
      const candidates = prioritizeUrls(Array.from(discovered).filter((u) => !crawled.has(u)), rootUrl, maxPages);
      const nextUrl = candidates[0];
      if (!nextUrl) break;
      crawled.add(nextUrl);

      const page = await context.newPage();
      page.setDefaultTimeout(timeout);
      page.setDefaultNavigationTimeout(timeout);

      try {
        await page.goto(nextUrl, { waitUntil: "domcontentloaded", timeout });
        await page.waitForLoadState("networkidle", { timeout: Math.min(timeout, 8000) }).catch(() => undefined);
        const extracted = await extractPage(page);
        for (const href of extracted.links) {
          const normalized = normalizeCrawlUrl(href, rootUrl);
          if (normalized) discovered.add(normalized);
        }
        const snapshotId = createId("snap");
        let screenshotPath: string | null = null;
        try {
          screenshotPath = await saveScreenshot(page, scanId, snapshotId);
        } catch (error) {
          console.warn("screenshot failed", nextUrl, error);
        }
        pages.push({
          url: normalizeUrl(page.url() || nextUrl),
          title: extracted.title,
          description: extracted.description,
          headings: extracted.headings,
          visibleText: extracted.visibleText.slice(0, MAX_CONTENT_CHARS),
          links: extracted.links.map((href) => normalizeCrawlUrl(href, rootUrl)).filter(Boolean).slice(0, 200) as string[],
          html: extracted.html.slice(0, MAX_HTML_CHARS),
          screenshotPath
        });
      } catch (error) {
        console.warn("crawl page failed", nextUrl, error);
      } finally {
        await page.close().catch(() => undefined);
      }
    }
  } finally {
    await browser.close().catch(() => undefined);
  }

  if (pages.length === 0) {
    throw new Error("Crawler could not extract any public pages from the root URL.");
  }
  return pages;
}
