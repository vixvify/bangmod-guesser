import { AuthRepositoryImpl } from "./repositories/auth.repository";
import { AuthService } from "@/core/service/auth.service";

const authRepository = new AuthRepositoryImpl();

export const authService = new AuthService(authRepository);
