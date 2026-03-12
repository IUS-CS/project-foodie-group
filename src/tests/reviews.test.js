// reviews.test.js

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    console.log(`PASS: ${message}`);
  } else {
    console.error(`FAIL: ${message} | expected ${expected}, got ${actual}`);
  }
}

function runReviewsTests() {
  console.log("Running Reviews Tests...");

  if (typeof loadReviews !== "function" || typeof saveReviews !== "function") {
    console.warn("SKIP: review functions not found");
    return;
  }

  const testReviews = [
    { recipeId: "2001", name: "Seth", rating: 5, comment: "Great recipe" }
  ];

  localStorage.removeItem("foodie_reviews");

  saveReviews(testReviews);

  const loaded = loadReviews();
  assertEqual(Array.isArray(loaded), true, "loadReviews returns array");
  assertEqual(loaded.length, 1, "saveReviews stores one review");
  assertEqual(loaded[0].recipeId, "2001", "review recipeId is correct");
  assertEqual(loaded[0].rating, 5, "review rating is correct");

  console.log("Reviews Tests Complete");
}
