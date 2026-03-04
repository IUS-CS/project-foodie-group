// ===============================
// Recipe Details Section
// Dominiq Marica + Favorites Feature
// ===============================


// ===============================
// FAVORITES (Seth Payne)
// ===============================

const FAVORITES_KEY = "foodie_favorites_v1";

function loadFavorites() {
    try {
        return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    } catch {
        return [];
    }
}

function saveFavorites(favs) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

function isFavorited(idMeal) {
    return loadFavorites().some(f => String(f.idMeal) === String(idMeal));
}

function addFavorite(meal) {
    const favs = loadFavorites();

    const exists = favs.some(f => String(f.idMeal) === String(meal.idMeal));

    if (!exists) {
        favs.push(meal);
        saveFavorites(favs);
    }
}

function removeFavorite(idMeal) {
    const favs = loadFavorites().filter(
        f => String(f.idMeal) !== String(idMeal)
    );

    saveFavorites(favs);
}

function toggleFavorite(meal) {

    if (isFavorited(meal.idMeal)) {
        removeFavorite(meal.idMeal);
        return false;
    } else {
        addFavorite(meal);
        return true;
    }
}



// ===============================
// INGREDIENT PARSER
// Dominiq Marica
// ===============================

function getIngredients(meal) {

    const list = [];

    for (let i = 1; i <= 20; i++) {

        const ingredient = meal["strIngredient" + i];
        const measure = meal["strMeasure" + i];

        if (ingredient && ingredient.trim() !== "") {

            list.push(`${measure || ""} ${ingredient}`.trim());
        }
    }

    return list;
}



// ===============================
// LOAD RECIPE DETAILS
// ===============================

async function showRecipeDetails(id) {

    const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
    );

    const data = await response.json();

    const meal = data.meals[0];

    // Save meal globally so Favorites button can access it
    window.currentMeal = meal;

    const title = meal.strMeal;
    const image = meal.strMealThumb;
    const instructions = meal.strInstructions;

    const ingredients = getIngredients(meal);

    renderRecipeDetails(meal.idMeal, title, image, ingredients, instructions);
}



// ===============================
// RENDER RECIPE DETAILS
// ===============================

function renderRecipeDetails(idMeal, title, image, ingredients, instructions) {

    const container = document.getElementById("content");

    const saved = isFavorited(idMeal);

    container.innerHTML = `
    <div class="recipe-details">

      <h2>${title}</h2>

      <button class="smallBtn" id="saveBtn">
        ${saved ? "Saved" : "Save"}
      </button>

      <img src="${image}" alt="${title}" class="recipe-image"/>

      <h3>Ingredients</h3>

      <ul>
        ${ingredients.map(item => `<li>${item}</li>`).join("")}
      </ul>

      <h3>Instructions</h3>

      <p>${instructions.replace(/\n/g, "<br>")}</p>

    </div>
  `;


    // ===============================
    // FAVORITES BUTTON HANDLER
    // ===============================

    const saveBtn = document.getElementById("saveBtn");

    saveBtn.addEventListener("click", () => {

        const meal = window.currentMeal;

        const smallMeal = {
            idMeal: meal.idMeal,
            strMeal: meal.strMeal,
            strMealThumb: meal.strMealThumb
        };

        const savedNow = toggleFavorite(smallMeal);

        saveBtn.textContent = savedNow ? "Saved" : "Save";
    });
}



// ===============================
// MAKE FUNCTION GLOBAL
// ===============================

window.showRecipeDetails = showRecipeDetails;


