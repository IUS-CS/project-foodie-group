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

// ===== Favorites (localStorage) =====
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
  const favs = loadFavorites().filter(f => String(f.idMeal) !== String(idMeal));
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

function setFavBtnState(btn, saved) {
  btn.textContent = saved ? "Saved" : "Save";
  btn.classList.toggle("saved", saved);
}

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
                <button class="smallBtn"
                  onclick="renderSearch('${m.strMeal}')">
                  View
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
