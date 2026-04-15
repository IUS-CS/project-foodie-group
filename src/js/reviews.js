// ===============================
// Reviews Page
// ===============================

import { getAverageRating, getReviewsForRecipe, getReviewById, saveReview, deleteReview, exportReviewsToCSV } from "./reviewsStore.js";

const params = new URLSearchParams(window.location.search);
const recipeContext = {
  recipeId: params.get("recipeId") || "",
  title: params.get("title") || "",
  image: params.get("image") || ""
};

// ---- Star Rating Logic ----

let selectedRating = 0;
let editingId = null;

const stars = document.querySelectorAll(".star");
const ratingInput = document.getElementById("rating-value");
const recipeTitleInput = document.getElementById("recipe-title");
const reviewerNameInput = document.getElementById("reviewer-name");
const currentRecipe = document.getElementById("current-recipe");
const averageRating = document.getElementById("average-rating");
const form = document.getElementById("review-form");
const formError = document.getElementById("form-error");
const reviewsList = document.getElementById("reviews-list");
const backToSearchLink = document.getElementById("back-to-search");
const submitBtn = document.querySelector(".submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit");
const formKicker = document.getElementById("form-kicker");
const formHeading = document.getElementById("form-heading");

if (backToSearchLink && recipeContext.recipeId) {
  backToSearchLink.href = `../public/index.html?${new URLSearchParams({
    recipeId: recipeContext.recipeId,
    title: recipeContext.title,
    image: recipeContext.image
  }).toString()}`;
}

if (recipeContext.title && recipeTitleInput) {
  recipeTitleInput.value = recipeContext.title;
}

if (currentRecipe) {
  currentRecipe.textContent = recipeContext.title
    ? `Reviewing: ${recipeContext.title}`
    : "No recipe selected. Open reviews from a recipe details page.";
}

stars.forEach((star) => {
  star.addEventListener("mouseenter", () => highlightStars(Number(star.dataset.value)));
  star.addEventListener("mouseleave", () => highlightStars(selectedRating));
  star.addEventListener("click", () => {
    selectedRating = Number(star.dataset.value);
    if (ratingInput) {
      ratingInput.value = selectedRating;
    }
    highlightStars(selectedRating);
  });
});

function highlightStars(count) {
  stars.forEach((star) => {
    const val = Number(star.dataset.value);
    star.classList.toggle("active", val <= count);
  });
}

// ---- Edit Mode ----

function enterEditMode(review) {
  editingId = review.id;
  recipeTitleInput.value = review.title;
  reviewerNameInput.value = review.reviewerName;
  document.getElementById("review-text").value = review.text || "";
  selectedRating = review.rating;
  ratingInput.value = review.rating;
  highlightStars(review.rating);
  if (submitBtn) submitBtn.textContent = "Save Changes";
  if (cancelEditBtn) cancelEditBtn.hidden = false;
  if (formKicker) formKicker.textContent = "Editing";
  if (formHeading) formHeading.textContent = "Edit Review";
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function exitEditMode() {
  editingId = null;
  form.reset();
  if (recipeTitleInput) recipeTitleInput.value = recipeContext.title || "";
  selectedRating = 0;
  if (ratingInput) ratingInput.value = 0;
  highlightStars(0);
  if (submitBtn) submitBtn.textContent = "Submit Review";
  if (cancelEditBtn) cancelEditBtn.hidden = true;
  if (formKicker) formKicker.textContent = "New Entry";
  if (formHeading) formHeading.textContent = "Write a Review";
  if (formError) formError.hidden = true;
}

if (cancelEditBtn) {
  cancelEditBtn.addEventListener("click", exitEditMode);
}

// ---- Form Submission ----

if (form && recipeTitleInput && reviewerNameInput && ratingInput && formError) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = recipeTitleInput.value.trim();
    const reviewerName = reviewerNameInput.value.trim();
    const rating = Number(ratingInput.value);
    const text = document.getElementById("review-text")?.value.trim() || "";
    const recipeId = recipeContext.recipeId || title.toLowerCase().replace(/\s+/g, "_");

    if (!title || !reviewerName || rating === 0) {
      formError.hidden = false;
      return;
    }

    formError.hidden = true;

    if (editingId) {
      const existing = getReviewById(editingId);
      saveReview({
        id: editingId,
        recipeId: existing?.recipeId || recipeId,
        title,
        reviewerName,
        image: existing?.image || recipeContext.image,
        rating,
        text,
        timestamp: existing?.timestamp || Date.now()
      });
      exitEditMode();
    } else {
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
      form.reset();
      recipeTitleInput.value = title;
      selectedRating = 0;
      ratingInput.value = 0;
      highlightStars(0);
    }

    renderReviews();
  });
}

// ---- Render Past Reviews ----

function renderReviews() {
  const rawList = recipeContext.recipeId ? getReviewsForRecipe(recipeContext.recipeId) : [];

  const sortSelect = document.getElementById("sort-reviews");
  const sortType = sortSelect ? sortSelect.value : "newest";

  const list = sortReviews(rawList, sortType);
  const avg = recipeContext.recipeId ? getAverageRating(recipeContext.recipeId) : 0;

  if (!reviewsList || !averageRating) {
    return;
  }

  averageRating.textContent = list.length
    ? `Average rating: ${avg.toFixed(1)} / 5 (${list.length} review${list.length === 1 ? "" : "s"})`
    : "Average rating: N/A";

  if (list.length === 0) {
    reviewsList.innerHTML = recipeContext.recipeId
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

  reviewsList.innerHTML = list.map((review) => `
    <div class="review-card" data-id="${review.id}">
      ${review.image ? `<img src="${escapeHtml(review.image)}" alt="${escapeHtml(review.title)}">` : ""}
      <div class="review-body">
        <p class="review-title">${escapeHtml(review.title)}</p>
        <div class="review-stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
        <p class="review-byline">By ${escapeHtml(review.reviewerName || "Anonymous")}</p>
        ${review.text ? `<p class="review-text">${escapeHtml(review.text)}</p>` : ""}
        <span class="review-date">${new Date(review.timestamp).toLocaleDateString()}</span>
      </div>
      <div class="card-actions">
        <button class="edit-btn" data-id="${review.id}" aria-label="Edit review">✎</button>
        <button class="delete-btn" data-id="${review.id}" aria-label="Delete review">✕</button>
      </div>
    </div>
  `).join("");
}

// ---- Card action delegation (edit + delete) ----

if (reviewsList) {
  reviewsList.addEventListener("click", (e) => {
    const deleteBtn = e.target.closest(".delete-btn");
    if (deleteBtn) {
      if (editingId === deleteBtn.dataset.id) exitEditMode();
      deleteReview(deleteBtn.dataset.id);
      renderReviews();
      return;
    }

    const editBtn = e.target.closest(".edit-btn");
    if (editBtn) {
      const review = getReviewById(editBtn.dataset.id);
      if (review) enterEditMode(review);
    }
  });
}

function sortReviews(list, sortType) {
  const sorted = [...list];

  switch (sortType) {
    case "oldest":
      return sorted.sort((a, b) => a.timestamp - b.timestamp);

    case "rating-high":
      return sorted.sort((a, b) => b.rating - a.rating);

    case "rating-low":
      return sorted.sort((a, b) => a.rating - b.rating);

    default: // newest
      return sorted.sort((a, b) => b.timestamp - a.timestamp);
  }
}

const sortSelect = document.getElementById("sort-reviews");

if (sortSelect) {
  sortSelect.addEventListener("change", () => {
    renderReviews();
  });
}

// ---- CSV Export ----

const exportBtn = document.getElementById("export-csv");

if (exportBtn) {
  exportBtn.addEventListener("click", () => {
    const csv = exportReviewsToCSV(recipeContext.recipeId || null);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const filename = recipeContext.title
      ? `reviews-${recipeContext.title.toLowerCase().replace(/\s+/g, "-")}.csv`
      : "reviews.csv";
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  });
}

// ---- Init ----
renderReviews();