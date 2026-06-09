import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./config";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");
  return user;
}

export async function requireApiUser() {
  const session = await getSession();
  if (!session?.user?.id) {
    throw Object.assign(new Error("Unauthorized"), { status: 401 });
  }
  return session.user;
}
