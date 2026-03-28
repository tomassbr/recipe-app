import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("unauthenticated visit to / redirects to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page renders Google sign-in button", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("button", { name: /přihlásit se přes google/i })
    ).toBeVisible();
  });

  test("unauthenticated visit to /admin redirects to /login", async ({
    page,
  }) => {
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page shows error param in alert", async ({ page }) => {
    await page.goto("/login?error=auth");
    // Use first() to avoid matching the hidden Next.js route announcer alert
    await expect(
      page.getByRole("alert").filter({ hasText: "Přihlášení se nezdařilo" })
    ).toBeVisible();
  });
});
