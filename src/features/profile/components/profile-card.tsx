"use client";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { EditNameModal } from "@/features/profile/components/edit-name-modal";
import { Button } from "@/shared/components/ui/button";
import { PROFILE_MESSAGES } from "@/features/profile/profile.constants";
import type { User } from "@/features/users/user";
import httpClient from "@/shared/lib/http";
import { ProfileRoutes } from "@/features/profile/profile.routes";
import { getProfileImageUrl } from "@/shared/lib/profile-image";
import { playSoundEffect } from "@/shared/lib/sound-effect";
import { AppRoutes } from "@/shared/routes/routes";
import { getErrorMessage } from "@/shared/lib/error-message";

type ProfileCardProps = {
  profile: User;
  canManageSystem?: boolean;
};

export function ProfileCard({ profile, canManageSystem = false }: ProfileCardProps) {
  const router = useRouter();
  const [username, setUsername] = useState(profile.name);
  const [isEditOpen, setIsEditOpen] = useState(false);

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
      className="flex flex-wrap items-center gap-5 rounded-3xl border border-surface-border bg-surface-overlay p-5 shadow-2xl shadow-black/20 sm:gap-6 sm:p-8"
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
          <IconButton
            size="small"
            aria-label="แก้ไขชื่อผู้ใช้"
            title="แก้ไขชื่อผู้ใช้"
            onClick={() => {
              playSoundEffect("click");
              setIsEditOpen(true);
            }}
            sx={{ color: "var(--color-primary-light)", "&:hover": { backgroundColor: "color-mix(in srgb, var(--color-primary-main) 12%, transparent)" } }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </div>
        <p className="mt-1 truncate text-sm text-surface-muted sm:text-base">
          {profile.email}
        </p>
      </div>
      {canManageSystem && (
        <Button href={AppRoutes.admin} sound="click" variant="primary" size="small" className="ml-auto shrink-0">
          จัดการระบบ
        </Button>
      )}
      <EditNameModal
        open={isEditOpen}
        username={username}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSave}
      />
    </section>
  );
}
