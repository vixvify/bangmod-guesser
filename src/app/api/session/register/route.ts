import { CreateUserSchema } from "@/features/auth/auth.schema";
import { authService } from "@/container";
import { errorResponse, successResponse } from "@/shared/lib/api-response";
import { readJson } from "@/shared/lib/json";
import { parseSchema } from "@/shared/lib/validation";

export async function POST(request: Request) {
  try {
    const input = parseSchema(CreateUserSchema, await readJson(request));
    await authService.signUp(request.headers, input);
    return successResponse(null, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
