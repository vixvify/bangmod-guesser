import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/shared/errors/app.error";
import { createGameRecord, gameNow } from "../../fixtures/game";

const { requireAuth, repository } = await vi.hoisted(async () => {
  const { createGameRepositoryMock } = await import("../../mocks/game.repository.mock");
  return { requireAuth: vi.fn(), repository: createGameRepositoryMock() };
});
vi.mock("@/features/auth/server/auth-check", () => ({ requireAuth }));
vi.mock("@/container", async () => {
  const { GameService } = await import("@/features/game/server/game.service");
  return { gameService: new GameService(repository) };
});

import { POST } from "@/app/api/games/[id]/rounds/[questionNumber]/guess/route";
import { GET } from "@/app/api/games/[id]/rounds/[questionNumber]/result/route";

const guess = { guessedLatitude: 13.65, guessedLongitude: 100.49 };
let game: ReturnType<typeof createGameRecord>;

function submit(body: unknown = guess, questionNumber = "1") {
  return POST(new Request("http://localhost/api/games/game-1/rounds/1/guess", {
    method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" },
  }), { params: Promise.resolve({ id: "game-1", questionNumber }) });
}

function read(questionNumber = "1", id = "game-1") {
  return GET(new Request("http://localhost/api/games/game-1/rounds/1/result"), {
    params: Promise.resolve({ id, questionNumber }),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(gameNow.getTime() + 20_000));
  requireAuth.mockResolvedValue({ id: "player-1" });
  game = createGameRecord();
  game.rounds[0].startedAt = gameNow;
  repository.findGame.mockImplementation(async () => structuredClone(game));
  repository.saveGuess.mockImplementation(async (input) => {
    const round = game.rounds[input.questionNumber - 1];
    Object.assign(round, {
      guessedLatitude: input.guessedLatitude, guessedLongitude: input.guessedLongitude,
      score: input.score, playTimeSeconds: input.playTimeSeconds, status: "COMPLETED",
    });
    if (input.totalScore !== undefined) {
      game.status = "COMPLETED";
      game.totalScore = input.totalScore;
      game.finishedAt = input.finishedAt;
    }
  });
});
afterEach(() => vi.useRealTimers());

describe("recovering a recorded round after losing the POST response", () => {
  it("returns the exact saved result repeatedly after a duplicate POST receives 409", async () => {
    const original = await submit();
    expect(original.status).toBe(200);
    expect((await submit()).status).toBe(409);
    const recovered = await read();
    expect(recovered.status).toBe(200);
    expect(recovered.headers.get("cache-control")).toBe("private, no-store");
    const result = await recovered.json();
    expect(result).toEqual(await original.json());
    expect(await (await read()).json()).toEqual(result);
    expect(repository.saveGuess).toHaveBeenCalledOnce();
  });

  it("recovers the last result even after the fifth answer completes the game", async () => {
    game.rounds.forEach((round, index) => {
      round.startedAt = gameNow;
      if (index < 4) Object.assign(round, { status: "COMPLETED", score: 800, playTimeSeconds: 20, ...guess });
    });
    const original = await submit(guess, "5");
    expect(original.status).toBe(200);
    expect(game.status).toBe("COMPLETED");
    expect((await submit(guess, "5")).status).toBe(409);
    expect(await (await read("5")).json()).toEqual(await original.json());
    expect(repository.saveGuess).toHaveBeenCalledOnce();
  });

  it.each([guess, { guessedLatitude: null, guessedLongitude: null }])("persists and recovers a timeout without accepting a late guess %j", async (body) => {
    vi.setSystemTime(new Date(gameNow.getTime() + 40_000));
    const original = await submit(body);
    expect(original.status).toBe(200);
    expect(game.rounds[0]).toMatchObject({ score: 0, playTimeSeconds: 40, guessedLatitude: null, guessedLongitude: null });
    const result = await original.json();
    expect(result.data).toMatchObject({ timedOut: true, score: 0, distanceMeters: null });
    expect(await (await read()).json()).toEqual(result);
  });

  it("ignores client-supplied timestamps and scores after the server deadline", async () => {
    vi.setSystemTime(new Date(gameNow.getTime() + 40_000));
    const response = await submit({
      ...guess, startedAt: new Date(gameNow.getTime() + 60_000).toISOString(),
      finishedAt: gameNow.toISOString(), playTimeSeconds: 0, score: 1000,
    });
    expect((await response.json()).data).toMatchObject({ timedOut: true, score: 0 });
    expect(game.rounds[0].playTimeSeconds).toBe(40);
  });

  it.each([0, 90_000])("does not expose or finalize an unanswered round at %s ms", async (elapsed) => {
    vi.setSystemTime(new Date(gameNow.getTime() + elapsed));
    expect((await read()).status).toBe(409);
    expect(repository.saveGuess).not.toHaveBeenCalled();
  });

  it("requires authentication before reading the game", async () => {
    requireAuth.mockRejectedValue(new AppError("Unauthorized", 401));
    expect((await read()).status).toBe(401);
    expect(repository.findGame).not.toHaveBeenCalled();
  });

  it("rejects non-owners without revealing the saved result", async () => {
    await submit();
    requireAuth.mockResolvedValue({ id: "other-player" });
    expect((await read()).status).toBe(403);
  });

  it.each(["0", "6", "1.5", "abc"])("rejects invalid question number %s", async (question) => {
    expect((await read(question)).status).toBe(400);
    expect(repository.findGame).not.toHaveBeenCalled();
  });

  it("rejects an empty game ID", async () => {
    expect((await read("1", " ")).status).toBe(400);
    expect(repository.findGame).not.toHaveBeenCalled();
  });

  it("returns 404 for missing records and hides database details", async () => {
    repository.findGame.mockResolvedValue(null);
    expect((await read()).status).toBe(404);
    repository.findGame.mockRejectedValue(new Error("private database details"));
    expect(await (await read()).json()).toEqual({ error: "Internal server error", status: 500, statusCode: "ERROR" });
  });
});
