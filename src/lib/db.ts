import { readdir, readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";

const globalForDb = globalThis as unknown as {
  pgPool?: pg.Pool;
  pglite?: Promise<PGlite>;
};

export async function sql<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  if (databaseUrl !== "") {
    globalForDb.pgPool ??= new pg.Pool({ connectionString: databaseUrl, max: 5 });
    return (await globalForDb.pgPool.query(text, params)).rows as T[];
  }
  globalForDb.pglite ??= startLocal().catch((error: unknown) => {
    globalForDb.pglite = undefined;
    throw error;
  });
  return (await (await globalForDb.pglite).query<T>(text, params)).rows;
}

async function startLocal(): Promise<PGlite> {
  const db = new PGlite();
  const files = (await readdir("migrations").catch(() => [])).filter((file) => file.endsWith(".sql")).sort();
  for (const file of files) {
    await db.exec(await readFile(`migrations/${file}`, "utf8"));
  }
  return db;
}
