import { CreateUserSchema, RegisterSchema } from "@/core/schema/auth.schema";
import { authService } from "@/infrastructure/container";
import { errorResponse, successResponse } from "@/lib/api-response";
import { parseSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const registration = parseSchema(RegisterSchema, await request.json());
    const input = parseSchema(CreateUserSchema, registration);
    await authService.signUp(request.headers, input);
    return successResponse(null, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
