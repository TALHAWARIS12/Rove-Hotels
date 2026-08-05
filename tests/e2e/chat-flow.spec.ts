import { test, expect } from "@playwright/test";

test.describe("Guest Concierge & Admin Smoke Tests", () => {
  test("Welcome screen renders verbatim headline and navigates to chat", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Welcome to Rove Downtown Dubai!");
    await expect(page.locator("p")).toContainText("Instant answers, anytime.");

    await page.click("text=Start Chat");
    await expect(page).toHaveURL(/\/chat/);
    await expect(page.locator("h1")).toContainText("Rove AI Concierge");
  });

  test("Admin login screen opens", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator("h1")).toContainText("Rove Admin Portal");
  });
});
