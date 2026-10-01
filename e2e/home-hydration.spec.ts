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
