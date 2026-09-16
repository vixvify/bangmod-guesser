"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/ui/countdown";
import { AppRoutes } from "@/routes/app/routes";

export function LobbyMenu() {
  const instructions = useRef<HTMLDialogElement>(null);
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();
  const enterGame = useCallback(() => router.push(AppRoutes.game), [router]);

  return (
    <div className="mx-auto mt-8 w-full max-w-80 motion-safe:animate-home-enter motion-safe:[animation-delay:240ms]">
      <div className="lobby-play-frame relative">
        <Button
          disabled={isStarting}
          onClick={() => setIsStarting(true)}
          aria-label="Play Bangmod Guesser"
          className="lobby-play w-full"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5 fill-current"
          >
            <path d="M6 3v18l15-9Z" />
          </svg>
          <span className="font-display text-3xl tracking-[0.12em]">PLAY</span>
        </Button>
      </div>
      {isStarting && <Countdown onComplete={enterGame} />}
      <Button
        variant="ghost"
        size="small"
        onClick={() => instructions.current?.showModal()}
        className="mt-5 gap-2 text-secondary-light"
      >
        <span
          aria-hidden="true"
          className="grid size-4 place-items-center rounded-full border border-current text-[0.6rem]"
        >
          ?
        </span>
        วิธีเล่น
      </Button>
      <dialog
        ref={instructions}
        aria-labelledby="instructions-title"
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-primary-light/30 bg-secondary-main p-7 text-left text-secondary-light shadow-2xl backdrop:bg-secondary-main/80 backdrop:backdrop-blur-sm"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-light">
          Bangmod Guesser
        </p>
        <h2 id="instructions-title" className="mt-3 text-2xl font-bold">
          จำมุมนี้ได้ไหม?
        </h2>
        <ol className="mt-6 list-inside list-decimal space-y-4 text-sm leading-7 text-secondary-light/80">
          <li>ดูภาพสถานที่ในมหาวิทยาลัย แล้วสังเกตสิ่งรอบตัว</li>
          <li>ลองนึกให้ออกว่าภาพนี้ถ่ายจากตรงไหนของบางมด</li>
          <li>เมื่อเกมเปิดให้เล่น เลือกตำแหน่งที่คุณคิดว่าใช่</li>
        </ol>
        <p className="mt-6 text-xs text-primary-soft">
          เกมยังไม่เปิดให้เล่น — แล้วพบกันเร็ว ๆ นี้
        </p>
        <form method="dialog" className="mt-6">
          <Button type="submit" className="w-full">
            เข้าใจแล้ว
          </Button>
        </form>
      </dialog>
    </div>
  );
}
