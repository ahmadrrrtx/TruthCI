import fs from "node:fs";
import path from "node:path";
import { dbExec } from "./client";

let migrated = false;

export async function migrate() {
  if (migrated) return;
  const schema = fs.readFileSync(path.join(process.cwd(), "lib/db/schema.sql"), "utf8");
  await dbExec(schema);
  migrated = true;
}
