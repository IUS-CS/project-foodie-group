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

function toggleFavorite(meal) {
  let favs = loadFavorites();

  const exists = favs.find(f => String(f.idMeal) === String(meal.idMeal));

  if (exists) {
    favs = favs.filter(f => String(f.idMeal) !== String(meal.idMeal));
  } else {
    favs.push(meal);
  }

  saveFavorites(favs);
  return !exists; // true if it was just saved
}

// Update Save button text
function toggleFavoriteButton(btn, meal) {
  const saved = toggleFavorite(meal);
  btn.textContent = saved ? "Saved" : "Save";
}

// Favorites Page
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
      ${favs
        .map(
          m => `
        <div class="card">
          <img class="thumb" src="${m.strMealThumb}" alt="${m.strMeal}" />

          <div class="cardBody">
            <h3 class="cardTitle">${m.strMeal}</h3>

            <div class="cardActions">
              <button class="smallBtn" onclick="showRecipeDetails('${m.idMeal}')">View</button>
              <button class="smallBtn" onclick="removeFavoriteFromPage('${m.idMeal}')">Remove</button>
            </div>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

// Back navigation fix (Favorites should return to Home)
function openFavoritesView() {
  pushView(() => renderHome());
  openFavorites();
}

function removeFavoriteFromPage(idMeal) {
  let favs = loadFavorites();
  favs = favs.filter(f => String(f.idMeal) !== String(idMeal));
  saveFavorites(favs);
  openFavorites();
}

// Make available to HTML onclick handlers
window.openFavoritesView = openFavoritesView;
window.openFavorites = openFavorites;
window.toggleFavoriteButton = toggleFavoriteButton;
window.removeFavoriteFromPage = removeFavoriteFromPage;

// ===============================
// EXISTING GROUP CODE
// ===============================

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2000);
}

function setToolbar(visible, title = "") {
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
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
      query
    )}`
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
        ${meals
          .map(
            m => `
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
                    strMeal:'${m.strMeal.replace(/'/g, "\\'")}',
                    strMealThumb:'${m.strMealThumb}'
                  })">
                  ${isFavorited(m.idMeal) ? "Saved" : "Save"}
                </button>
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  } catch (err) {
    content.innerHTML = `
      <div class="section">
        <h3>Error loading recipes</h3>
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
  const data = await mealdbRandom();
  const meal = data.meals[0];
  pushView(() => renderSearch(meal.strMeal));
  renderSearch(meal.strMeal);
}

searchBtn.addEventListener("click", onSearch);
randomBtn.addEventListener("click", onRandom);
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") onSearch();
});
backBtn.addEventListener("click", goBack);

renderHome();
