const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const dbLib = require("../lib/db");

const { openDatabase } = dbLib;

async function main() {
  const databaseUrl = process.env.DATABASE_URL || "";

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured. Add your Supabase Postgres connection string first.");
  }

  if (!/^postgres(ql)?:\/\//i.test(databaseUrl)) {
    throw new Error("DATABASE_URL must be a full Postgres connection string, including the postgres:// or postgresql:// prefix.");
  }

  const db = await openDatabase({
    connectionString: databaseUrl
  });

  await db.close();
  console.log("Supabase Postgres schema and seed data are ready.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
