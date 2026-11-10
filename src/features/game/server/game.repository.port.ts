import type { GameStateRecord, GameCandidateRecord, GamePlayRecord } from "../../../../prisma/types/game";
import type { NewGameRound, SaveGameGuess } from "../game";

export interface GameRepository {
  findCandidates(): Promise<GameCandidateRecord[]>;
  createGame(userId: string, rounds: NewGameRound[]): Promise<{ id: string }>;
  findGame(id: string): Promise<GamePlayRecord | null>;
  openRound(id: string, userId: string, questionNumber: number, now: Date): Promise<GamePlayRecord>;
  saveGuess(input: SaveGameGuess): Promise<void>;
  findById(id: string): Promise<GameStateRecord | null>;
  exitPlayingGame(id: string, userId: string, finishedAt: Date): Promise<GameStateRecord | null>;
}
