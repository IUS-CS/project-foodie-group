// favorites.test.js
// Unit tests for Favorites Feature
// Seth Payne

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    console.log("PASS:", message);
  } else {
    console.error("FAIL:", message, "| expected:", expected, "got:", actual);
  }
}

function runFavoritesTests() {

  console.log("Running Favorites Tests...");

  const meal = {
    idMeal: "123",
    strMeal: "Test Chicken",
    strMealThumb: "image.jpg"
  };

  localStorage.removeItem("foodie_favorites_v1");

  // test addFavorite
  addFavorite(meal);
  let favs = loadFavorites();

  assertEqual(favs.length, 1, "addFavorite adds meal");

  // test isFavorited
  assertEqual(isFavorited("123"), true, "isFavorited detects saved meal");

  // test toggleFavorite remove
  toggleFavorite(meal);
  favs = loadFavorites();

  assertEqual(favs.length, 0, "toggleFavorite removes meal");

  // test toggleFavorite add
  toggleFavorite(meal);
  favs = loadFavorites();

  assertEqual(favs.length, 1, "toggleFavorite adds meal");

}

runFavoritesTests();
