"use client";

import { createContext, useCallback, useContext, useRef, type ReactNode } from "react";

type NavigationGuard = (continueNavigation: () => void) => void;

const NavigationGuardContext = createContext<{
  register: (guard: NavigationGuard) => () => void;
  request: (continueNavigation: () => void) => boolean;
} | null>(null);

export function NavigationGuardProvider({ children }: { children: ReactNode }) {
  const guardRef = useRef<NavigationGuard | null>(null);

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

  return (
    <NavigationGuardContext.Provider value={{ register, request }}>
      {children}
    </NavigationGuardContext.Provider>
  );
}

export function useNavigationGuard() {
  return useContext(NavigationGuardContext);
}
