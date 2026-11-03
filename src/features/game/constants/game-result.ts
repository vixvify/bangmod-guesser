export const GAME_RESULT_MESSAGES = {
  roundTitle: "สรุปคะแนนรอบนี้",
  summaryTitle: "คะแนนของคุณ",
  location: "สถานที่",
  distance: "ระยะห่างจากจุดจริง",
  accumulated: "คะแนนสะสม",
  points: "คะแนน",
  meters: "ม.",
  nextRound: "รอบถัดไป",
  summary: "สรุปผลเกม",
  home: "กลับหน้าแรก",
  replay: "เล่นอีกครั้ง",
  time: "เวลารวม",
  bonus: "คะแนนโบนัส",
  baseScore: "คะแนนจากการทาย",
  finalScore: "คะแนนรวมโบนัส",
  skipAnimation: "แสดงคะแนนทั้งหมด",
  closeLocation: "ปิดรายละเอียดสถานที่",
  actual: "สถานที่จริง",
  guess: "จุดที่คุณเลือก",
  rounds: "ผลการเล่นแต่ละรอบ",
} as const;

export const SCORE_REVEAL_TIMING = { base: 1500, pause: 450, bonus: 1000 } as const;
