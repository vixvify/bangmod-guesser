import { AuthRepositoryImpl } from "./repositories/auth.repository";
import { ImageRepositoryImpl } from "./repositories/image.repository";
import { SessionRepositoryImpl } from "./repositories/session.repository";
import { AuthService } from "@/core/service/auth.service";
import { ImageService } from "@/core/service/image.service";
import { SessionService } from "@/core/service/session.service";

const authRepository = new AuthRepositoryImpl();
const imageRepository = new ImageRepositoryImpl();
const sessionRepository = new SessionRepositoryImpl();

export const authService = new AuthService(authRepository);
export const imageService = new ImageService(imageRepository);
export const sessionService = new SessionService(sessionRepository);
