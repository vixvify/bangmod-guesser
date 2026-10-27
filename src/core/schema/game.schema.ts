import { z } from "zod";

export const GameIdSchema = z.string().trim().min(1, "Game ID is required").max(128, "Game ID is too long");
