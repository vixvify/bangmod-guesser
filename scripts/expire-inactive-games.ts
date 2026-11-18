import { GameRepositoryImpl } from "@/features/game/server/game.repository";
import { GameService } from "@/features/game/server/game.service";
import { prisma } from "@/shared/lib/prisma";

async function main() {
  try {
    const count = await new GameService(new GameRepositoryImpl()).expireInactiveGames();
    console.info(`Closed ${count} inactive games`);
  } catch (error) {
    console.error("Failed to close inactive games", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
