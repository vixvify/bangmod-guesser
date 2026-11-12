import type { LeaderboardResult } from "@/features/leaderboard/leaderboard";
import type { LeaderboardRepository } from "@/features/leaderboard/server/leaderboard.repository.port";
import type { LeaderboardQueryRecord } from "../../../../prisma/types/leaderboard";
import { prisma } from "@/shared/lib/prisma";

export class LeaderboardRepositoryImpl implements LeaderboardRepository {
  async findLeaderboard(
    userId: string,
  ): Promise<LeaderboardResult> {
    const records = await prisma.$queryRaw<LeaderboardQueryRecord[]>`
      WITH leaderboard AS (
        SELECT
          u.id AS "userId",
          u.name,
          u.image,
          COUNT(g.id)::int AS "gamesPlayed",
          COALESCE(SUM(g."totalScore"), 0)::int AS "totalScore"
        FROM users u
        INNER JOIN games g
          ON g."userId" = u.id
        WHERE
          g.status = 'COMPLETED'
          AND g."totalScore" IS NOT NULL
        GROUP BY u.id, u.name, u.image
      ),
      ranked_leaderboard AS (
        SELECT
          "userId",
          name,
          image,
          "gamesPlayed",
          "totalScore",
          ROW_NUMBER() OVER (
            ORDER BY
              "totalScore" DESC,
              "gamesPlayed" ASC,
              name ASC,
              "userId" ASC
          )::int AS rank
        FROM leaderboard
      )
      SELECT
        "userId",
        name,
        image,
        "gamesPlayed",
        "totalScore",
        rank
      FROM ranked_leaderboard
      WHERE rank <= 10 OR "userId" = ${userId}
      ORDER BY rank ASC
    `;

    const toEntry = ({
      rank,
      name,
      image,
      gamesPlayed,
      totalScore,
    }: LeaderboardQueryRecord) => ({
      rank,
      name,
      image: image ?? null,
      gamesPlayed,
      totalScore,
    });

    const currentUser = records.find(
      (record) => record.userId === userId,
    );

    return {
      entries: records
        .filter((record) => record.rank <= 10)
        .map(toEntry),
      myRank: currentUser ? toEntry(currentUser) : null,
    };
  }
}
