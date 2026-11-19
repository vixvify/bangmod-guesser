"use client";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { EditNameModal } from "@/features/profile/components/edit-name-modal";
import { Button } from "@/shared/components/ui/button";
import { PROFILE_MESSAGES } from "@/features/profile/profile.constants";
import httpClient from "@/shared/lib/http";
import { ProfileRoutes } from "@/features/profile/profile.routes";
import { getProfileImageUrl } from "@/shared/lib/profile-image";
import { playSoundEffect } from "@/shared/lib/sound-effect";
import { AppRoutes } from "@/shared/routes/routes";
import { getErrorMessage } from "@/shared/lib/error-message";
import type { LeaderboardEntry } from "@/features/leaderboard/leaderboard";

type ProfileCardProps = {
  profile: {
    name: string;
    email?: string | null;
    image?: string | null;
  };
  canManageSystem?: boolean;
  isOwner?: boolean;
  stats?: LeaderboardEntry | null;
};

export function ProfileCard({
  profile,
  canManageSystem = false,
  isOwner = true,
  stats,
}: ProfileCardProps) {
  const router = useRouter();
  const [prevName, setPrevName] = useState(profile.name);
  const [username, setUsername] = useState(profile.name);
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (profile.name !== prevName) {
    setPrevName(profile.name);
    setUsername(profile.name);
  }

  async function handleSave(nextUsername: string): Promise<boolean> {
    try {
      await httpClient.patch(ProfileRoutes.update, { username: nextUsername });

      setUsername(nextUsername);
      toast.success(PROFILE_MESSAGES.updateSuccess);
      router.refresh();
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, PROFILE_MESSAGES.updateFailed));
      return false;
    }
  }

  return (
    <section
      aria-label="ข้อมูลโปรไฟล์"
      className="player-page-panel flex flex-wrap items-center gap-5 rounded-3xl border border-surface-border bg-secondary-main/40 p-5 sm:gap-6 sm:p-8"
    >
      <Avatar
        src={getProfileImageUrl(profile.image)}
        alt={username}
        sx={{
          width: { xs: "4.5rem", sm: "5.5rem" },
          height: { xs: "4.5rem", sm: "5.5rem" },
          flexShrink: 0,
          border: "0.1875rem solid #fff",
          backgroundColor: "var(--color-primary-soft)",
          color: "var(--color-secondary-main)",
          boxShadow: "0 0.25rem 1rem rgb(0 0 0 / 20%)",
          fontFamily: "var(--font-prompt), sans-serif",
          fontSize: "2rem",
          fontWeight: 700,
        }}
      >
        {username.charAt(0).toUpperCase()}
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h1 className="truncate text-xl font-bold text-surface-text sm:text-2xl">
            {username}
          </h1>
          {isOwner && (
            <Tooltip title="แก้ไขชื่อผู้ใช้">
              <IconButton
                size="small"
                aria-label="แก้ไขชื่อผู้ใช้"
                onClick={() => {
                  playSoundEffect("click");
                  setIsEditOpen(true);
                }}
                sx={{
                  color: "var(--color-primary-light)",
                  "&:hover": {
                    backgroundColor:
                      "color-mix(in srgb, var(--color-primary-main) 12%, transparent)",
                  },
                }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </div>
        {isOwner && profile.email && (
          <p className="mt-1 truncate text-sm text-surface-muted sm:text-base">
            {profile.email}
          </p>
        )}
      </div>
      <dl className="grid w-full grid-cols-3 gap-3 border-t border-surface-border pt-4 sm:w-auto sm:min-w-72 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
        <div>
          <dt className="text-xs text-surface-muted">อันดับ</dt>
          <dd className="mt-1 font-bold text-primary-light">
            {stats
              ? `#${stats.rank.toLocaleString("th-TH")}`
              : "ยังไม่มีอันดับ"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-surface-muted">คะแนนรวม</dt>
          <dd className="mt-1 font-bold text-surface-text">
            {(stats?.totalScore ?? 0).toLocaleString("th-TH")}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-surface-muted">เกมที่เล่นจบ</dt>
          <dd className="mt-1 font-bold text-surface-text">
            {(stats?.gamesPlayed ?? 0).toLocaleString("th-TH")}
          </dd>
        </div>
      </dl>
      {isOwner && canManageSystem && (
        <Button
          href={AppRoutes.admin}
          sound="click"
          variant="primary"
          size="small"
          className="ml-auto shrink-0"
        >
          จัดการระบบ
        </Button>
      )}
      {isOwner && (
        <EditNameModal
          open={isEditOpen}
          username={username}
          onClose={() => setIsEditOpen(false)}
          onSave={handleSave}
        />
      )}
    </section>
  );
}
