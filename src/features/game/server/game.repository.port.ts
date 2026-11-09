import type { GameStateRecord } from "../../../../prisma/types/game";
import type { GameCandidateRecord } from "../../../../prisma/types/game";
import type { NewGameRound } from "../game";

export interface GameRepository {
  findCandidates(): Promise<GameCandidateRecord[]>;
  createGame(userId: string, rounds: NewGameRound[]): Promise<{ id: string }>;
  findById(id: string): Promise<GameStateRecord | null>;
  exitPlayingGame(id: string, userId: string, finishedAt: Date): Promise<GameStateRecord | null>;
}
