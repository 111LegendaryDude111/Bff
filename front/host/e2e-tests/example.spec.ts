import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Expect a title "to contain" a substring.
  // await expect(page).toHaveTitle(/Playwright/);
});

test("get started link", async ({ page }) => {
  // Переходим на страницу логина
  await page.goto("http://localhost:5173/login");

  await page.fill('input[name="login"]', "emilys");

  await page.fill('input[name="password"]', "emilyspass");

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL("http://localhost:5173/");
});
