export type CrawledPage = {
  url: string;
  title: string | null;
  description: string | null;
  headings: string[];
  visibleText: string;
  links: string[];
  html: string;
  screenshotPath: string | null;
};
