// ingredients.test.js

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    console.log("PASS:", message);
  } else {
    console.error("FAIL:", message);
  }
}

function runIngredientTests() {

  console.log("Running Ingredient Tests...");

  const meal = {
    strIngredient1: "Chicken",
    strMeasure1: "1 lb",

    strIngredient2: "Salt",
    strMeasure2: "1 tsp",

    strIngredient3: "",
    strMeasure3: ""
  };

  const result = getIngredients(meal);

  assertEqual(result.length, 2, "getIngredients extracts correct count");
}

runIngredientTests();
