import { z } from "zod";

export const GameSettingsSchema = z.object({
  systemSound: z.number().int().min(1).max(100),
  musicSound: z.number().int().min(1).max(100),
});

export type GameSettings = z.infer<typeof GameSettingsSchema>;
