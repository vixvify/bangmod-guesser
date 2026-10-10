import { z } from "zod";

export const GameSettingsSchema = z.object({
  imageQuality: z.enum(["ultra", "medium", "low"]),
  systemSound: z.number().int().min(1).max(100),
  musicSound: z.number().int().min(1).max(100),
});

export type GameSettings = z.infer<typeof GameSettingsSchema>;
export type ImageQuality = GameSettings["imageQuality"];
