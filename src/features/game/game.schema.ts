import { z } from "zod";

export const GameIdSchema = z.string().trim().min(1, "Game ID is required").max(128, "Game ID is too long");

export const QuestionNumberSchema = z.string().regex(/^[1-5]$/, "Question number must be 1–5").transform(Number);

export const GuessSchema = z.object({
  guessedLatitude: z.number().min(-90).max(90),
  guessedLongitude: z.number().min(-180).max(180),
});

export type GuessInput = z.infer<typeof GuessSchema>;
