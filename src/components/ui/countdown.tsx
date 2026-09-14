"use client";

import { useEffect, useRef, useState } from "react";

type CountdownProps = {
  onComplete: () => void;
};

export function Countdown({ onComplete }: CountdownProps) {
  const [count, setCount] = useState(3);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const modal = dialog.current;
    modal?.showModal();
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
      modal?.close();
    };
  }, [onComplete]);

  return (
    <dialog
      ref={dialog}
      aria-label="กำลังเข้าสู่เกม"
      onCancel={(event) => event.preventDefault()}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-secondary-main/85 p-6 text-secondary-light backdrop:bg-secondary-main/50 backdrop:backdrop-blur-md"
    >
      <div className="flex h-full flex-col items-center justify-center text-center">
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
    </dialog>
  );
}
