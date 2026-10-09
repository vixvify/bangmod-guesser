import type { PaginatedUsers, UserAccount } from "@/core/domain/user";
import { AppError } from "@/core/errors/app.error";
import type { UserAdminPort } from "@/core/ports/user-admin.port";
import type { UserRepository } from "@/core/ports/user.repository";
import type {
  SearchUserQuery,
  UserFormInput,
} from "@/core/schema/user.schema";
import { UserFactory } from "@/infrastructure/factories/user.factory";

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
    const existing = await this.userRepository.findById(id);
    if (!existing) throw new AppError("User not found", 404);

    const existingEndDate =
      existing.banExpires?.toISOString().slice(0, 10) ?? null;
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

    return this.getUser(id);
  }

  async deleteUser(headers: Headers, id: string): Promise<void> {
    const existing = await this.userRepository.findById(id);
    if (!existing) throw new AppError("User not found", 404);
    await this.userAdmin.removeUser(headers, { userId: id });
  }
}
