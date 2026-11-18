import { redirect } from "next/navigation";
import { authCheck } from "@/features/auth/server/auth-check";
import { gameService } from "@/container";
import { AppRoutes } from "@/shared/routes/routes";

export default async function GameRootPage() {
  const user = await authCheck();
  if (user) {
    try {
      await gameService.exitActiveGame(user.id);
    } catch {
      // Ignore if no active game or already exited
    }
  }

  redirect(AppRoutes.home);
}
