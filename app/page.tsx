import Link from "next/link";
import { ArrowRight, GitCompare, Globe, SearchCheck, ShieldAlert } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const examples = [
  ["Website", "Unlimited API requests"],
  ["Pricing", "100k requests/month"],
  ["Docs", "Rate limits apply"],
  ["API behavior", "429 after 10k requests"]
];

export default function LandingPage() {
  return (
    <main className="min-h-screen truth-grid">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <Logo />
        <Link href="/dashboard"><Button variant="secondary">Dashboard</Button></Link>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <div className="mx-auto inline-flex rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-200">
          Git Diff + Website Monitoring + Documentation Drift Detection
        </div>
        <h1 className="mx-auto mt-8 max-w-4xl text-balance text-5xl font-semibold tracking-tight text-white md:text-7xl">
          Catch Product Contradictions Before Your Users Do
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-balance text-lg leading-8 text-slate-300">
          TruthCI continuously monitors your website, docs, pricing, and public product information to detect inconsistencies, regressions, and trust-breaking changes.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Link href="/dashboard"><Button size="lg">Start Monitoring <ArrowRight className="h-5 w-5" /></Button></Link>
          <a href="#how"><Button size="lg" variant="secondary">See how it works</Button></a>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 md:grid-cols-4">
        {examples.map(([source, claim]) => (
          <Card key={source} className="border-red-500/20 bg-red-950/10">
            <CardContent>
              <div className="text-sm text-red-200">{source}</div>
              <div className="mt-2 text-lg font-semibold text-white">“{claim}”</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section id="how" className="mx-auto grid max-w-6xl gap-4 px-4 pb-24 md:grid-cols-3">
        {[
          [Globe, "Crawl public surfaces", "Bounded Playwright scans extract visible text, headings, links, HTML, and screenshots from landing, docs, pricing, and changelog pages."],
          [GitCompare, "Diff snapshots", "TruthCI stores snapshots and uses deterministic jsdiff output to detect added, removed, and modified product language."],
          [SearchCheck, "Find contradictions", "Rule-based claim detection flags conflicts like unlimited usage vs rate limits, no credit card vs required billing, and SOC 2 certified vs coming soon."],
        ].map(([Icon, title, body]) => {
          const LucideIcon = Icon as typeof ShieldAlert;
          return (
            <Card key={String(title)}>
              <CardContent>
                <LucideIcon className="h-8 w-8 text-violet-300" />
                <h2 className="mt-4 text-xl font-semibold text-white">{String(title)}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{String(body)}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </main>
  );
}
