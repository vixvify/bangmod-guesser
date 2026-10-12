import { ImageRepositoryImpl } from "./repositories/image.repository";
import { ImageService } from "@/core/service/image.service";
import { LocationRepositoryImpl } from "./repositories/location.repository";
import { LocationService } from "@/core/service/location.service";
import { UserRepositoryImpl } from "./repositories/user.repository";
import { UserAdapter } from "./adapters/user.adapter";
import { UserService } from "@/core/service/user.service";
import { AuthAdapter } from "./adapters/auth.adapter";
import { AuthService } from "@/core/service/auth.service";

const imageRepository = new ImageRepositoryImpl();
export const imageService = new ImageService(imageRepository);

const locationRepository = new LocationRepositoryImpl();
export const locationService = new LocationService(
  locationRepository,
  imageService,
);

export const userService = new UserService(new UserRepositoryImpl(), new UserAdapter());
export const authService = new AuthService(new AuthAdapter());
