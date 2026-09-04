import { authService } from "@/infrastructure/container";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const user = await authService.login(await request.json());

    return successResponse(user);
  } catch (error) {
    return errorResponse(error);
  }
}
