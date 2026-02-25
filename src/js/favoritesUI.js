import { isFavorited, toggleFavorite } from "./favoritesStore.js";

function setButtonState(button, isSaved) {
  button.textContent = isSaved ? "Saved" : "Save";
  button.classList.toggle("saved", isSaved);
}

export function attachFavoriteHandlers() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".fav-btn");
    if (!button) return;

    const recipe = {
      id: button.dataset.id,
      title: button.dataset.title,
      image: button.dataset.image,
      url: button.dataset.url
    };

    const saved = toggleFavorite(recipe);
    setButtonState(button, saved);
  });
}

export function syncFavoriteButtons() {
  document.querySelectorAll(".fav-btn").forEach((button) => {
    setButtonState(button, isFavorited(button.dataset.id));
  });
}
