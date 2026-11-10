import { randomUUID } from "node:crypto";
import { beforeEach, afterEach, afterAll, describe, expect, it, vi } from "vitest";
vi.mock("@/shared/lib/prisma", async () => {
  const { PrismaClient } = await import("@prisma/client");
  const { E2E_DATABASE_URL } = await import("../../../e2e/config");
  return { prisma: new PrismaClient({datasourceUrl:E2E_DATABASE_URL}) };
});
import { prisma } from "@/shared/lib/prisma";
import { GameRepositoryImpl } from "@/features/game/server/game.repository";
import { GameService } from "@/features/game/server/game.service";
const repository = new GameRepositoryImpl();
const service = new GameService(repository);
const now = new Date();
const guess = {guessedLatitude:13.65,guessedLongitude:100.49};

describe.skipIf(process.env.RUN_GAME_DATABASE_TESTS !== "1")("Game API persistence with real PostgreSQL", () => {
  let userId: string;
  let locationIds: string[];
  let gameId: string;
  beforeEach(async () => {
    const suffix=randomUUID();userId=`game-api-${suffix}`;
    locationIds=Array.from({length:5},(_,i)=>`game-location-${suffix}-${i}`);
    await prisma.user.create({data:{id:userId,name:"Game API test",email:`${suffix}@example.test`}});
    for (const id of locationIds) await prisma.location.create({data:{id,name:"Test location",latitude:13.65,longitude:100.49,images:{create:[{imageNumber:2,imageUrl:`https://example.test/${id}/2`},{imageNumber:5,imageUrl:`https://example.test/${id}/5`}]}}});
    gameId=(await repository.createGame(userId,locationIds.map((locationId,i)=>({locationId,questionNumber:i+1,imageNumber:5})))).id;
  });
  afterEach(async () => {
    await prisma.user.deleteMany({where:{id:userId}});
    await prisma.location.deleteMany({where:{id:{in:locationIds}}});
  });
  afterAll(async () => {await prisma.$disconnect();});
  it("persists all five preselected images and preserves first-open time across simultaneous reads", async () => {
    const initial=await repository.findGame(gameId);
    expect(initial?.rounds).toHaveLength(5);
    expect(initial?.rounds.every((r)=>r.imageNumber===5 && r.startedAt===null)).toBe(true);
    const opened=await Promise.all([service.currentRound(gameId,userId,now),service.currentRound(gameId,userId,new Date(now.getTime()+1000))]);
    expect(opened[0]).toEqual(opened[1]);
    const startedAt=(await repository.findGame(gameId))?.rounds[0].startedAt;
    await service.currentRound(gameId,userId,new Date(now.getTime()+10000));
    expect((await repository.findGame(gameId))?.rounds[0].startedAt).toEqual(startedAt);
  });
  it("allows only one of two simultaneous guesses to persist", async () => {
    await service.currentRound(gameId,userId,now);
    const results=await Promise.allSettled([service.submitGuess(gameId,userId,1,guess,now),service.submitGuess(gameId,userId,1,guess,now)]);
    expect(results.filter((r)=>r.status==="fulfilled")).toHaveLength(1);
    const rejected=results.find((r)=>r.status==="rejected");
    expect(rejected?.status==="rejected" && rejected.reason.status).toBe(409);
    const game=await repository.findGame(gameId);
    expect(game?.rounds.filter((r)=>r.status==="COMPLETED")).toHaveLength(1);
    expect(game?.rounds[0].score).toBe(1000);
  });
  it("atomically finishes the fifth round with the stored final score", async () => {
    for(let question=1;question<=5;question++) {
      await service.currentRound(gameId,userId,now);
      await service.submitGuess(gameId,userId,question,guess,new Date(now.getTime()+20000));
    }
    const game=await repository.findGame(gameId);
    expect(game).toMatchObject({status:"COMPLETED",totalScore:5000});
    expect(game?.rounds.every((r)=>r.status==="COMPLETED" && r.playTimeSeconds===20)).toBe(true);
  });
  it("rolls back round five if saving the game total fails", async () => {
    await prisma.gameRound.updateMany({where:{gameId,questionNumber:{lt:5}},data:{status:"COMPLETED",score:1000,playTimeSeconds:20,guessedLatitude:13.65,guessedLongitude:100.49}});
    await service.currentRound(gameId,userId,now);
    await expect(repository.saveGuess({gameId,userId,questionNumber:5,...guess,score:1000,playTimeSeconds:20,finishedAt:now,totalScore:2**40})).rejects.toThrow();
    const game=await repository.findGame(gameId);
    expect(game?.status).toBe("PLAYING");
    expect(game?.rounds[4]).toMatchObject({status:"PENDING",score:0,guessedLatitude:null});
  });
  it("serializes final completion against exit without overwriting either terminal state", async () => {
    await prisma.gameRound.updateMany({where:{gameId,questionNumber:{lt:5}},data:{status:"COMPLETED",score:1000,playTimeSeconds:20,guessedLatitude:13.65,guessedLongitude:100.49}});
    await service.currentRound(gameId,userId,now);
    await Promise.allSettled([service.submitGuess(gameId,userId,5,guess,now),service.exitGame(gameId,userId,now)]);
    const game=await repository.findGame(gameId);
    if(game?.status==="COMPLETED") expect(game).toMatchObject({totalScore:5000,rounds:expect.arrayContaining([expect.objectContaining({questionNumber:5,status:"COMPLETED"})])});
    else {expect(game?.status).toBe("INCOMPLETE");expect(game?.rounds[4].status).toBe("PENDING");}
  });
  it("leaves no partial game when creation fails", async () => {
    const before=await prisma.game.count({where:{userId}});
    await expect(repository.createGame(userId,locationIds.map((locationId,i)=>({locationId,questionNumber:i+1,imageNumber:i===4?999:2})))).rejects.toMatchObject({status:409});
    expect(await prisma.game.count({where:{userId}})).toBe(before);
  });
  it("makes concurrent timeout submissions save zero only once and allows result recovery", async () => {
    await service.currentRound(gameId, userId, now);
    const expiredAt = new Date(now.getTime() + 40000);
    const outcomes = await Promise.allSettled([
      service.submitGuess(gameId, userId, 1, guess, expiredAt),
      service.submitGuess(gameId, userId, 1, guess, expiredAt),
    ]);
    expect(outcomes.filter((outcome) => outcome.status === "fulfilled")).toHaveLength(1);
    const game = await repository.findGame(gameId);
    expect(game?.rounds[0]).toMatchObject({ status: "COMPLETED", score: 0, playTimeSeconds: 40, guessedLatitude: null, guessedLongitude: null });
    expect(await service.roundResult(gameId, userId, 1)).toMatchObject({ timedOut: true, score: 0, guessedLatitude: null });
  });

});
