import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "@/features/settings/constants/settings";
import { GameSettingsSchema } from "@/features/settings/schema/settings.schema";

describe("GameSettingsSchema", () => {
  it("accepts the default settings", () => {
    expect(GameSettingsSchema.parse(DEFAULT_SETTINGS)).toEqual(DEFAULT_SETTINGS);
  });

  it("rejects unsupported image quality and sound levels outside 1–100", () => {
    expect(GameSettingsSchema.safeParse({
      imageQuality: "maximum",
      systemSound: 0,
      musicSound: 101,
    }).success).toBe(false);
  });
});
