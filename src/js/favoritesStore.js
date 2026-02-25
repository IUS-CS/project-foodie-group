const FAVORITES_KEY = "foodie_favorites_v1";

export function getFavoritesMap() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || {};
  } catch {
    return {};
  }
}

export function getFavoritesList() {
  return Object.values(getFavoritesMap());
}

export function isFavorited(id) {
  const favs = getFavoritesMap();
  return Boolean(favs[String(id)]);
}

export function addFavorite(recipe) {
  const favs = getFavoritesMap();
  favs[String(recipe.id)] = recipe;
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

export function removeFavorite(id) {
  const favs = getFavoritesMap();
  delete favs[String(id)];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

export function toggleFavorite(recipe) {
  const id = String(recipe.id);
  if (isFavorited(id)) {
    removeFavorite(id);
    return false;
  }
  addFavorite(recipe);
  return true;
}
