"use client";

import { motion, useReducedMotion } from "motion/react";

export function LobbyEmblem() {
  const reducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="relative mx-auto grid size-[clamp(5rem,13svh,8.5rem)] place-items-center"
    >
      <motion.svg
        viewBox="0 0 32 36"
        shapeRendering="crispEdges"
        className="size-full overflow-visible drop-shadow-[0_8px_0_var(--color-secondary-dark)]"
        animate={{ y: reducedMotion ? 0 : [0, -6, -6, 0, 0] }}
        transition={{ duration: 3, ease: "linear", repeat: Infinity }}
      >
        <path
          d="M10 2h12v2h4v4h2v12h-2v4h-4v4h-4v4h-4v-4h-4v-4H6v-4H4V8h2V4h4Z"
          fill="var(--color-primary-soft)"
        />
        <path
          d="M10 4h12v2h2v4h2v10h-4v4h-4v4h-4v-4h-4v-4H6V10h2V6h2Z"
          fill="var(--color-primary-main)"
        />
        <path d="M10 6h10v2H10v4H8V8h2Z" fill="var(--color-primary-light)" />
        <path
          d="M12 10h8v2h2v6h-2v2h-8v-2h-2v-6h2Z"
          fill="var(--color-secondary-light)"
        />
        <path d="M14 12h4v6h-4Z" fill="var(--color-secondary-dark)" />
        <path
          d="M0 4h2V2h2v2h2v2H4v2H2V6H0Zm26 24h2v-2h2v2h2v2h-2v2h-2v-2h-2Z"
          fill="var(--color-primary-light)"
        />
      </motion.svg>
    </div>
  );
}
