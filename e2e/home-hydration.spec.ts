import { expect, test } from "@playwright/test";

test("renders the home navbar without Emotion styles inside the body or hydration errors", async ({
  page,
  request,
}) => {
  const response = await request.get("/");
  expect(response.ok()).toBe(true);

  const markup = await response.text();
  const serverMarkup = await page.evaluate((html) => {
    const document = new DOMParser().parseFromString(html, "text/html");
    return {
      hasNavbar: document.querySelector("nav") !== null,
      hasInlineNavbarStyle:
        document.querySelector("nav style[data-emotion]") !== null,
    };
  }, markup);
  expect(serverMarkup.hasNavbar).toBe(true);
  expect(serverMarkup.hasInlineNavbarStyle).toBe(false);

  const hydrationErrors: string[] = [];
  page.on("pageerror", (error) => {
    if (error.message.includes("Hydration failed")) {
      hydrationErrors.push(error.message);
    }
  });

  await page.goto("/");
  await expect(page.getByRole("navigation")).toBeVisible();
  expect(hydrationErrors).toEqual([]);
});

test("provides search and social metadata for the home page", async ({ page, request }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle("Bangmod Guesser");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /บางมด/);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Bangmod Guesser");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new URL("/", page.url()).origin);
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain(`Sitemap: ${new URL("/sitemap.xml", page.url()).href}`);
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).toContain(new URL("/", page.url()).origin);
});

test("uses a smaller play button on mobile than desktop", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const play = page.getByRole("button", { name: "Play Bangmod Guesser" });
  await expect(play).toBeVisible();
  const mobile = await play.boundingBox();
  await page.setViewportSize({ width: 1280, height: 800 });
  const desktop = await play.boundingBox();
  expect(mobile).not.toBeNull();
  expect(desktop).not.toBeNull();
  expect(mobile!.width).toBeLessThan(desktop!.width);
});
