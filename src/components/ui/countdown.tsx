"use client";

import { useEffect, useState } from "react";
import Modal from "@mui/material/Modal";

type CountdownProps = {
  onComplete: () => void;
};

export function Countdown({ onComplete }: CountdownProps) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    const timers = [2, 1, 0].map((value, index) =>
      window.setTimeout(
        () => {
          setCount(value);
          if (value === 0) onComplete();
        },
        (index + 1) * 1000,
      ),
    );

    return () => {
      timers.forEach(window.clearTimeout);
    };
  }, [onComplete]);

  return (
    <Modal
      open
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor:
              "color-mix(in srgb, var(--color-secondary-main) 50%, transparent)",
            backdropFilter: "blur(0.75rem)",
          },
        },
      }}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div role="dialog" aria-modal="true" aria-label="กำลังเข้าสู่เกม" tabIndex={-1} className="flex h-dvh w-full flex-col items-center justify-center bg-secondary-main/85 p-6 text-center text-secondary-light outline-none">
        <p className="text-xs font-bold tracking-[0.3em] text-primary-soft">
          GET READY
        </p>
        <div
          role="status"
          aria-live="assertive"
          aria-atomic="true"
          className="my-8 grid min-h-52 place-items-center"
        >
          {count > 0 ? (
            <span
              key={count}
              className="lobby-title block font-display text-[clamp(8rem,30vw,15rem)] leading-none text-primary-main motion-safe:animate-countdown-beat"
            >
              {count}
            </span>
          ) : (
            <span className="text-3xl font-bold">ไปกันเลย!</span>
          )}
        </div>
        <p className="text-sm text-secondary-light/70">เตรียมตัวออกสำรวจ</p>
      </div>
    </Modal>
  );
}
