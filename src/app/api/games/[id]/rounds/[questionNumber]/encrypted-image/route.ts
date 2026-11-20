import { gameService } from "@/container";
import { GameIdSchema, QuestionNumberSchema } from "@/features/game/game.schema";
import { secureRoute } from "@/shared/lib/security/route";
import { parseSchema } from "@/shared/lib/validation";

export const GET = secureRoute<{ params: Promise<{ id: string; questionNumber: string }> }>(
  { access: "authenticated", rateLimit: "read" },
  async (_request, context, user) => {
    const { id, questionNumber } = await context.params;
    const image = await gameService.encryptedRoundImage(
      parseSchema(GameIdSchema, id),
      user.id,
      parseSchema(QuestionNumberSchema, questionNumber),
    );
    const body = new ReadableStream<Uint8Array<ArrayBuffer>>({
      start(controller) {
        controller.enqueue(image);
        controller.close();
      },
    });
    return new Response(body, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  },
);
