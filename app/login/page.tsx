import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { SignInButton } from "@/components/sign-in-button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center truth-grid px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center"><Logo /></div>
          <h1 className="mt-8 text-2xl font-semibold text-white">Sign in to TruthCI</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">Monitor product truth across your public website, docs, pricing pages, and changelog.</p>
          <div className="mt-8"><SignInButton /></div>
        </CardContent>
      </Card>
    </main>
  );
}
