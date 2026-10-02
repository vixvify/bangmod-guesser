"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ContentContainer } from "@/components/layout/content-container";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { SettingsModal } from "@/components/ui/settings-modal";
import { AUTH_MESSAGES } from "@/core/constants/auth";
import type { User } from "@/core/domain/user";
import { AppRoutes } from "@/routes/app/routes";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type NavbarProps = {
  user: User | null;
  brandColor?: string;
};

export function Navbar({
  user,
  brandColor = "var(--color-secondary-light)",
}: NavbarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      const { error } = await authClient.signOut();
      if (error) {
        toast.error(AUTH_MESSAGES.logout.failed);
        return;
      }

      setIsLogoutModalOpen(false);
      toast.success(AUTH_MESSAGES.logout.success);
      router.refresh();
    } catch {
      toast.error(AUTH_MESSAGES.logout.failed);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="absolute inset-x-0 top-0 z-50 h-16 w-full bg-transparent text-secondary-light">
      <ContentContainer
        contentWidth="full"
        className="flex h-full items-center justify-between gap-3"
      >
        <NextLink
          href={AppRoutes.home}
          style={
            {
              "--brand-color": brandColor,
              fontWeight: 900,
            } as React.CSSProperties
          }
          className="text-[var(--brand-color)] text-lg tracking-tight no-underline transition-colors duration-[280ms] hover:text-primary-main focus-visible:outline-2 focus-visible:outline-primary-focus sm:text-2xl"
        >
          Bangmod Guesser
        </NextLink>

        <nav aria-label="เมนูหลัก" className="flex items-center gap-2">
          <Button
            variant="surface"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="ตั้งค่าเกม"
            title="ตั้งค่าเกม"
          >
            <SettingsOutlinedIcon />
          </Button>

          <Button
            variant="surface"
            size="icon"
            disabled
            aria-label="ตารางอันดับ — เร็ว ๆ นี้"
            title="ตารางอันดับ — เร็ว ๆ นี้"
          >
            <LeaderboardOutlinedIcon />
          </Button>

          {user ? (
            <>
              <Button
                href={AppRoutes.profile}
                variant="surface"
                size="icon"
                aria-label={`โปรไฟล์ของ ${user.name}`}
                title={`โปรไฟล์ของ ${user.name}`}
              >
                <PersonOutlineIcon />
              </Button>
              <Button
                variant="surface"
                size="small"
                onClick={() => setIsLogoutModalOpen(true)}
                disabled={isLoggingOut}
              >
                <LogoutOutlinedIcon fontSize="small" />
                {isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
              </Button>
            </>
          ) : (
            <Button href={AppRoutes.login} variant="surface" size="small">
              <LoginOutlinedIcon fontSize="small" />
              เข้าสู่ระบบ
            </Button>
          )}
        </nav>
      </ContentContainer>
      <ConfirmModal
        open={isLogoutModalOpen}
        busy={isLoggingOut}
        title={AUTH_MESSAGES.logout.title}
        description={AUTH_MESSAGES.logout.description}
        confirmLabel={AUTH_MESSAGES.logout.confirm}
        cancelLabel={AUTH_MESSAGES.logout.cancel}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
      <SettingsModal
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </header>
  );
}
