// ===============================
// Recipe Details Section
// Dominiq Marica
// ===============================

// This function pulls all ingredients + measurements from a meal object
// TheMealDB stores them as strIngredient1, strIngredient2, etc.
// Loop through 1–20 and collect the ones that exist

function getIngredients(meal) {

    const list = []; // this will store the final ingredient strings

    // The API allows up to 20 ingredients per recipe
    for (let i = 1; i <= 20; i++) {

        // Access dynamic property names like strIngredient1, strIngredient2...
        const ingredient = meal["strIngredient" + i];
        const measure = meal["strMeasure" + i];

        // Only add it if it exists and is not just empty spaces
        if (ingredient && ingredient.trim() !== "") {

            // Combine measurement + ingredient (ex: "1 cup Sugar")
            // If measurement is missing, it won’t break
            list.push(`${measure || ""} ${ingredient}`.trim());
        }
    }

    // Return the full cleaned ingredient list
    return list;
}

// This function runs when someone clicks "View"
// It fetches ONE specific recipe using its ID

async function showRecipeDetails(id) {

    // Call TheMealDB API using the recipe ID
    const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
    );

    // Convert the response into usable JSON
    const data = await response.json();

    // The API returns an array, so we grab the first (and only) meal
    const meal = data.meals[0];

    // Pull out the fields we need
    const title = meal.strMeal;
    const image = meal.strMealThumb;
    const instructions = meal.strInstructions;

    // Use our helper function to build the ingredients list
    const ingredients = getIngredients(meal);

    // Send everything to the display function
    renderRecipeDetails(title, image, ingredients, instructions);

}

// This function puts the recipe info into the HTML page

function renderRecipeDetails(title, image, ingredients, instructions) {

    // Grab the main content container from index.html
    const container = document.getElementById("content");

    // Replace everything inside it with recipe details
    container.innerHTML = `
    <div class="recipe-details">

      <h2>${title}</h2>

      <!-- Show recipe image -->
      <img src="${image}" alt="${title}" class="recipe-image"/>

      <h3>Ingredients</h3>
      <ul>
        <!-- Turn ingredients array into <li> items -->
        ${ingredients.map(item => `<li>${item}</li>`).join("")}
      </ul>

      <h3>Instructions</h3>

      <!-- Replace line breaks with <br> so formatting looks correct -->
      <p>${instructions.replace(/\n/g, "<br>")}</p>

    </div>
  `;
}

// This makes the function accessible from HTML buttons
window.showRecipeDetails = showRecipeDetails;


