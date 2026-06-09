"use client";

import { signIn } from "next-auth/react";
import { GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignInButton({ label = "Continue with GitHub" }: { label?: string }) {
  return (
    <Button onClick={() => signIn("github", { callbackUrl: "/dashboard" })} size="lg">
      <GitBranch className="h-5 w-5" /> {label}
    </Button>
  );
}
