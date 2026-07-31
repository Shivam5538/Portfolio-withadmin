import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Applying RLS and Security Policies to Database ===");

  const sqlPath = path.join(__dirname, "rls_setup.sql");
  const rawSql = fs.readFileSync(sqlPath, "utf-8");

  // Remove comment lines starting with --
  const cleanedSql = rawSql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  // Split SQL commands by semicolon and clean empty statements
  const statements = cleanedSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    console.log(`Executing SQL: ${statement.replace(/\s+/g, " ")}`);
    await prisma.$executeRawUnsafe(statement);
  }

  console.log("\n=== Verifying RLS Status for All Tables in Public Schema ===");

  const tables = await prisma.$queryRaw<Array<{ tablename: string; rowsecurity: boolean }>>`
    SELECT tablename, rowsecurity
    FROM pg_tables
    JOIN pg_class ON pg_tables.tablename = pg_class.relname
    WHERE schemaname = 'public';
  `;

  console.log("\nTables RLS Status:");
  console.table(tables);

  const disabledTables = tables.filter((t) => !t.rowsecurity);
  if (disabledTables.length > 0) {
    console.error("WARNING: The following tables still do NOT have RLS enabled:", disabledTables);
    process.exit(1);
  } else {
    console.log("SUCCESS: Every single table in the public schema has Row-Level Security (RLS) ENABLED!");
  }

  console.log("\n=== Active Policies in Public Schema ===");
  const policies = await prisma.$queryRaw<Array<{ tablename: string; policyname: string; roles: string[]; cmd: string }>>`
    SELECT 
      tablename, 
      policyname, 
      roles, 
      cmd 
    FROM pg_policies 
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname;
  `;

  console.table(policies);
}

main()
  .catch((e) => {
    console.error("Failed to apply RLS:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
