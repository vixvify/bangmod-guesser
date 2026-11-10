import { describe, expect, it } from "vitest";
import { GuessSchema, QuestionNumberSchema } from "@/features/game/game.schema";
describe("guess validation", () => {
  it("accepts boundary coordinates", () => {expect(GuessSchema.parse({guessedLatitude:-90,guessedLongitude:180})).toEqual({guessedLatitude:-90,guessedLongitude:180});});
  it.each([NaN,Infinity,-Infinity,"13",null])("rejects non-finite or non-numeric coordinates %s", (value) => {expect(GuessSchema.safeParse({guessedLatitude:value,guessedLongitude:100}).success).toBe(false);});
  it("parses URL question numbers without accepting decimal or scientific syntax", () => {expect(QuestionNumberSchema.parse("5")).toBe(5);expect(QuestionNumberSchema.safeParse("1.0").success).toBe(false);expect(QuestionNumberSchema.safeParse("1e0").success).toBe(false);});
  it("allows both coordinates to be null for timeout finalization but rejects a partial guess", () => {
    expect(GuessSchema.safeParse({ guessedLatitude: null, guessedLongitude: null }).success).toBe(true);
    expect(GuessSchema.safeParse({ guessedLatitude: 13.65, guessedLongitude: null }).success).toBe(false);
  });

});
