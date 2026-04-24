import { test, expect } from "@playwright/test";

test.describe("Profile Page Tests", () => {
  test.beforeEach(async ({ page }) => {
    // mock auth user so component does not break
    await page.addInitScript(() => {
      localStorage.setItem(
        "user",
        JSON.stringify({
          _id: "1234567890abcdef12345678",
          fullname: "Test User",
          university_name: "SLIIT",
          graduate_year: "2025",
        })
      );
      localStorage.setItem("userId", "1234567890abcdef12345678");
      localStorage.setItem("ownerId", "1234567890abcdef12345678");
    });

    await page.route("**/api/profile/**", async (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            bio: "Test bio",
            avg_rating: 4.5,
            total_reviews: 10,
            skills: ["React", "Node"],
            profile_picture: "",
            user_id: {
              fullname: "Test User",
              university_name: "SLIIT",
              graduate_year: "2025",
            },
          },
        }),
      });
    });

    await page.route("**/api/services**", async (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [
            {
              _id: "s1",
              title: "Web Design Service",
              category: "Design",
              pricePerHour: 500,
              locationMode: "Online",
              isPublished: true,
            },
          ],
        }),
      });
    });

    await page.route("**/api/reviews**", async (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { rating: 5 },
          { rating: 4 },
        ]),
      });
    });

    await page.goto("http://localhost:5173/profile");
  });

  test("should load profile page", async ({ page }) => {
    await expect(page.getByText("Student Profile")).toBeVisible();
  });

  test("should render profile data", async ({ page }) => {
    await expect(page.getByText("Test User")).toBeVisible();
    await expect(page.getByText("SLIIT")).toBeVisible();
    await expect(page.getByText("Test bio")).toBeVisible();
  });
/*
  test("should show stats cards", async ({ page }) => {
    await expect(page.getByText("Revenue")).toBeVisible();
    await expect(page.getByText("Bookings")).toBeVisible();
    await expect(page.getByText("Total Views")).toBeVisible();
  });
*/
  test("should enter edit mode", async ({ page }) => {
    await page.getByRole("button", { name: /edit profile/i }).click();
    await expect(page.getByPlaceholder(/write something about you/i)).toBeVisible();
  });

  test("should add skill in edit mode", async ({ page }) => {
    await page.getByRole("button", { name: /edit profile/i }).click();

    await page.getByPlaceholder(/type a skill/i).fill("Testing");
    await page.keyboard.press("Enter");

    await expect(page.getByText("Testing")).toBeVisible();
  });

  test("should logout user", async ({ page }) => {
    await page.getByRole("button", { name: /logout/i }).click();

    await expect(page).toHaveURL(/login/);
  });

  test("should render services", async ({ page }) => {
    await expect(page.getByText("My Services")).toBeVisible();
    await expect(page.getByText("Web Design Service")).toBeVisible();
  });
/*
  test("should toggle service status button", async ({ page }) => {
    const pauseBtn = page.locator("button").filter({ hasText: /pause|play/i }).first();
    await pauseBtn.click();
  });

  test("should open booking history section", async ({ page }) => {
    await expect(page.getByText(/booking history/i)).toBeVisible();
  });
  */
});