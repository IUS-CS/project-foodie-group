// ===============================
// Reviews Page
// ===============================

import { getAverageRating, getReviewsForRecipe, saveReview, deleteReview } from "./reviewsStore.js";

const params = new URLSearchParams(window.location.search);
const recipeContext = {
  recipeId: params.get("recipeId") || "",
  title: params.get("title") || "",
  image: params.get("image") || ""
};

// ---- Star Rating Logic ----

let selectedRating = 0;
const stars = document.querySelectorAll(".star");
const ratingInput = document.getElementById("rating-value");
const recipeTitleInput = document.getElementById("recipe-title");
const reviewerNameInput = document.getElementById("reviewer-name");
const currentRecipe = document.getElementById("current-recipe");
const averageRating = document.getElementById("average-rating");

if (recipeContext.title) {
  recipeTitleInput.value = recipeContext.title;
}

currentRecipe.textContent = recipeContext.title
  ? `Reviewing: ${recipeContext.title}`
  : "No recipe selected. Open reviews from a recipe details page.";

stars.forEach((star) => {
  star.addEventListener("mouseenter", () => highlightStars(Number(star.dataset.value)));
  star.addEventListener("mouseleave", () => highlightStars(selectedRating));
  star.addEventListener("click", () => {
    selectedRating = Number(star.dataset.value);
    ratingInput.value = selectedRating;
    highlightStars(selectedRating);
  });
});

function highlightStars(count) {
  stars.forEach((star) => {
    const val = Number(star.dataset.value);
    star.classList.toggle("active", val <= count);
  });
}

// ---- Form Submission ----

const form = document.getElementById("review-form");
const formError = document.getElementById("form-error");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = recipeTitleInput.value.trim();
  const reviewerName = reviewerNameInput.value.trim();
  const rating = Number(ratingInput.value);
  const text = document.getElementById("review-text").value.trim();
  const recipeId = recipeContext.recipeId || title.toLowerCase().replace(/\s+/g, "_");

  if (!title || !reviewerName || rating === 0) {
    formError.hidden = false;
    return;
  }

  formError.hidden = true;

  saveReview({
    id: Date.now(),
    recipeId,
    title,
    reviewerName,
    image: recipeContext.image,
    rating,
    text,
    timestamp: Date.now()
  });

  // Reset form
  form.reset();
  recipeTitleInput.value = title;
  selectedRating = 0;
  ratingInput.value = 0;
  highlightStars(0);

  renderReviews();
});

// ---- Render Past Reviews ----

function renderReviews() {
  const list = recipeContext.recipeId ? getReviewsForRecipe(recipeContext.recipeId) : [];
  const container = document.getElementById("reviews-list");
  const avg = recipeContext.recipeId ? getAverageRating(recipeContext.recipeId) : 0;

  averageRating.textContent = list.length
    ? `Average rating: ${avg.toFixed(1)} / 5 (${list.length} review${list.length === 1 ? "" : "s"})`
    : "Average rating: N/A";

  if (list.length === 0) {
    container.innerHTML = recipeContext.recipeId
      ? `<p class="empty-state">No reviews yet for this recipe. Be the first to write one!</p>`
      : `<p class="empty-state">Open this page from a recipe details view to see that recipe's reviews.</p>`;
    return;
  }

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

  container.innerHTML = list.map((review) => `
    <div class="review-card" data-id="${review.id}">
      ${review.image ? `<img src="${escapeHtml(review.image)}" alt="${escapeHtml(review.title)}">` : ""}
      <div class="review-body">
        <p class="review-title">${escapeHtml(review.title)}</p>
        <div class="review-stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
        <p class="review-byline">By ${escapeHtml(review.reviewerName || "Anonymous")}</p>
        ${review.text ? `<p class="review-text">${escapeHtml(review.text)}</p>` : ""}
        <span class="review-date">${new Date(review.timestamp).toLocaleDateString()}</span>
      </div>
      <button class="delete-btn" data-id="${review.id}" aria-label="Delete review">✕</button>
    </div>
  `).join("");
}

// ---- Delete via delegation ----

document.getElementById("reviews-list").addEventListener("click", (e) => {
  const btn = e.target.closest(".delete-btn");
  if (!btn) return;
  deleteReview(btn.dataset.id);
  renderReviews();
});

// ---- Init ----
renderReviews();
