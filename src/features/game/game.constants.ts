export const GAME_MESSAGES = {
  exitGame: {
    button: "ออกจากเกม",
    title: "ออกจากเกม",
    description: "คุณต้องการออกจากเกมหรือไม่? ผลการเล่นในรอบนี้จะไม่ถูกบันทึก",
    confirm: "ออกจากเกม",
    cancel: "เล่นต่อ",
  },
} as const;

export const GAME_DEFAULTS = {
  demoGameId: "demo",
  currentRound: 1,
  roundDurationSeconds: 40,
} as const;

export const GAME_MAX_SCORE = 5000;

export const MAP_CONFIG = {
  center: { lat: 13.6513, lng: 100.4943 },
  defaultZoom: 16,
  maxZoom: 19,
  tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: "&copy; OpenStreetMap",
  markerIcon: {
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41] as [number, number],
    iconAnchor: [12, 41] as [number, number],
    shadowSize: [41, 41] as [number, number],
  },
} as const;

export const GAME_RULES = {
  rounds: 5,
  maxRoundScore: 1000,
  distanceReferenceMeters: 25,
  distanceReferenceRatio: 0.7,
  distanceDecayExponent: Math.log(Math.log(0.2) / Math.log(0.7)) / Math.log(2),
  maxTimeBonus: 300,
  fullBonusSeconds: 10,
  zeroBonusSeconds: 200,
} as const;
