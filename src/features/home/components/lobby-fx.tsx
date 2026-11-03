"use client";

import { useEffect, useRef } from "react";
import { startPixels } from "./pixels";

export function LobbyFx() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;

    return startPixels(element, context);
  }, []);

  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      className="lobby-fx pointer-events-none absolute inset-0 size-full [image-rendering:pixelated]"
    />
  );
}
