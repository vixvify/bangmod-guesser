import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "@/features/settings/settings.constants";
import { GameSettingsSchema } from "@/features/settings/settings.schema";

describe("GameSettingsSchema", () => {
  it("accepts the default settings", () => {
    expect(GameSettingsSchema.parse(DEFAULT_SETTINGS)).toEqual(DEFAULT_SETTINGS);
  });

  it("accepts sound levels down to 0", () => {
    expect(GameSettingsSchema.safeParse({
      systemSound: 0,
      musicSound: 0,
    }).success).toBe(true);
  });

  it("rejects sound levels outside 0–100", () => {
    expect(GameSettingsSchema.safeParse({
      systemSound: -1,
      musicSound: 101,
    }).success).toBe(false);
  });
});
