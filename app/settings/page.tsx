/* eslint-disable @next/next/no-img-element */
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SignOutButton } from "@/components/sign-out-button";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <AppShell>
      <PageHeader title="Settings" description="MVP account settings." />
      <Card className="max-w-2xl"><CardContent>
        <div className="flex items-center gap-4">
          {user.image ? <img src={user.image} alt="" className="h-14 w-14 rounded-full" /> : null}
          <div><div className="font-medium text-white">{user.name ?? "GitHub user"}</div><div className="text-sm text-slate-400">{user.email ?? "No email exposed by GitHub"}</div></div>
        </div>
        <div className="mt-8"><SignOutButton /></div>
      </CardContent></Card>
    </AppShell>
  );
}
