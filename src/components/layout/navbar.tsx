"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import MuiLink from "@mui/material/Link";
import type { User } from "@/core/domain/user";
import { AppRoutes } from "@/routes/app/routes";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type NavbarProps = {
  user: User | null;
};

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await authClient.signOut();
      router.refresh();
    } catch {
      return;
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="absolute inset-x-0 top-0 z-50 flex h-16 w-full items-center justify-between bg-transparent px-4 text-secondary-light sm:px-8">
      <MuiLink
        component={NextLink}
        href={AppRoutes.home}
        color="inherit"
        underline="none"
        sx={{
          color: "var(--color-secondary-light)",
          fontSize: { xs: "1.125rem", sm: "1.5rem" },
          fontWeight: 900,
          transition: "color 280ms ease",
          "&:hover": { color: "var(--color-primary-main)" },
        }}
        className="tracking-tight focus-visible:outline-2 focus-visible:outline-primary-focus"
      >
        Bangmod Guesser
      </MuiLink>

      <nav aria-label="เมนูหลัก" className="flex items-center gap-2">
        <Button
          variant="surface"
          size="icon"
          disabled
          aria-label="ตั้งค่าเกม — เร็ว ๆ นี้"
          title="ตั้งค่าเกม — เร็ว ๆ นี้"
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
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogoutOutlinedIcon fontSize="small" />
              {isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
            </Button>
          </>
        ) : (
          <Button
            href={AppRoutes.login}
            variant="surface"
            size="small"
          >
            <LoginOutlinedIcon fontSize="small" />
            เข้าสู่ระบบ
          </Button>
        )}
      </nav>
    </header>
  );
}
