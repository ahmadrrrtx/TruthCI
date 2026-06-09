import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export function EmptyState({ title, description, href, action }: { title: string; description: string; href: string; action: string }) {
  return (
    <Card className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
      <PlusCircle className="h-10 w-10 text-violet-300" />
      <h2 className="mt-4 text-xl font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-slate-400">{description}</p>
      <Link href={href} className="mt-6"><Button>{action}</Button></Link>
    </Card>
  );
}
