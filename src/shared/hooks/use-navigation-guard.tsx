"use client";

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type NavigationGuard = (continueNavigation: () => void) => void;

const NavigationGuardContext = createContext<{
  register: (guard: NavigationGuard) => () => void;
  request: (continueNavigation: () => void) => boolean;
} | null>(null);

export function NavigationGuardProvider({ children }: { children: ReactNode }) {
  const guardRef = useRef<NavigationGuard | null>(null);
  const router = useRouter();

  const register = useCallback((guard: NavigationGuard) => {
    guardRef.current = guard;
    return () => {
      if (guardRef.current === guard) guardRef.current = null;
    };
  }, []);

  const request = useCallback((continueNavigation: () => void) => {
    if (!guardRef.current) return false;
    guardRef.current(continueNavigation);
    return true;
  }, []);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!guardRef.current) return;
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      event.preventDefault();
      event.stopPropagation();
      const targetPath = url.pathname + url.search + url.hash;
      guardRef.current(() => {
        router.push(targetPath);
      });
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [router]);

  return (
    <NavigationGuardContext.Provider value={{ register, request }}>
      {children}
    </NavigationGuardContext.Provider>
  );
}

export function useNavigationGuard() {
  return useContext(NavigationGuardContext);
}
