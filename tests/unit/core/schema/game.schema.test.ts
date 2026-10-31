import { describe, expect, it } from "vitest";
import { GameIdSchema } from "@/core/schema/game.schema";

describe("GameIdSchema", () => {
  it("accepts and trims an opaque game ID", () => {
    expect(GameIdSchema.parse(" game-1 ")).toBe("game-1");
  });

  it.each([undefined, null, 123, "", "   ", "x".repeat(129)])("rejects an invalid ID: %s", (id) => {
    expect(GameIdSchema.safeParse(id).success).toBe(false);
  });
});
