import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

import { seedInitialAdmin } from "@/infrastructure/seed-initial-admin";
import { config } from "@/lib/config";

loadEnvConfig(process.cwd());

async function main() {
  const email = config.initialAdminEmail;
  const database = new PrismaClient();

  try {
    const result = await seedInitialAdmin(database, email);
    console.info(
      result === "promoted"
        ? "Initial admin promoted."
        : "Initial admin already configured.",
    );
  } finally {
    await database.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
