// Project Foodie Group
// Recipe Search Section
// Uses TheMealDB public API (no API key required)

const content = document.getElementById("content");
const toolbar = document.getElementById("toolbar");
const backBtn = document.getElementById("backBtn");
const contextTitle = document.getElementById("contextTitle");
const toast = document.getElementById("toast");

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const randomBtn = document.getElementById("randomBtn");

let navStack = [];

// ===============================
// Favorites Feature (Seth Payne)
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

function toggleFavoriteButton(btn, meal) {
  const saved = toggleFavorite(meal);
  btn.textContent = saved ? "Saved" : "Save";
}

function openFavorites() {
  const favs = loadFavorites();

  setToolbar(true, "Favorites");

  if (favs.length === 0) {
    content.innerHTML = `
      <div class="section">
        <h3>No favorites saved</h3>
        <p class="muted">Save recipes to see them here.</p>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <div class="grid">
      ${favs.map(m => `
        <div class="card">
          <img class="thumb" src="${m.strMealThumb}" alt="${m.strMeal}" />

          <div class="cardBody">
            <h3 class="cardTitle">${m.strMeal}</h3>

            <div class="cardActions">
              <button class="smallBtn" onclick="showRecipeDetails('${m.idMeal}')">
                View
              </button>
              <button class="smallBtn" onclick="removeFavoriteFromPage('${m.idMeal}')">
                Remove
              </button>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function openFavoritesView() {
  pushView(() => renderHome());
  openFavorites();
}

function removeFavoriteFromPage(idMeal) {
  removeFavorite(idMeal);
  openFavorites();
}

// ===============================
// UI / Group Code
// ===============================

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2000);
}

function setToolbar(visible, title = "") {
  if (!toolbar || !contextTitle) return;
  toolbar.classList.toggle("hidden", !visible);
  contextTitle.textContent = title;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Network error");
  return await res.json();
}

async function mealdbSearch(query) {
  return fetchJson(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`
  );
}

async function mealdbRandom() {
  return fetchJson(`https://www.themealdb.com/api/json/v1/1/random.php`);
}

function pushView(fn) {
  navStack.push(fn);
}

function goBack() {
  navStack.pop();
  const prev = navStack[navStack.length - 1];
  if (prev) prev();
  else renderHome();
}

function renderHome() {
  setToolbar(false);

  content.innerHTML = `
    <div class="section">
      <h3>Recipe Search</h3>
      <p class="muted">
        Search for a recipe by keyword. Example: chicken, pasta, tacos.
      </p>

      <button class="smallBtn" onclick="openFavoritesView()">Favorites</button>
    </div>
  `;

  navStack = [renderHome];
}

async function renderSearch(query) {
  setToolbar(true, `Search: "${query}"`);
  content.innerHTML = `<div class="loading">Searching recipes...</div>`;

  try {
    const data = await mealdbSearch(query);
    const meals = data.meals || [];

    if (meals.length === 0) {
      content.innerHTML = `
        <div class="section">
          <h3>No results found</h3>
          <p class="muted">Try another keyword.</p>
        </div>
      `;
      return;
    }

    content.innerHTML = `
      <div class="grid">
        ${meals.map(m => `
          <div class="card">
            <img class="thumb" src="${m.strMealThumb}" alt="${m.strMeal}" />

            <div class="cardBody">
              <h3 class="cardTitle">${m.strMeal}</h3>

              <div class="cardActions">
                <button class="smallBtn" onclick="showRecipeDetails('${m.idMeal}')">
                  View
                </button>

                <button class="smallBtn"
                  onclick="toggleFavoriteButton(this,{
                    idMeal:'${m.idMeal}',
                    strMeal:${JSON.stringify(m.strMeal)},
                    strMealThumb:'${m.strMealThumb}'
                  })">
                  ${isFavorited(m.idMeal) ? "Saved" : "Save"}
                </button>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  } catch (err) {
    content.innerHTML = `
      <div class="section">
        <h3>Error loading recipes</h3>
        <p class="muted">Please try again.</p>
      </div>
    `;
  }
}

async function onSearch() {
  const q = searchInput.value.trim();
  if (!q) return showToast("Enter a search term.");
  pushView(() => renderSearch(q));
  await renderSearch(q);
}

async function onRandom() {
  try {
    const data = await mealdbRandom();
    const meal = data.meals[0];
    pushView(() => renderSearch(meal.strMeal));
    await renderSearch(meal.strMeal);
  } catch (err) {
    showToast("Error loading random recipe.");
  }
}

// ===============================
// Recipe Details Section
// Dominiq Marica + Favorites Feature
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

async function showRecipeDetails(id) {
  try {
    setToolbar(true, "Recipe Details");
    content.innerHTML = `<div class="loading">Loading recipe details...</div>`;

    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
    );

    if (!response.ok) {
      throw new Error("Failed to load recipe details");
    }

    const data = await response.json();

    if (!data.meals || data.meals.length === 0) {
      content.innerHTML = `
        <div class="section">
          <h3>Recipe not found</h3>
        </div>
      `;
      return;
    }

    const meal = data.meals[0];

    window.currentMeal = meal;

    const title = meal.strMeal;
    const image = meal.strMealThumb;
    const instructions = meal.strInstructions || "No instructions available.";
    const ingredients = getIngredients(meal);

    renderRecipeDetails(meal.idMeal, title, image, ingredients, instructions);
  } catch (err) {
    content.innerHTML = `
      <div class="section">
        <h3>Error loading recipe details</h3>
        <p class="muted">Please try again.</p>
      </div>
    `;
  }
}

function renderRecipeDetails(idMeal, title, image, ingredients, instructions) {
  const saved = isFavorited(idMeal);

  content.innerHTML = `
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

  const saveBtn = document.getElementById("saveBtn");

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const meal = window.currentMeal;
      if (!meal) return;

      const smallMeal = {
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb
      };

      const savedNow = toggleFavorite(smallMeal);
      saveBtn.textContent = savedNow ? "Saved" : "Save";
    });
  }
}

// ===============================
// Global Functions for onclick
// ===============================

window.openFavoritesView = openFavoritesView;
window.openFavorites = openFavorites;
window.toggleFavoriteButton = toggleFavoriteButton;
window.removeFavoriteFromPage = removeFavoriteFromPage;
window.showRecipeDetails = showRecipeDetails;

// ===============================
// Event Listeners
// ===============================

if (searchBtn) searchBtn.addEventListener("click", onSearch);
if (randomBtn) randomBtn.addEventListener("click", onRandom);
if (searchInput) {
  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") onSearch();
  });
}
if (backBtn) backBtn.addEventListener("click", goBack);

// ===============================
// Start App
// ===============================

renderHome();
