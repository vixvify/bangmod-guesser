# สรุป Game API

ร่างสำหรับพัฒนาระบบทายสถานที่ 5 รอบ

![Game API ทั้ง 4 เส้น](./game-api.png)

## ลำดับการเล่น

ผู้เล่นกดเริ่มเกม → API 01 สร้างเกม → วน API 02 ขอรูป และ API 03 ส่งคำตอบพร้อมเฉลย ครบ 5 รอบ → API 04 ดูคะแนนรวม

| API | Method | Endpoint |
| --- | --- | --- |
| 01 เริ่มเกม | POST | `/api/games` |
| 02 ขอรูปของรอบปัจจุบัน | GET | `/api/games/{gameId}/current-round` |
| 03 ส่งคำตอบและเฉลย | POST | `/api/games/{gameId}/rounds/{questionNumber}/guess` |
| 04 สรุปคะแนน | GET | `/api/games/{gameId}/summary` |

`gameId` คือรหัสเกมที่ได้จาก API 01 ส่วน `questionNumber` คือเลขรอบ 1–5 Frontend แทนค่าลงใน URL เช่น `POST /api/games/g7/rounds/2/guess` และส่งพิกัดที่ทายใน JSON body

## 01 เริ่มเกม

**POST `/api/games`**

Frontend เรียกเมื่อกดเริ่มเกม Backend ตรวจ session สร้าง Game พร้อมสุ่มสถานที่และสร้าง GameRound ทั้ง 5 รอบ แล้วบันทึกพร้อมกัน

ตอบกลับ HTTP 201 โดยข้อมูลภายใน `data` มีดังนี้

```json
{
  "gameId": "g7"
}
```

| ฟิลด์ | ชนิด | การใช้งาน |
| --- | --- | --- |
| gameId | string | Frontend เก็บไว้เรียก API ของเกมนี้ แล้วขอรอบปัจจุบันจาก API 02 |

## 02 ขอรูปของคำถาม

**GET `/api/games/{gameId}/current-round`**

| Path parameter | ชนิด | ความหมาย |
| --- | --- | --- |
| gameId | string | รหัสเกม |

Backend ตรวจเจ้าของเกมและสถานะ PLAYING แล้วกำหนดรอบปัจจุบันจากรอบแรกที่ยังไม่บันทึกผล สุ่มรูปจากทุกรูปของคำถามนั้น ส่งกลับเลขรอบและ URL ของรูปที่สุ่มได้ การเรียกซ้ำขณะยังไม่ส่งคำตอบคงรอบและรูปเดิม เมื่อรับคำตอบรอบนั้นสำเร็จจึงเปลี่ยนเป็นรอบถัดไป เกมที่จบแล้วให้ตอบข้อผิดพลาดแทนการเปิดคำถามใหม่

ตอบกลับ HTTP 200 โดยข้อมูลภายใน `data` มีดังนี้

```json
{
  "questionNumber": 2,
  "imageUrl": "https://images.example.invalid/question-image.webp"
}
```

| ฟิลด์ | ชนิด | การใช้งาน |
| --- | --- | --- |
| imageUrl | string | แสดงรูปของคำถาม และเก็บไว้ใช้กับปุ่ม ⓘ หลังเฉลย |
| questionNumber | integer | รอบปัจจุบันที่ Backend กำหนด Frontend ใช้แสดงเลขรอบและส่งกลับใน path ของ API 03 |

Response เส้นนี้มีเลขรอบและ URL รูป โดยคัดกรองพิกัดจริง ชื่อสถานที่ และข้อมูลเฉลยออกก่อนส่ง

## 03 ส่งคำตอบและเฉลย

**POST `/api/games/{gameId}/rounds/{questionNumber}/guess`**

ใช้เส้นเดียวกันสำหรับรอบ 1–5

| Path parameter | ชนิด | ความหมาย |
| --- | --- | --- |
| gameId | string | รหัสเกม |
| questionNumber | integer | เลขรอบที่ตอบ |

Frontend ส่ง JSON body พร้อม `Content-Type: application/json`

```json
{
  "guessedLatitude": 13.65,
  "guessedLongitude": 100.49
}
```

| Body field | ชนิด | ความหมาย |
| --- | --- | --- |
| guessedLatitude | number | ละติจูดที่ผู้เล่นทาย |
| guessedLongitude | number | ลองจิจูดที่ผู้เล่นทาย |

Backend ตรวจเจ้าของเกม ตรวจว่าเกมยังมีสถานะ PLAYING และ questionNumber ตรงกับรอบปัจจุบันที่เปิดให้เล่น รวมถึงตรวจพิกัดและรอบที่ยังไม่บันทึกคำตอบ จากนั้นคำนวณระยะห่างกับคะแนน บันทึกคำตอบ คะแนน และเวลาเล่น แล้วรวมคะแนนตั้งแต่รอบ 1 ถึงรอบปัจจุบัน เมื่อจบรอบ 5 บันทึกผลรวมและปิดเกม

ตรวจสถานะและบันทึกผลใน transaction พร้อม conditional write หรือ lock เพื่อให้คำขอพร้อมกันบันทึกผลได้เพียงครั้งเดียว คำตอบซ้ำ รอบไม่ตรง และเกมที่จบแล้ว เสนอให้ตอบ HTTP 409 โดยไม่เปลี่ยนผลหรือเพิ่มคะแนน คืนเฉลยหลังบันทึกสำเร็จเท่านั้น

ตอบกลับ HTTP 200 ตัวอย่างข้อมูลภายใน `data` ของรอบ 2 เมื่อรอบแรกได้ 80 คะแนน ตัวเลขใช้ประกอบรูปแบบ

```json
{
  "guessedLatitude": 13.65,
  "guessedLongitude": 100.49,
  "distanceMeters": 15.5,
  "score": 90,
  "accumulatedScore": 170,
  "location": {
    "latitude": 13.6501,
    "longitude": 100.4901,
    "name": "สถานที่ตัวอย่าง",
    "description": "คำอธิบายสถานที่"
  }
}
```

| ฟิลด์ | ชนิด | การใช้งาน |
| --- | --- | --- |
| distanceMeters | number | ระยะจากหมุดที่ทายถึงจุดจริง หน่วยเมตร |
| guessedLatitude | number | ละติจูดที่ผู้เล่นปักและ Backend บันทึก ใช้วาดหมุดที่ทาย |
| guessedLongitude | number | ลองจิจูดที่ผู้เล่นปักและ Backend บันทึก ใช้วาดหมุดที่ทาย |
| score | integer | คะแนนของรอบนี้ |
| accumulatedScore | integer | คะแนนสะสมรอบ 1 ถึงรอบปัจจุบัน |
| location.latitude | number | ละติจูดเฉลย |
| location.longitude | number | ลองจิจูดเฉลย |
| location.name | string | ชื่อสถานที่ |
| location.description | string หรือ null | คำอธิบายสถานที่ |

หน้าเฉลยแสดงระยะจริง คะแนนรอบนี้ และคะแนนสะสม แผนที่ใช้ guessedLatitude กับ guessedLongitude จาก Response วาดหมุดผู้เล่น คู่กับ location.latitude และ location.longitude ที่เป็นหมุดเฉลย ปุ่ม ⓘ เปิดชื่อ คำอธิบาย และรูปเดิมจาก API 02 ของรอบนี้

- เฉลยรอบ 1–4 แสดงปุ่ม **รอบถัดไป** แล้วเรียก API 02 ให้ Backend กำหนดรอบถัดไป
- เฉลยรอบ 5 แสดงปุ่ม **ดูคะแนนรวม** แล้วเรียก API 04

## 04 สรุปคะแนน

**GET `/api/games/{gameId}/summary`**

| Path parameter | ชนิด | ความหมาย |
| --- | --- | --- |
| gameId | string | รหัสเกมที่เล่นจบแล้ว |

Backend ตรวจเจ้าของเกมและผลครบ 5 รอบ อ่านผลสรุป รวมเวลาเล่นทั้ง 5 รอบ และแสดงโบนัสจากเวลาที่ใช้ คะแนนสุดท้ายเท่ากับคะแนนทายรวมบวกโบนัส

ตอบกลับ HTTP 200 ตัวอย่างข้อมูลภายใน `data`

```json
{
  "baseScore": 400,
  "totalTimeSeconds": 120,
  "bonusScore": 50,
  "totalScore": 450
}
```

ตัวเลขใช้ประกอบรูปแบบ ส่วนสูตรคะแนนและโบนัสให้ใช้กติกาที่ทีมกำหนด

| ฟิลด์ | ชนิด | การใช้งาน |
| --- | --- | --- |
| baseScore | integer | คะแนนทายรวมทั้ง 5 รอบ |
| totalTimeSeconds | number | เวลาเล่นรวม หน่วยวินาที |
| bonusScore | integer | คะแนนโบนัสจากเวลาที่ใช้ |
| totalScore | integer | คะแนนสุดท้ายรวมโบนัส |

## รูปแบบการรับส่งร่วมกัน

ระบบใช้ session cookie ระบุตัวผู้เล่น เมื่อล็อกอินสำเร็จ Backend ส่ง `Set-Cookie` เบราว์เซอร์เก็บแล้วแนบ `Cookie` เมื่อเรียก API ตามเงื่อนไขของ cookie ส่วน Backend ตรวจ session เพื่ออ่าน `user.id` และตรวจเจ้าของเกม

JSON response ใช้รูปแบบกลางของโปรเจกต์ ตัวอย่างข้างต้นแสดงเฉพาะข้อมูลภายใน `data` รูปแบบเต็มเมื่อเริ่มเกมสำเร็จคือ

```json
{
  "data": {
    "gameId": "g7"
  },
  "status": 201,
  "statusCode": "CREATED"
}
```

คำขอสำเร็จของ API 02–04 ใช้ `status: 200` และ `statusCode: "SUCCESS"` ส่วนข้อผิดพลาดใช้รูปแบบกลาง `{ error, status, statusCode: "ERROR" }`
