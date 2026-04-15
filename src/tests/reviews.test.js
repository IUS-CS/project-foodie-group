// reviews.test.js
// Unit tests for the Reviews feature (reviewsStore.js)
// Brayton Rumple

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    console.log(`PASS: ${message}`);
  } else {
    console.error(`FAIL: ${message} | expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertTrue(value, message) {
  assertEqual(!!value, true, message);
}

function assertFalse(value, message) {
  assertEqual(!!value, false, message);
}

function assertContains(str, substring, message) {
  if (String(str).includes(substring)) {
    console.log(`PASS: ${message}`);
  } else {
    console.error(`FAIL: ${message} | "${substring}" not found in "${str}"`);
  }
}

function runReviewsTests() {
  console.log("=== Running Reviews Tests ===");

  const fns = [
    "loadReviews", "saveReviews", "deleteReview",
    "getReviewsForRecipe", "getAverageRating", "hasReview", "exportReviewsToCSV"
  ];
  const missing = fns.filter((fn) => typeof window[fn] !== "function");
  if (missing.length) {
    console.warn(`SKIP: missing functions: ${missing.join(", ")}`);
    return;
  }

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------

  function seed() {
    localStorage.removeItem("foodie_reviews_v1");
    saveReviews([
      { id: "r1", recipeId: "2001", title: "Pasta", reviewerName: "Alice", rating: 5, text: "Delicious", timestamp: 1000 },
      { id: "r2", recipeId: "2001", title: "Pasta", reviewerName: "Bob",   rating: 3, text: "Okay",      timestamp: 2000 },
      { id: "r3", recipeId: "2002", title: "Tacos", reviewerName: "Carol", rating: 4, text: "Tasty",     timestamp: 3000 }
    ]);
  }

  // ------------------------------------------------------------------
  // 1. saveReviews / loadReviews
  // ------------------------------------------------------------------
  console.log("-- saveReviews / loadReviews --");
  seed();

  const all = loadReviews();
  assertEqual(Array.isArray(all), true, "loadReviews returns an array");
  assertEqual(all.length, 3, "loadReviews returns all saved reviews");

  // ------------------------------------------------------------------
  // 2. Review field integrity
  // ------------------------------------------------------------------
  console.log("-- field integrity --");

  const pasta = all.find((r) => r.id === "r1");
  assertTrue(pasta, "review with id r1 exists");
  assertEqual(pasta.recipeId, "2001", "recipeId is preserved");
  assertEqual(pasta.rating, 5, "rating is preserved");
  assertEqual(pasta.reviewerName, "Alice", "reviewerName is preserved");
  assertEqual(pasta.title, "Pasta", "title is preserved");
  assertEqual(pasta.text, "Delicious", "text is preserved");

  // ------------------------------------------------------------------
  // 3. getReviewsForRecipe
  // ------------------------------------------------------------------
  console.log("-- getReviewsForRecipe --");
  seed();

  const pastaReviews = getReviewsForRecipe("2001");
  assertEqual(pastaReviews.length, 2, "getReviewsForRecipe returns only matching reviews");

  const tacoReviews = getReviewsForRecipe("2002");
  assertEqual(tacoReviews.length, 1, "getReviewsForRecipe returns single matching review");

  const noneReviews = getReviewsForRecipe("9999");
  assertEqual(noneReviews.length, 0, "getReviewsForRecipe returns empty array for unknown recipe");

  // ------------------------------------------------------------------
  // 4. deleteReview
  // ------------------------------------------------------------------
  console.log("-- deleteReview --");
  seed();

  deleteReview("r1");
  const afterDelete = loadReviews();
  assertEqual(afterDelete.length, 2, "deleteReview removes one review");
  assertFalse(afterDelete.find((r) => r.id === "r1"), "deleted review is no longer in list");

  deleteReview("r1"); // deleting a non-existent ID should not throw
  assertEqual(loadReviews().length, 2, "deleting non-existent id is a no-op");

  // ------------------------------------------------------------------
  // 5. getAverageRating
  // ------------------------------------------------------------------
  console.log("-- getAverageRating --");
  seed();

  const avg2001 = getAverageRating("2001");
  assertEqual(avg2001, 4, "getAverageRating calculates correct average ((5+3)/2 = 4)");

  const avg2002 = getAverageRating("2002");
  assertEqual(avg2002, 4, "getAverageRating returns correct single-review average");

  const avgNone = getAverageRating("9999");
  assertEqual(avgNone, 0, "getAverageRating returns 0 when no reviews exist");

  // ------------------------------------------------------------------
  // 6. hasReview
  // ------------------------------------------------------------------
  console.log("-- hasReview --");
  seed();

  assertTrue(hasReview("r1"), "hasReview returns true for existing review");
  assertFalse(hasReview("r999"), "hasReview returns false for missing review");

  // ------------------------------------------------------------------
  // 7. exportReviewsToCSV — structure
  // ------------------------------------------------------------------
  console.log("-- exportReviewsToCSV structure --");
  seed();

  const csv = exportReviewsToCSV("2001");
  const lines = csv.trim().split("\n");

  assertEqual(lines.length, 3, "CSV has header row + 2 data rows for recipe 2001");
  assertEqual(lines[0], "Recipe Name,Reviewer Name,Rating (out of 5),Review,Date", "CSV header row is correct");

  // ------------------------------------------------------------------
  // 8. exportReviewsToCSV — data values
  // ------------------------------------------------------------------
  console.log("-- exportReviewsToCSV data values --");

  assertContains(lines[1], "Pasta", "CSV row contains recipe title");
  assertContains(csv, "Alice", "CSV contains reviewer name Alice");
  assertContains(csv, "Bob", "CSV contains reviewer name Bob");
  assertContains(csv, "5", "CSV contains rating 5");
  assertContains(csv, "3", "CSV contains rating 3");

  // ------------------------------------------------------------------
  // 9. exportReviewsToCSV — CSV escaping
  // ------------------------------------------------------------------
  console.log("-- exportReviewsToCSV escaping --");
  localStorage.removeItem("foodie_reviews_v1");
  saveReviews([
    {
      id: "esc1",
      recipeId: "3001",
      title: 'Soup, "Hot"',
      reviewerName: "Dave",
      rating: 4,
      text: "Great\nSecond line",
      timestamp: 1000
    }
  ]);

  const escapedCsv = exportReviewsToCSV("3001");
  assertContains(escapedCsv, '"Soup, ""Hot"""', "title with comma and quotes is properly escaped");
  assertContains(escapedCsv, '"Great\nSecond line"', "text with newline is wrapped in quotes");

  // ------------------------------------------------------------------
  // 10. exportReviewsToCSV — all reviews (no recipeId filter)
  // ------------------------------------------------------------------
  console.log("-- exportReviewsToCSV all reviews --");
  seed();

  const allCsv = exportReviewsToCSV(null);
  const allLines = allCsv.trim().split("\n");
  assertEqual(allLines.length, 4, "CSV with no filter exports header + all 3 reviews");

  // ------------------------------------------------------------------
  // 11. exportReviewsToCSV — empty set
  // ------------------------------------------------------------------
  console.log("-- exportReviewsToCSV empty --");

  const emptyCsv = exportReviewsToCSV("9999");
  const emptyLines = emptyCsv.trim().split("\n");
  assertEqual(emptyLines.length, 1, "CSV for recipe with no reviews has only a header row");
  assertEqual(emptyLines[0], "Recipe Name,Reviewer Name,Rating (out of 5),Review,Date", "empty CSV still has correct header");

  // ------------------------------------------------------------------
  // 12. getReviewById
  // ------------------------------------------------------------------
  console.log("-- getReviewById --");
  seed();

  const found = getReviewById("r2");
  assertTrue(found, "getReviewById returns a review for a valid id");
  assertEqual(found.reviewerName, "Bob", "getReviewById returns the correct review");

  const notFound = getReviewById("r999");
  assertEqual(notFound, null, "getReviewById returns null for a missing id");

  // ------------------------------------------------------------------
  // 13. editing a review — updates fields, preserves id and timestamp
  // ------------------------------------------------------------------
  console.log("-- edit review --");
  seed();

  const original = getReviewById("r1");
  saveReview({
    id: original.id,
    recipeId: original.recipeId,
    title: original.title,
    reviewerName: "Alice Updated",
    image: original.image,
    rating: 4,
    text: "Even better on second thought",
    timestamp: original.timestamp
  });

  const edited = getReviewById("r1");
  assertEqual(edited.reviewerName, "Alice Updated", "edit updates reviewerName");
  assertEqual(edited.rating, 4, "edit updates rating");
  assertEqual(edited.text, "Even better on second thought", "edit updates review text");
  assertEqual(edited.id, original.id, "edit preserves the original id");
  assertEqual(edited.timestamp, original.timestamp, "edit preserves the original timestamp");

  // ------------------------------------------------------------------
  // 14. editing does not create a duplicate
  // ------------------------------------------------------------------
  console.log("-- edit does not duplicate --");

  const afterEditList = getReviewsForRecipe("2001");
  assertEqual(afterEditList.length, 2, "editing a review does not add an extra entry");

  // ------------------------------------------------------------------
  // 15. editedAt — set when editing, absent on new reviews
  // ------------------------------------------------------------------
  console.log("-- editedAt field --");
  seed();

  const fresh = getReviewById("r1");
  assertEqual(fresh.editedAt, null, "new review has no editedAt");

  saveReview({
    id: fresh.id,
    recipeId: fresh.recipeId,
    title: fresh.title,
    reviewerName: fresh.reviewerName,
    image: fresh.image,
    rating: fresh.rating,
    text: "Updated text",
    timestamp: fresh.timestamp,
    editedAt: 9999
  });

  const afterEdit = getReviewById("r1");
  assertEqual(afterEdit.editedAt, 9999, "editedAt is stored when provided");
  assertEqual(afterEdit.timestamp, fresh.timestamp, "timestamp unchanged after edit");

  // ------------------------------------------------------------------
  // 16. editedAt — not set on a brand-new save
  // ------------------------------------------------------------------
  console.log("-- editedAt absent on new save --");
  localStorage.removeItem("foodie_reviews_v1");
  saveReviews([
    { id: "new1", recipeId: "5001", title: "New", reviewerName: "Eve", rating: 3, text: "", timestamp: 1000 }
  ]);
  const brandNew = getReviewById("new1");
  assertEqual(brandNew.editedAt, null, "editedAt is null on a brand-new review");

  console.log("=== Reviews Tests Complete ===");
}
