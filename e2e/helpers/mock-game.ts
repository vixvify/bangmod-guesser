import type { Page } from "@playwright/test";

export async function mockGameApi(page: Page) {
  await page.route("**/api/games/demo/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const data = path.endsWith("/current-round")
      ? { questionNumber: 1, imageUrl: "/images/kmutt-bangmod-1.jpg", deadlineAt: new Date(Date.now() + 40000).toISOString() }
      : path.endsWith("/result")
        ? { guessedLatitude: 13.651, guessedLongitude: 100.494, distanceMeters: 67, timedOut: false, score: 555, accumulatedScore: 1111, imageUrl: "/images/kmutt-bangmod-1.jpg", location: { name: "อาคารเรียนรวม 2", description: "สถานที่ในมหาวิทยาลัย", latitude: 13.65, longitude: 100.49 } }
        : path.endsWith("/summary")
          ? { baseScore: 4021, bonusScore: 300, totalScore: 4321, totalTimeSeconds: 87 }
          : { id: "demo", status: "INCOMPLETE", finishedAt: null };
    await route.fulfill({ status: 200, json: { data, status: 200, statusCode: "SUCCESS" } });
  });
}
