"use client";

import { useEffect, useRef } from "react";

const GUARD_KEY = "__unsavedChangesGuard";

export function useUnsavedChangesGuard(
  hasUnsavedChanges: boolean,
  onBrowserBack: () => void,
  options?: {
    onPageHide?: () => void;
  },
) {
  const dirtyRef = useRef(hasUnsavedChanges);
  const backCallbackRef = useRef(onBrowserBack);
  const guardActiveRef = useRef(false);
  const backPendingRef = useRef(false);
  const leavingRef = useRef(false);
  const onPageHideRef = useRef(options?.onPageHide);

  useEffect(() => {
    dirtyRef.current = hasUnsavedChanges;
    backCallbackRef.current = onBrowserBack;
    onPageHideRef.current = options?.onPageHide;
  }, [hasUnsavedChanges, onBrowserBack, options?.onPageHide]);

  useEffect(() => {
    if (!hasUnsavedChanges || guardActiveRef.current) return;

    window.history.pushState(
      { ...window.history.state, [GUARD_KEY]: true },
      "",
      window.location.href,
    );
    guardActiveRef.current = true;
  }, [hasUnsavedChanges]);

  useEffect(() => {
    function handleBack() {
      if (!guardActiveRef.current || leavingRef.current) return;

      guardActiveRef.current = false;
      if (!dirtyRef.current) {
        window.history.back();
        return;
      }

      window.history.pushState(
        { ...window.history.state, [GUARD_KEY]: true },
        "",
        window.location.href,
      );
      guardActiveRef.current = true;
      backPendingRef.current = true;
      backCallbackRef.current();
    }

    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, []);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (leavingRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    }

    function handlePageHide() {
      if (leavingRef.current) return;
      onPageHideRef.current?.();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [hasUnsavedChanges]);

  return {
    cancelBrowserBack() {
      backPendingRef.current = false;
    },
    confirmBrowserBack(fallback: () => void) {
      if (!backPendingRef.current) return false;

      backPendingRef.current = false;
      leavingRef.current = true;
      guardActiveRef.current = false;
      if (window.history.length > 2) {
        window.history.go(-2);
      } else {
        fallback();
      }
      return true;
    },
    markLeaving() {
      leavingRef.current = true;
    },
  };
}
