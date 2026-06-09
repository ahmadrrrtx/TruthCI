import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";

type LocalDb = {
  prepare: (sql: string) => {
    get: (...args: unknown[]) => unknown;
    all: (...args: unknown[]) => unknown[];
    run: (...args: unknown[]) => unknown;
  };
  exec: (sql: string) => void;
  pragma: (sql: string) => void;
};

let localDb: LocalDb | undefined;
let tursoClient: Client | undefined;

function isTursoConfigured() {
  return Boolean(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
}

function resolveDatabasePath() {
  const configured = process.env.DATABASE_PATH;
  if (!configured && process.env.VERCEL) return path.join("/tmp", "truthci.db");
  if (!configured) return path.join(process.cwd(), "data", "truthci.db");
  return path.isAbsolute(configured) ? configured : path.join(process.cwd(), configured);
}

async function getLocalDb() {
  if (!localDb) {
    const Database = (await import("better-sqlite3")).default;
    const resolvedDbPath = resolveDatabasePath();
    fs.mkdirSync(path.dirname(resolvedDbPath), { recursive: true });
    localDb = new Database(resolvedDbPath) as LocalDb;
    localDb.pragma("foreign_keys = ON");
    localDb.pragma("journal_mode = WAL");
  }
  return localDb;
}

function getTursoClient() {
  if (!tursoClient) {
    tursoClient = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!
    });
  }
  return tursoClient;
}

export async function dbGet<T>(sql: string, args: unknown[] = []) {
  if (isTursoConfigured()) {
    const result = await getTursoClient().execute({ sql, args: args as never[] });
    return (result.rows[0] as T | undefined) ?? undefined;
  }
  return (await getLocalDb()).prepare(sql).get(...args) as T | undefined;
}

export async function dbAll<T>(sql: string, args: unknown[] = []) {
  if (isTursoConfigured()) {
    const result = await getTursoClient().execute({ sql, args: args as never[] });
    return result.rows as T[];
  }
  return (await getLocalDb()).prepare(sql).all(...args) as T[];
}

export async function dbRun(sql: string, args: unknown[] = []) {
  if (isTursoConfigured()) {
    await getTursoClient().execute({ sql, args: args as never[] });
    return;
  }
  (await getLocalDb()).prepare(sql).run(...args);
}

export async function dbExec(sql: string) {
  if (isTursoConfigured()) {
    const statements = sql
      .split(/;\s*\n/)
      .map((statement) => statement.trim())
      .filter(Boolean);
    for (const statement of statements) {
      await getTursoClient().execute(statement);
    }
    return;
  }
  (await getLocalDb()).exec(sql);
}

export function getDatabaseProvider() {
  return isTursoConfigured() ? "turso" : "better-sqlite3";
}
