import { dbGet, dbRun } from "@/lib/db/client";
import { createId } from "@/lib/utils/ids";

export type UserRecord = {
  id: string;
  github_id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  created_at: string;
};

export async function upsertGithubUser(input: {
  githubId: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}) {
  const existing = await dbGet<UserRecord>("SELECT * FROM users WHERE github_id = ?", [input.githubId]);
  if (existing) {
    await dbRun("UPDATE users SET email = ?, name = ?, image = ? WHERE id = ?", [
      input.email ?? existing.email,
      input.name ?? existing.name,
      input.image ?? existing.image,
      existing.id
    ]);
    return (await dbGet<UserRecord>("SELECT * FROM users WHERE id = ?", [existing.id]))!;
  }

  const id = createId("user");
  await dbRun("INSERT INTO users (id, github_id, email, name, image) VALUES (?, ?, ?, ?, ?)", [
    id,
    input.githubId,
    input.email ?? null,
    input.name ?? null,
    input.image ?? null
  ]);
  return (await dbGet<UserRecord>("SELECT * FROM users WHERE id = ?", [id]))!;
}

export async function getUserById(id: string) {
  return dbGet<UserRecord>("SELECT * FROM users WHERE id = ?", [id]);
}
