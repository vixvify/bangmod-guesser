"use client";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";
import { EditNameDialog } from "@/components/profile/edit-name-dialog";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/core/domain/profile";

type ProfileCardProps = {
  profile: UserProfile;
  canManageSystem?: boolean;
};

export function ProfileCard({ profile, canManageSystem = false }: ProfileCardProps) {
  const [username, setUsername] = useState(profile.username);
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <section
      aria-label="ข้อมูลโปรไฟล์"
      className="flex flex-wrap items-center gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:gap-6 sm:p-8"
    >
      <Avatar
        src={profile.avatarUrl}
        alt={username}
        sx={{
          width: { xs: "4.5rem", sm: "5.5rem" },
          height: { xs: "4.5rem", sm: "5.5rem" },
          flexShrink: 0,
          border: "0.1875rem solid #fff",
          backgroundColor: "var(--color-primary-soft)",
          color: "var(--color-secondary-dark)",
          boxShadow: "0 0.25rem 1rem rgb(0 0 0 / 12%)",
          fontFamily: "var(--font-prompt), sans-serif",
          fontSize: "2rem",
          fontWeight: 700,
        }}
      >
        {username.charAt(0).toUpperCase()}
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h1 className="truncate text-xl font-bold text-secondary-dark sm:text-2xl">
            {username}
          </h1>
          <IconButton
            size="small"
            aria-label="แก้ไขชื่อผู้ใช้"
            title="แก้ไขชื่อผู้ใช้"
            onClick={() => setIsEditOpen(true)}
            sx={{ color: "var(--color-secondary-dark)" }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </div>
        <p className="mt-1 truncate text-sm text-neutral-500 sm:text-base">
          {profile.email}
        </p>
      </div>
      {canManageSystem && (
        <Button variant="primary" size="small" className="ml-auto shrink-0">
          จัดการระบบ
        </Button>
      )}
      <EditNameDialog
        open={isEditOpen}
        username={username}
        onClose={() => setIsEditOpen(false)}
        onSave={setUsername}
      />
    </section>
  );
}
