import type { GameSettings } from "@/core/schema/settings.schema";

export const SETTINGS_MESSAGES = {
  title: "ตั้งค่าเกม",
  sfxVolume: "เสียงระบบ",
  musicVolume: "เสียงเพลง",
  imageQuality: "คุณภาพของรูปภาพ",
  close: "ปิดหน้าต่างตั้งค่า",
  cancel: "ยกเลิก",
  confirm: "ตกลง",
  qualities: {
    ultra: "สูงสุด",
    medium: "ปานกลาง",
    low: "ต่ำ",
  },
} as const;

export type { GameSettings, ImageQuality } from "@/core/schema/settings.schema";

export const DEFAULT_SETTINGS: GameSettings = {
  imageQuality: "ultra",
  systemSound: 80,
  musicSound: 50,
};
