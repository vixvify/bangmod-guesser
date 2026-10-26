"use client";

import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { ContentContainer } from "@/components/layout/content-container";
import { useNavigationGuard } from "@/hooks/use-navigation-guard";
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
import { playSoundEffect } from "@/lib/sound-effect";
import styles from "./navbar.module.css";
import httpClient from "@/lib/http";
import { SessionRoutes } from "@/routes/api/session.routes";

type NavbarProps = {
  user: User | null;
  brandColor?: string;
  soundEnabled?: boolean;
};

export function Navbar({
  user,
  brandColor = "var(--color-secondary-light)",
  soundEnabled = true,
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const navigationGuard = useNavigationGuard();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await httpClient.post<null>(SessionRoutes.logout);

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
        className="flex h-full items-center justify-between gap-2 sm:gap-3"
      >
        <NextLink
          href={AppRoutes.home}
          onClick={(event) => {
            if (soundEnabled) playSoundEffect("click");
            if (navigationGuard?.request(() => router.push(AppRoutes.home))) {
              event.preventDefault();
            }
          }}
          style={
            {
              "--brand-color": brandColor,
              fontWeight: 900,
            } as React.CSSProperties
          }
          className="min-w-0 text-(--brand-color) text-sm tracking-tight no-underline transition-colors duration-280 hover:text-primary-main focus-visible:outline-2 focus-visible:outline-primary-focus sm:text-2xl"
        >
          Bangmod Guesser
        </NextLink>

        <nav
          aria-label="เมนูหลัก"
          className="flex shrink-0 items-center gap-1 sm:gap-2"
        >
          <Button
            sound={soundEnabled ? "click" : undefined}
            variant="surface"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            aria-pressed={isSettingsOpen}
            aria-haspopup="dialog"
            className={styles.navButton}
            aria-label="ตั้งค่าเกม"
            title="ตั้งค่าเกม"
          >
            <SettingsOutlinedIcon />
          </Button>

          <Button
            sound={soundEnabled ? "click" : undefined}
            href={AppRoutes.leaderboard}
            aria-current={
              pathname === AppRoutes.leaderboard ? "page" : undefined
            }
            className={styles.navButton}
            onClick={(event: MouseEvent<HTMLAnchorElement>) => {
              if (
                navigationGuard?.request(() =>
                  router.push(AppRoutes.leaderboard),
                )
              ) {
                event.preventDefault();
              }
            }}
            variant="surface"
            size="icon"
            aria-label="อันดับผู้เล่น"
            title="อันดับผู้เล่น"
          >
            <LeaderboardOutlinedIcon />
          </Button>

          {user ? (
            <>
              <Button
                sound={soundEnabled ? "click" : undefined}
                href={AppRoutes.profile}
                aria-current={
                  pathname === AppRoutes.profile ? "page" : undefined
                }
                className={styles.navButton}
                onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                  if (
                    navigationGuard?.request(() =>
                      router.push(AppRoutes.profile),
                    )
                  ) {
                    event.preventDefault();
                  }
                }}
                variant="surface"
                size="icon"
                aria-label={`โปรไฟล์ของ ${user.name}`}
                title={`โปรไฟล์ของ ${user.name}`}
              >
                <PersonOutlineIcon />
              </Button>
              <Button
                sound={soundEnabled ? "click" : undefined}
                variant="surface"
                size="small"
                onClick={() => {
                  if (
                    !navigationGuard?.request(() => setIsLogoutModalOpen(true))
                  ) {
                    setIsLogoutModalOpen(true);
                  }
                }}
                disabled={isLoggingOut}
                aria-label={isLoggingOut ? "กำลังออกจากระบบ" : "ออกจากระบบ"}
                aria-haspopup="dialog"
              >
                <LogoutOutlinedIcon fontSize="small" />
                <span className="hidden sm:inline">
                  {isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
                </span>
              </Button>
            </>
          ) : (
            <Button
              href={AppRoutes.login}
              variant="surface"
              size="small"
              aria-label="เข้าสู่ระบบ"
              sound={soundEnabled ? "click" : undefined}
            >
              <LoginOutlinedIcon fontSize="small" />
              <span className="hidden sm:inline">เข้าสู่ระบบ</span>
            </Button>
          )}
        </nav>
      </ContentContainer>
      <ConfirmModal
        soundEnabled={soundEnabled}
        open={isLogoutModalOpen}
        theme="dark"
        busy={isLoggingOut}
        title={AUTH_MESSAGES.logout.title}
        description={AUTH_MESSAGES.logout.description}
        confirmLabel={AUTH_MESSAGES.logout.confirm}
        cancelLabel={AUTH_MESSAGES.logout.cancel}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
      <SettingsModal
        soundEnabled={soundEnabled}
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </header>
  );
}
