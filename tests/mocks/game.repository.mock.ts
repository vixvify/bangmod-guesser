import { vi } from "vitest";
import type { GameRepository } from "@/features/game/server/game.repository.port";

export function createGameRepositoryMock() {
  return {
    saveGuess: vi.fn<GameRepository["saveGuess"]>(),
    findGame: vi.fn<GameRepository["findGame"]>(),
    openRound: vi.fn<GameRepository["openRound"]>(),
    findCandidates: vi.fn<GameRepository["findCandidates"]>(),
    createGame: vi.fn<GameRepository["createGame"]>(),
    findById: vi.fn<GameRepository["findById"]>(),
    exitPlayingGame: vi.fn<GameRepository["exitPlayingGame"]>(),
  } satisfies GameRepository;
}
