import { ImageRepositoryImpl } from "./features/images/repositories/image.repository";
import { ImageService } from "@/features/images/service/image.service";
import { LocationRepositoryImpl } from "./features/locations/repositories/location.repository";
import { LocationService } from "@/features/locations/service/location.service";
import { UserRepositoryImpl } from "./features/users/repositories/user.repository";
import { UserAdapter } from "./features/users/adapters/user.adapter";
import { UserService } from "@/features/users/service/user.service";
import { AuthAdapter } from "./features/auth/adapters/auth.adapter";
import { AuthService } from "@/features/auth/service/auth.service";
import { DashboardRepositoryImpl } from "./features/dashboard/repositories/dashboard.repository";
import { DashboardService } from "@/features/dashboard/service/dashboard.service";
import { GameRepositoryImpl } from "./features/game/repositories/game.repository";
import { GameService } from "@/features/game/service/game.service";
import { LeaderboardRepositoryImpl } from "./features/leaderboard/repositories/leaderboard.repository";
import { LeaderboardService } from "@/features/leaderboard/service/leaderboard.service";

const imageRepository = new ImageRepositoryImpl();
export const imageService = new ImageService(imageRepository);

const locationRepository = new LocationRepositoryImpl();
export const locationService = new LocationService(
  locationRepository,
  imageService,
);

export const userService = new UserService(new UserRepositoryImpl(), new UserAdapter());
export const authService = new AuthService(new AuthAdapter());
export const dashboardService = new DashboardService(new DashboardRepositoryImpl());
export const gameService = new GameService(new GameRepositoryImpl());

const leaderboardRepository = new LeaderboardRepositoryImpl();

export const leaderboardService = new LeaderboardService(
  leaderboardRepository,
);
