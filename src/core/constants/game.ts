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
  currentRound: 1,
  roundDurationSeconds: 40,
} as const;

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
