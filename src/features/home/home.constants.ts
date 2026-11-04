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
  },
  {
    title: "สังเกตให้ดี",
    description:
      "มองหาอาคาร ทางเดิน หรือต้นไม้ที่คุ้นตา แล้วนึกให้ออกว่าตรงนี้คือที่ไหน",
    caption: "THINK",
  },
  {
    title: "เลือกคำตอบ",
    description:
      "ปักหมุดลงบนแผนที่ตรงที่คุณคิดว่าใช่ แล้วดูว่าความทรงจำพาคุณไปได้ใกล้แค่ไหน",
    caption: "PIN",
  },
] as const;
