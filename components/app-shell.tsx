import Link from "next/link";
import { Logo } from "./logo";
import { SignOutButton } from "./sign-out-button";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen truth-grid">
      <header className="sticky top-0 z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/dashboard"><Logo /></Link>
          <nav className="flex items-center gap-2 text-sm text-slate-300">
            <Link className="rounded-lg px-3 py-2 hover:bg-slate-800" href="/dashboard">Dashboard</Link>
            <Link className="rounded-lg px-3 py-2 hover:bg-slate-800" href="/projects/new">New Project</Link>
            <Link className="rounded-lg px-3 py-2 hover:bg-slate-800" href="/settings">Settings</Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
