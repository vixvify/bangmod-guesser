import { gameService } from "@/container";
import {
  GameIdSchema,
  QuestionNumberSchema,
} from "@/features/game/game.schema";
import { readJson } from "@/shared/lib/json";
import { successResponse } from "@/shared/lib/api-response";
import { secureRoute } from "@/shared/lib/security/route";
import { parseSchema } from "@/shared/lib/validation";

export const GET = secureRoute<{ params: Promise<{ id: string }> }>(
  { access: "authenticated", rateLimit: "read" },
  async (_request, context, user) => {
    const id = parseSchema(GameIdSchema, (await context.params).id);
    const response = successResponse(
      await gameService.currentRound(id, user.id),
    );
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  },
);

export const POST = secureRoute<{ params: Promise<{ id: string }> }>(
  { access: "authenticated", rateLimit: "mutation" },
  async (request, context, user) => {
    const { id } = await context.params;
    const body = await readJson(request);
    const value =
      typeof body === "object" && body !== null && "questionNumber" in body
        ? body.questionNumber
        : undefined;
    const questionNumber = parseSchema(
      QuestionNumberSchema,
      typeof value === "number" ? String(value) : value,
    );
    const response = successResponse(
      await gameService.startRound(
        parseSchema(GameIdSchema, id),
        user.id,
        questionNumber,
      ),
    );
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  },
);
