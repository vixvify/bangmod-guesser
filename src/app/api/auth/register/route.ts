import { authService } from "@/infrastructure/container";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const user = await authService.register(await request.json());

    return successResponse(user, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
