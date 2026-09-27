export const HomeBackgroundImages = [
  "/images/kmutt-bangmod-1.jpg",
  "/images/kmutt-bangmod-3.jpg",
  "/images/kmutt-bangmod-4.jpg",
  "/images/kmutt-bangmod-5.jpg",
  "/images/kmutt-bangmod-7.jpg",
] as const;

export const HomeMusic = {
  src: "/audio/home.mp3",
  volume: 0.25,
} as const;

export const Contributors = [
  { name: "Asnawee Ezor", instagram: "vixvify_v" },
  { name: "Chanyanuch Thanusorn", instagram: "helianthwan" },
  { name: "Chitaworn Sinsuk", instagram: "auntonin_09" },
] as const;

export const Steps = [
  {
    title: "รับภาพปริศนา",
    description:
      "ระบบจะให้ภาพสถานที่จริงในมหาวิทยาลัย สักมุมที่คุณอาจเดินผ่านทุกวัน",
    caption: "LOOK",
    path: "M3 3h18v18H3z M3 17l6-6 4 4 3-3 5 5 M15 7h.01",
  },
  {
    title: "สังเกตให้ดี",
    description:
      "มองหาอาคาร ทางเดิน หรือต้นไม้ที่คุ้นตา แล้วนึกให้ออกว่าตรงนี้คือที่ไหน",
    caption: "THINK",
    path: "M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0 M7 10h6 M10 7v6",
  },
  {
    title: "เลือกคำตอบ",
    description:
      "ปักหมุดลงบนแผนที่ตรงที่คุณคิดว่าใช่ แล้วดูว่าความทรงจำพาคุณไปได้ใกล้แค่ไหน",
    caption: "PIN",
    path: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  },
] as const;
