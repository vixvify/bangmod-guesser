import { AuthRepositoryImpl } from "./repositories/auth.repository";
import { SessionRepositoryImpl } from "./repositories/session.repository";
import { AuthService } from "@/core/service/auth.service";
import { SessionService } from "@/core/service/session.service";

const authRepository = new AuthRepositoryImpl();
const sessionRepository = new SessionRepositoryImpl();

export const authService = new AuthService(authRepository);
export const sessionService = new SessionService(sessionRepository);
