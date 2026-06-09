import fs from "node:fs";
import path from "node:path";
import type { Page } from "playwright-core";
import { getEnv } from "@/lib/utils/env";

export async function saveScreenshot(page: Page, scanId: string, snapshotId: string) {
  const root = getEnv("SCREENSHOT_DIR", process.env.VERCEL ? "/tmp/truthci-screenshots" : "./storage/screenshots")!;
  const dir = path.resolve(process.cwd(), root, scanId);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${snapshotId}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return path.relative(process.cwd(), file);
}
