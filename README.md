# TruthCI

<p align="center">
  <strong>Catch product contradictions before your users do.</strong>
</p>

<p align="center">
  <a href="https://truth-ci.vercel.app/"><img alt="Live Demo" src="https://img.shields.io/badge/Live-Demo-7c3aed?style=for-the-badge"></a>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=nextdotjs">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-Ready-3178c6?style=for-the-badge&logo=typescript&logoColor=white">
  <img alt="Vercel" src="https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel">
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-Turso%20%2B%20Local-044a64?style=for-the-badge&logo=sqlite&logoColor=white">
</p>

**TruthCI** is a Public Product Truth Engine for detecting drift and contradictions across public product surfaces such as landing pages, pricing pages, documentation, API docs, changelogs, release notes, and developer examples.

TruthCI crawls bounded public URLs, stores snapshots, computes deterministic diffs, detects rule-based contradictions, and uses AI only to explain evidence-backed findings.

> AI is not the source of truth. TruthCI uses deterministic crawling, snapshots, diffs, and rules as the evidence layer. AI only summarizes and explains.

---

## Contents

- [Overview](#overview)
- [Live App](#live-app)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [How TruthCI Works](#how-truthci-works)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Deploying to Vercel](#deploying-to-vercel)
- [GitHub OAuth Setup](#github-oauth-setup)
- [Turso Setup](#turso-setup)
- [Operational Notes](#operational-notes)
- [MVP Constraints](#mvp-constraints)
- [Validation](#validation)

---

## Overview

Companies publish product information across many surfaces. Over time, these sources drift apart.

Example contradiction:

| Surface | Public Claim |
| --- | --- |
| Website | `Unlimited API requests` |
| Pricing page | `100k requests/month` |
| Documentation | `Rate limits apply` |
| API behavior | `429 after 10k requests` |

TruthCI helps teams detect this kind of trust-breaking inconsistency before users find it.

---

## Live App

Production deployment:

```txt
https://truth-ci.vercel.app/
```

---

## Key Features

| Feature | Status | Notes |
| --- | --- | --- |
| GitHub OAuth login | Done | Powered by NextAuth |
| Project creation | Done | User enters a public root URL |
| Manual scans | Done | Bounded scan execution for MVP |
| Public page crawling | Done | Uses Playwright-compatible Chromium on Vercel |
| Snapshot storage | Done | Stores title, description, content, HTML, links, screenshot path |
| Deterministic diffs | Done | Uses `diff` / jsdiff |
| Rule-based contradictions | Done | Detects high-value contradiction patterns |
| AI explanations | Done | Groq primary, Cerebras fallback |
| Scan history | Done | Previous scans are stored per project |
| Vercel deployment | Done | Uses Turso for durable SQLite persistence |

---

## Architecture

GitHub Mermaid diagrams can sometimes fail to render depending on labels and renderer support, so this README uses plain text diagrams for reliability.

### System Architecture

```txt
+-------------------+
|       User        |
+---------+---------+
          |
          v
+-------------------------------+
| Next.js 15 App Router UI      |
| Landing, dashboard, reports   |
+---------+---------------------+
          |
          v
+-------------------------------+
| Next.js API Routes            |
| Auth, projects, scans         |
+----+------------+-------------+
     |            |
     |            v
     |     +--------------------+
     |     | NextAuth GitHub    |
     |     | OAuth              |
     |     +--------------------+
     |
     v
+-------------------------------+
| Application Services          |
| Project, scan, report logic   |
+----+------------+-------------+
     |            |
     |            v
     |     +--------------------+
     |     | Playwright Crawler |
     |     | Chromium runtime   |
     |     +--------------------+
     |
     v
+-------------------------------+
| Evidence Engines              |
| jsdiff + rule contradictions  |
+----+------------+-------------+
     |            |
     |            v
     |     +--------------------+
     |     | AI Explanation     |
     |     | Groq / Cerebras    |
     |     +--------------------+
     |
     v
+-------------------------------+
| SQLite Persistence Layer      |
| Local SQLite or Turso/libSQL  |
+-------------------------------+
```

### Vercel Deployment Architecture

```txt
+-------------------+        +--------------------------+
| Browser           | -----> | Vercel Next.js App       |
+-------------------+        +------------+-------------+
                                      |
        +-----------------------------+-----------------------------+
        |                             |                             |
        v                             v                             v
+---------------+             +---------------+             +----------------+
| GitHub OAuth  |             | Turso SQLite  |             | Groq AI API    |
| NextAuth      |             | Durable DB    |             | Explanations   |
+---------------+             +---------------+             +----------------+
                                      |
                                      v
                              +----------------+
                              | Chromium       |
                              | playwright-core|
                              +----------------+
```

---

## How TruthCI Works

### Scan Flow

```txt
1. User signs in with GitHub
2. User creates a project with a public URL
3. User clicks Run Scan
4. TruthCI crawls the root URL and prioritized same-origin links
5. Extracted content is saved as snapshots
6. Current snapshots are compared with the previous completed scan
7. jsdiff produces deterministic changes
8. Rule engine detects contradictions
9. Groq generates summary, impact, and explanation
10. If Groq fails, Cerebras is tried
11. If AI fails completely, deterministic fallback text is used
12. User views report and scan history
```

### Evidence Pipeline

```txt
Public URL
   |
   v
Crawler
   |
   v
Snapshot
   |
   +--> Diff Engine ------> Structured Changes
   |
   +--> Rule Engine ------> Contradictions
   |
   +--> AI Layer ---------> Human Explanation
   |
   v
Report
```

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 15 App Router, React, TypeScript |
| Styling | TailwindCSS, local shadcn-style UI primitives |
| Icons | Lucide React |
| Authentication | NextAuth v4, GitHub OAuth |
| Local database | SQLite with `better-sqlite3` |
| Vercel database | Turso/libSQL via `@libsql/client` |
| Crawling | `playwright-core` with `@sparticuz/chromium` |
| Diff engine | `diff` / jsdiff |
| AI primary | Groq |
| AI fallback | Cerebras |
| Hosting | Vercel |

---

## Database Schema

### `users`

| Column | Type | Description |
| --- | --- | --- |
| `id` | TEXT | Internal TruthCI user ID |
| `github_id` | TEXT | Unique GitHub profile ID |
| `email` | TEXT | User email, nullable |
| `name` | TEXT | User display name, nullable |
| `image` | TEXT | GitHub avatar URL, nullable |
| `created_at` | TEXT | Creation timestamp |

### `projects`

| Column | Type | Description |
| --- | --- | --- |
| `id` | TEXT | Project ID |
| `user_id` | TEXT | Owner user ID |
| `name` | TEXT | Project or product name |
| `root_url` | TEXT | Public root URL to monitor |
| `created_at` | TEXT | Creation timestamp |

### `scans`

| Column | Type | Description |
| --- | --- | --- |
| `id` | TEXT | Scan ID |
| `project_id` | TEXT | Project being scanned |
| `started_at` | TEXT | Scan start timestamp |
| `completed_at` | TEXT | Scan completion timestamp |
| `status` | TEXT | `pending`, `running`, `completed`, or `failed` |
| `error` | TEXT | Failure message, nullable |

### `snapshots`

| Column | Type | Description |
| --- | --- | --- |
| `id` | TEXT | Snapshot ID |
| `scan_id` | TEXT | Parent scan ID |
| `url` | TEXT | Crawled URL |
| `title` | TEXT | Page title |
| `description` | TEXT | Meta description |
| `content` | TEXT | Extracted visible product text |
| `html` | TEXT | Raw HTML excerpt |
| `screenshot_path` | TEXT | Screenshot path; temporary on Vercel MVP |
| `links_json` | TEXT | Extracted links as JSON |
| `created_at` | TEXT | Creation timestamp |

### `reports`

| Column | Type | Description |
| --- | --- | --- |
| `id` | TEXT | Report ID |
| `scan_id` | TEXT | Unique parent scan ID |
| `summary` | TEXT | AI or fallback summary |
| `impact` | TEXT | AI or fallback impact estimate |
| `explanation` | TEXT | AI or fallback explanation |
| `contradictions` | TEXT | JSON array of contradictions |
| `changes` | TEXT | JSON array of structured changes |
| `ai_provider` | TEXT | `groq`, `cerebras`, or `null` |
| `created_at` | TEXT | Creation timestamp |

---

## Project Structure

```txt
truthci/
  app/
    page.tsx
    layout.tsx
    globals.css
    login/
      page.tsx
    dashboard/
      page.tsx
    settings/
      page.tsx
    projects/
      new/
        page.tsx
      [projectId]/
        page.tsx
        history/
          page.tsx
        scans/
          [scanId]/
            page.tsx
    api/
      auth/
        [...nextauth]/
          route.ts
      projects/
        route.ts
        [projectId]/
          route.ts
          scan/
            route.ts
      scans/
        [scanId]/
          route.ts

  components/
    ui/
    app-shell.tsx
    contradiction-card.tsx
    create-project-form.tsx
    diff-viewer.tsx
    empty-state.tsx
    logo.tsx
    page-header.tsx
    project-card.tsx
    report-summary.tsx
    run-scan-button.tsx
    scan-status-badge.tsx
    sign-in-button.tsx
    sign-out-button.tsx
    snapshot-list.tsx

  lib/
    auth/
      config.ts
      session.ts
    db/
      client.ts
      migrate.ts
      schema.sql
      queries/
    services/
      project-service.ts
      scan-service.ts
      report-service.ts
    crawler/
      crawl.ts
      extract.ts
      normalize-url.ts
      page-prioritizer.ts
      screenshots.ts
      types.ts
    diff/
      compute-diff.ts
      normalize-content.ts
      types.ts
    contradictions/
      claim-rules.ts
      detect-contradictions.ts
      types.ts
    ai/
      analyze-report.ts
      cerebras.ts
      groq.ts
      prompts.ts
      types.ts
    utils/
      cn.ts
      dates.ts
      env.ts
      ids.ts
      urls.ts

  scripts/
    migrate.ts
    seed.ts

  public/
    logo.svg

  .env.example
  .gitignore
  next.config.ts
  package.json
  README.md
  tsconfig.json
  vercel.json
```

---

## Environment Variables

### Required on Vercel

| Variable | Required | Example | Notes |
| --- | --- | --- | --- |
| `NEXTAUTH_URL` | Yes | `https://truth-ci.vercel.app` | Must match your deployed app URL |
| `NEXTAUTH_SECRET` | Yes | Generated random secret | Generate with `openssl rand -base64 32` |
| `GITHUB_CLIENT_ID` | Yes | `Ov23...` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | Yes | `...` | GitHub OAuth app client secret |
| `TURSO_DATABASE_URL` | Yes | `libsql://truthci-xxx.turso.io` | Durable SQLite database URL |
| `TURSO_AUTH_TOKEN` | Yes | `eyJ...` | Turso database auth token |

### Recommended on Vercel

| Variable | Required | Recommended Value | Notes |
| --- | --- | --- | --- |
| `GROQ_API_KEY` | Recommended | `gsk_...` | Enables primary AI explanations |
| `GROQ_MODEL` | No | `llama-3.3-70b-versatile` | Groq chat model |
| `CEREBRAS_API_KEY` | Optional | `...` | AI fallback provider |
| `CEREBRAS_MODEL` | No | `llama3.1-70b` | Cerebras fallback model |
| `CRAWL_MAX_PAGES` | No | `5` | Keep low for Vercel serverless |
| `CRAWL_PAGE_TIMEOUT_MS` | No | `12000` | Per-page crawl timeout |
| `SCREENSHOT_DIR` | No | `/tmp/truthci-screenshots` | Temporary filesystem path on Vercel |

### Local Only

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `DATABASE_PATH` | No | `./data/truthci.db` | Local SQLite file path |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` | Optional | Blank | Use a local Chrome/Chromium binary if needed |

---

## Local Development

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```

Open:

```txt
http://localhost:3000
```

If local Chromium cannot launch, set:

```env
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/google-chrome
```

Examples:

```txt
macOS: /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
Linux: /usr/bin/google-chrome
Windows: C:\Program Files\Google\Chrome\Application\chrome.exe
```

---

## Deploying to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial TruthCI MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/TruthCI.git
git push -u origin main
```

### 2. Import into Vercel

1. Go to `https://vercel.com/new`
2. Select the GitHub repository
3. Framework: `Next.js`
4. Install command: `npm install`
5. Build command: `npm run build`
6. Output directory: leave default
7. Add environment variables
8. Deploy

### 3. Required Vercel Environment Variables

```env
NEXTAUTH_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
NEXTAUTH_SECRET=PASTE_GENERATED_SECRET
GITHUB_CLIENT_ID=PASTE_GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET=PASTE_GITHUB_CLIENT_SECRET
TURSO_DATABASE_URL=PASTE_TURSO_DATABASE_URL
TURSO_AUTH_TOKEN=PASTE_TURSO_AUTH_TOKEN
GROQ_API_KEY=PASTE_GROQ_API_KEY
GROQ_MODEL=llama-3.3-70b-versatile
CRAWL_MAX_PAGES=5
CRAWL_PAGE_TIMEOUT_MS=12000
SCREENSHOT_DIR=/tmp/truthci-screenshots
```

Optional fallback:

```env
CEREBRAS_API_KEY=PASTE_CEREBRAS_API_KEY
CEREBRAS_MODEL=llama3.1-70b
```

After changing environment variables, redeploy from the Vercel dashboard.

---

## GitHub OAuth Setup

Create a GitHub OAuth app:

```txt
GitHub Settings -> Developer settings -> OAuth Apps -> New OAuth App
```

| Field | Value |
| --- | --- |
| Application name | `TruthCI` |
| Homepage URL | `https://YOUR-VERCEL-DOMAIN.vercel.app` |
| Authorization callback URL | `https://YOUR-VERCEL-DOMAIN.vercel.app/api/auth/callback/github` |

Then add these to Vercel:

```env
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

If you later add a custom domain, update both:

```env
NEXTAUTH_URL=https://your-custom-domain.com
```

and the GitHub OAuth callback URL:

```txt
https://your-custom-domain.com/api/auth/callback/github
```

---

## Turso Setup

TruthCI uses Turso/libSQL for durable SQLite persistence on Vercel.

### Turso CLI

```bash
curl -sSfL https://get.tur.so/install.sh | bash
turso auth login
turso db create truthci
turso db show truthci --url
turso db tokens create truthci
```

Add the resulting values to Vercel:

```env
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```

TruthCI automatically runs schema creation from `lib/db/schema.sql` on first authenticated usage/API call.

---

## Operational Notes

### Crawler Limits

| Setting | Default on Vercel |
| --- | --- |
| Max pages per scan | `5` |
| Page timeout | `12000ms` |
| Function max duration | `60s` |

The crawler only follows same-origin links and prioritizes URLs containing:

```txt
pricing, docs, documentation, api, developers, changelog, releases,
updates, plans, features, security, terms, limits, support, status
```

### Bot Protection

Some large websites, including sites behind Cloudflare or custom anti-bot systems, may return pages like:

```txt
Just a moment...
Checking your browser...
Verify you are human...
```

TruthCI treats those as blocked crawl targets rather than valid product content.

### SSRF Protections

TruthCI rejects obvious unsafe targets:

- non-HTTP protocols
- localhost
- private IP ranges
- metadata IP `169.254.169.254`
- common auth and checkout paths
- asset files such as PDFs, images, videos, CSS, JS, and ZIP files

### AI Failure Behavior

Reports do not depend on AI availability.

If Groq fails:

1. TruthCI tries Cerebras
2. If Cerebras fails, deterministic fallback text is used
3. The scan still completes

---

## MVP Constraints

| Constraint | Current MVP Behavior | Future Upgrade |
| --- | --- | --- |
| Scheduled scans | Manual scans only | Vercel Cron or background worker |
| Screenshot persistence on Vercel | Temporary `/tmp` path | Vercel Blob or S3 |
| Long crawls | Bounded to 5 pages on Vercel | Queue/background worker |
| Complex semantic contradictions | Rule-based only | More claim rules and configurable checks |
| Team management | Not included | Add organizations later |
| Billing | Not included | Add after validation |

---

## Validation

Run:

```bash
npm run typecheck
npm run build
```

Expected result:

```txt
Compiled successfully
```

---

## License

This MVP is currently private/proprietary unless a license is added.
