const { test, expect } = require("@playwright/test");

const mockProducts = [
  {
    _id: "p1",
    title: "Data Structures Book",
    price: 1500,
    isFree: false,
    category: "Textbooks",
    faculty: "Computing",
    condition: "Good",
    images: [],
    seller: { fullname: "John Doe", email: "john@test.com" },
    viewCount: 10,
    favouritedBy: [],
  },
  {
    _id: "p2",
    title: "Free Calculator",
    price: 0,
    isFree: true,
    category: "Electronics",
    faculty: "Engineering",
    condition: "New",
    images: [],
    seller: { fullname: "Jane Doe", email: "jane@test.com" },
    viewCount: 5,
    favouritedBy: [],
  },
];

test.beforeEach(async ({ page }) => {
  // Use a wildcard to catch all variations of the marketplace API
  await page.route(/\/api\/marketplace/, async (route) => {
    const url = route.request().url();
    
    // Log the URL to your terminal to verify it's being intercepted
    console.log(`Intercepted: ${url}`);

    if (url.includes('favourites') || url.includes('my-listings')) {
      await route.fulfill({ json: { data: [] } });
    } else {
      await route.fulfill({ json: { data: mockProducts } });
    }
  });

  // Navigate and wait for the network to be idle
  await page.goto("http://localhost:5173/marketplace", { waitUntil: 'networkidle' });
});


test.describe("Marketplace Page Tests", () => {
  
  test("Marketplace loads products correctly", async ({ page }) => {
    await expect(page.getByText("Campus Marketplace")).toBeVisible();
    await expect(page.getByText("Data Structures Book").first()).toBeVisible();
    await expect(page.getByText("Free Calculator").first()).toBeVisible();
  });



  test("Search input works", async ({ page }) => {
    const search = page.getByPlaceholder(/Search textbooks/i);
    await search.fill("Data Structures");
    await expect(search).toHaveValue("Data Structures");
  });

  test("Free item shows FREE label", async ({ page }) => {
    // If the label is uppercase "FREE" in the mock product card
    await expect(page.getByText("FREE").first()).toBeVisible();
  });

});
