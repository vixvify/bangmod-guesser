import type { GameSettings } from "@/features/settings/settings.schema";

export const SETTINGS_MESSAGES = {
  title: "ตั้งค่าเกม",
  sfxVolume: "เสียงระบบ",
  musicVolume: "เสียงเพลง",
  close: "ปิดหน้าต่างตั้งค่า",
  cancel: "ยกเลิก",
  confirm: "ตกลง",
} as const;

export type { GameSettings } from "@/features/settings/settings.schema";

export const DEFAULT_SETTINGS: GameSettings = {
  systemSound: 80,
  musicSound: 50,
};
