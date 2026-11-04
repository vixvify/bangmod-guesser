import { ImageRepositoryImpl } from "./features/images/server/image.repository";
import { ImageService } from "@/features/images/server/image.service";
import { LocationRepositoryImpl } from "./features/locations/server/location.repository";
import { LocationService } from "@/features/locations/server/location.service";
import { UserRepositoryImpl } from "./features/users/server/user.repository";
import { UserAdapter } from "./features/users/server/user.adapter";
import { UserService } from "@/features/users/server/user.service";
import { AuthAdapter } from "./features/auth/server/auth.adapter";
import { AuthService } from "@/features/auth/server/auth.service";
import { DashboardRepositoryImpl } from "./features/dashboard/server/dashboard.repository";
import { DashboardService } from "@/features/dashboard/server/dashboard.service";
import { GameRepositoryImpl } from "./features/game/server/game.repository";
import { GameService } from "@/features/game/server/game.service";
import { LeaderboardRepositoryImpl } from "./features/leaderboard/server/leaderboard.repository";
import { LeaderboardService } from "@/features/leaderboard/server/leaderboard.service";
import { ProfileRepositoryImpl } from "./features/profile/server/profile.repository";
import { ProfileService } from "@/features/profile/server/profile.service";

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
export const profileService = new ProfileService(new ProfileRepositoryImpl());
