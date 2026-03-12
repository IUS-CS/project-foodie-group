// search.test.js

function assertTrue(value, message) {
  if (value) {
    console.log(`PASS: ${message}`);
  } else {
    console.error(`FAIL: ${message}`);
  }
}

async function runSearchTests() {
  console.log("Running Search Tests...");

  if (typeof mealdbSearch !== "function") {
    console.warn("SKIP: mealdbSearch function not found");
    return;
  }

  try {
    const data = await mealdbSearch("chicken");

    assertTrue(data !== null, "mealdbSearch returns data");
    assertTrue(Array.isArray(data.meals), "mealdbSearch returns meals array");
    assertTrue(data.meals.length > 0, "mealdbSearch returns at least one result");
  } catch (err) {
    console.error("FAIL: mealdbSearch threw an error", err);
  }

  console.log("Search Tests Complete");
}
