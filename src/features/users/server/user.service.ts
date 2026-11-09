import type { PaginatedUsers, UserAccount } from "@/features/users/user";
import { AppError } from "@/shared/errors/app.error";
import type { UserAdminPort } from "@/features/users/server/user-admin.port";
import type { UserRepository } from "@/features/users/server/user.repository.port";
import type {
  SearchUserQuery,
  UserFormInput,
} from "@/features/users/user.schema";
import { UserFactory } from "@/features/users/server/user.factory";
import { formatDateOnly } from "@/shared/lib/utils";
import { handleAuthError } from "@/features/auth/server/auth-error";

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAdmin: UserAdminPort,
  ) {}

  async getUsers(query: SearchUserQuery): Promise<PaginatedUsers> {
    const { items, total } = await this.userRepository.findMany(query);
    return {
      users: items.map(UserFactory.toAccount),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async getUser(id: string): Promise<UserAccount> {
    const record = await this.userRepository.findById(id);
    if (!record) throw new AppError("User not found", 404);
    return UserFactory.toAccount(record);
  }

  async updateUser(
    headers: Headers,
    id: string,
    input: UserFormInput,
  ): Promise<UserAccount> {
    try {
    const existing = await this.userRepository.findById(id);
    if (!existing) throw new AppError("User not found", 404);

    const existingEndDate = existing.banExpires
      ? formatDateOnly(existing.banExpires)
      : null;
    const nextEndDate =
      input.status === "SUSPENDED" ? input.suspension.endDate : null;
    const statusChanged = input.status !== existing.status;
    const suspensionChanged =
      input.status === "SUSPENDED" &&
      (!existing.banned ||
        existingEndDate !== nextEndDate ||
        existing.banReason !== (input.reason || null));
    const expiresIn = nextEndDate
      ? Math.floor((new Date(nextEndDate).getTime() - Date.now()) / 1000)
      : undefined;
    if (
      (statusChanged || suspensionChanged) &&
      expiresIn !== undefined &&
      expiresIn <= 0
    ) {
      throw new AppError("End date must be in the future", 400);
    }

    if (input.name !== existing.name) {
      await this.userAdmin.updateName(headers, { userId: id, data: { name: input.name } });
    }
    if (input.role !== existing.role) {
      await this.userAdmin.setRole(headers, { userId: id, role: input.role });
    }

    if (statusChanged || suspensionChanged) {
      if (input.status === "SUSPENDED") {
        await this.userAdmin.banUser(headers, {
          userId: id,
          banReason: input.reason || undefined,
          banExpiresIn: expiresIn,
        });
      } else if (existing.banned) {
        await this.userAdmin.unbanUser(headers, { userId: id });
      }

      if (statusChanged)
        await this.userRepository.updateStatus(id, input.status);
    }

    return await this.getUser(id);
    } catch (error) {
      return handleAuthError(error, "User update failed");
    }
  }

  async deleteUser(headers: Headers, id: string): Promise<void> {
    try {
    const existing = await this.userRepository.findById(id);
    if (!existing) throw new AppError("User not found", 404);
    await this.userAdmin.removeUser(headers, { userId: id });
    } catch (error) {
      handleAuthError(error, "User deletion failed");
    }
  }
}
