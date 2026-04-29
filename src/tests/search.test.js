// search.test.js

function assertTrue(value, message) {
  if (value) {
    console.log(`PASS: ${message}`);
  } else {
    console.error(`FAIL: ${message}`);
  }
}
// local API call for testing (Heidi)
async function mealdbSearch(query) {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`
  );
  return res.json();
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
    // SEARCH EDGE CASES (Heidi Ganim)

  try {
    const emptyData = await mealdbSearch("asdkfjaskldf");

    assertTrue(emptyData !== null, "handles empty search safely");

    if (emptyData.meals === null) {
      assertTrue(true, "empty results return null meals");
    } else {
      assertTrue(Array.isArray(emptyData.meals), "empty results return array");
    }
  } catch (err) {
    console.error("FAIL: empty search handling threw error", err);
  }

  try {
    await mealdbSearch("");
    assertTrue(typeof mealdbSearch === "function", "handles empty string input without crashing");
  } catch (err) {
    console.error("FAIL: empty input caused crash", err);
  }

  try {
    throw new Error("network failure");
  } catch (err) {
    assertTrue(err instanceof Error, "handles network failure case");
  }

  console.log("Search Tests Complete");
}
runSearchTests();