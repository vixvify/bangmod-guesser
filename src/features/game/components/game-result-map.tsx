"use client";

import dynamic from "next/dynamic";

export const GameResultMap = dynamic(
  () => import("./result-map").then((module) => module.ResultMap),
  { ssr: false, loading: () => <div role="status" className="grid h-full place-items-center bg-secondary-main text-sm text-surface-muted">กำลังโหลดแผนที่…</div> },
);
