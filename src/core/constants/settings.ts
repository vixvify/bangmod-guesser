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

export type ImageQuality = keyof typeof SETTINGS_MESSAGES.qualities;

export type GameSettings = {
  sfxVolume: number;
  musicVolume: number;
  imageQuality: ImageQuality;
};

export const DEFAULT_SETTINGS: GameSettings = {
  sfxVolume: 80,
  musicVolume: 50,
  imageQuality: "ultra",
};
