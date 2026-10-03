import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

import { promoteInitialAdmin } from "./seed-admin";
import { config } from "@/lib/config";

loadEnvConfig(process.cwd());

async function main() {
  const email = config.initialAdminEmail;
  const database = new PrismaClient();

  try {
    const result = await promoteInitialAdmin(database, email);
    console.info(result === "promoted" ? "Initial admin promoted." : "Initial admin already configured.");
  } finally {
    await database.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
