import { AppError } from "@/shared/errors/app.error";
import { shiftDateOnly, toBangkokStartOfDay } from "@/shared/lib/utils";
import type { ProfileResult } from "../profile";
import type { ProfileRepository } from "./profile.repository.port";
import type { ProfileQueryInput } from "../profile.schema";
import { ProfileFactory } from "./profile.factory";

const PROFILE_PAGE_SIZE = 4;

export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async getProfile(userId: string, options: ProfileQueryInput): Promise<ProfileResult> {
    const result = await this.profileRepository.findProfile(userId, {
      from: options.from ? toBangkokStartOfDay(options.from) : undefined,
      toExclusive: options.to
        ? toBangkokStartOfDay(shiftDateOnly(options.to, 1))
        : undefined,
      page: options.page,
      pageSize: PROFILE_PAGE_SIZE,
    });

    if (!result.user) throw new AppError("User not found", 404);

    return ProfileFactory.toProfile(
      result.user,
      result.totalGames,
      options.page,
      PROFILE_PAGE_SIZE,
    );
  }
}
