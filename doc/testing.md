# Testing

## Overview

Foodie Group is a static, browser-only application with no backend and no build pipeline. All tests are written in plain JavaScript and executed directly in the browser alongside the application. There is no separate test runner (no Jest, Mocha, or similar framework) — tests run as scripts loaded into a page and report results to the browser console via `console.log` / `console.error`.

---

## How Tests Work

Each test file exports a single `run*Tests()` function (e.g., `runReviewsTests()`). Tests call helper functions like `assertEqual`, `assertTrue`, and `assertContains` which print `PASS:` or `FAIL:` messages to the console.

Because tests run in the browser, they have full access to `localStorage` and the same `window` globals that the application itself uses. Store functions are exposed on `window` by the relevant store module so they can be called from test scripts loaded without module support.

**To run the tests:**
1. Open the application in a browser (e.g., `src/public/index.html`).
2. Open the browser developer console (`F12` or `Cmd+Option+I`).
3. Load the desired test script in the console (or add a `<script>` tag pointing to it in an HTML page).
4. Call the test function, e.g., `runReviewsTests()`.
5. Read `PASS` / `FAIL` output in the console.

---

## Test Files

All test files are located in `src/tests/`.

### `reviews.test.js`

Tests the reviews storage and export layer (`src/js/reviewsStore.js`).

| # | Area | What is tested |
|---|------|----------------|
| 1 | saveReviews / loadReviews | Round-trip: data saved is returned intact |
| 2 | Field integrity | recipeId, rating, reviewerName, title, and text survive a save/load cycle |
| 3 | getReviewsForRecipe | Returns only reviews matching the given recipeId; returns empty array for unknown id |
| 4 | deleteReview | Removes a review by ID; no-op on a missing ID |
| 5 | getAverageRating | Correct mean across multiple reviews; returns 0 when no reviews exist |
| 6 | hasReview | Returns true for a present review; false for a missing one |
| 7 | exportReviewsToCSV — structure | Correct number of rows; correct header columns |
| 8 | exportReviewsToCSV — data values | Recipe title, reviewer names, and ratings appear in output |
| 9 | exportReviewsToCSV — escaping | Values containing commas, double-quotes, and newlines are properly quoted and escaped |
| 10 | exportReviewsToCSV — all reviews | Omitting a recipeId exports every review |
| 11 | exportReviewsToCSV — empty | Header-only CSV is produced when no reviews match |
| 12 | getReviewById | Returns the correct review for a valid id; returns null for a missing id |
| 13 | Edit review | Updating a review changes the correct fields while preserving id and timestamp |
| 14 | Edit does not duplicate | Saving over an existing id does not add an extra entry to the list |

**Functions tested:** `saveReviews`, `loadReviews`, `getReviewsForRecipe`, `deleteReview`, `getAverageRating`, `hasReview`, `getReviewById`, `exportReviewsToCSV`

---

### `favorites.test.js`

Tests the favorites storage layer (`src/js/favoritesStore.js`).

| # | What is tested |
|---|----------------|
| 1 | `addFavorite` adds a meal to localStorage |
| 2 | `isFavorited` returns true for a saved meal |
| 3 | `toggleFavorite` removes a meal that is already saved |
| 4 | `toggleFavorite` adds a meal that is not yet saved |

**Functions tested:** `addFavorite`, `loadFavorites`, `isFavorited`, `toggleFavorite`

---

### `ingredients.test.js`

Tests ingredient extraction from the MealDB API response format.

| # | What is tested |
|---|----------------|
| 1 | `getIngredients` extracts only non-empty ingredient entries from a meal object |

**Functions tested:** `getIngredients`

---

### `search.test.js`

Tests the live search integration with TheMealDB API.

> **Note:** This test makes a real network request. It will fail if the device is offline or if TheMealDB is unavailable.

| # | What is tested |
|---|----------------|
| 1 | `mealdbSearch` returns a non-null response |
| 2 | The response contains a `meals` array |
| 3 | The `meals` array has at least one result |

**Functions tested:** `mealdbSearch`

---

## Coverage Notes

The test suite focuses on **data layer logic** — storage, retrieval, deletion, editing, calculation, and export. The following areas are not currently covered by automated tests and would need a browser automation tool (e.g., Playwright or Cypress) to test properly:

- Form validation and submission UI in `reviews.js`
- Edit mode UI (form heading change, Cancel button visibility, field pre-population)
- Star rating interaction (hover, click, highlight)
- Sort dropdown re-rendering reviews in the correct order
- CSV file download trigger (the `<a>` click dispatch)
- Dark mode theme toggle
- Navigation and URL parameter passing between pages

---

## Adding New Tests

Follow the existing pattern:

1. Create `src/tests/<feature>.test.js`.
2. Define `assertEqual` / `assertTrue` helpers (or copy from an existing test file).
3. Expose any store functions needed via `window` in the relevant store module.
4. Write a single `run<Feature>Tests()` function that cleans up `localStorage` before each section, runs assertions, and logs completion.
