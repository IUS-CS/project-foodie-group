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
const reviewTextarea = document.getElementById("review-text");
const charCounter = document.getElementById("char-counter");
const CHAR_LIMIT = 500;
const FILLED_STAR = "\u2605";
const EMPTY_STAR = "\u2606";
const EDIT_ICON = "\u270e";
const DELETE_ICON = "\u2715";

function updateCharCounter() {
  if (!reviewTextarea || !charCounter) return;
  const count = reviewTextarea.value.length;
  charCounter.textContent = `${count} / ${CHAR_LIMIT}`;
  charCounter.classList.toggle("near-limit", count >= CHAR_LIMIT * 0.9 && count < CHAR_LIMIT);
  charCounter.classList.toggle("at-limit", count >= CHAR_LIMIT);
}

if (reviewTextarea) {
  reviewTextarea.addEventListener("input", updateCharCounter);
}

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

// Roving tabindex: only the first star (or selected star) is in the tab order
stars.forEach((star, i) => star.setAttribute("tabindex", i === 0 ? "0" : "-1"));

function setRating(value) {
  selectedRating = value;
  if (ratingInput) ratingInput.value = value;
  highlightStars(value);
  // Move tab stop to the selected star
  stars.forEach((s, i) => s.setAttribute("tabindex", i === value - 1 ? "0" : "-1"));
}

function focusStar(index) {
  stars.forEach((s, i) => s.setAttribute("tabindex", i === index ? "0" : "-1"));
  stars[index].focus();
}

stars.forEach((star, index) => {
  star.addEventListener("mouseenter", () => highlightStars(Number(star.dataset.value)));
  star.addEventListener("mouseleave", () => highlightStars(selectedRating));
  star.addEventListener("click", () => setRating(Number(star.dataset.value)));
  star.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setRating(Number(star.dataset.value));
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      focusStar(Math.min(index + 1, stars.length - 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      focusStar(Math.max(index - 1, 0));
    }
  });
});

function highlightStars(count) {
  stars.forEach((star) => {
    const val = Number(star.dataset.value);
    star.classList.toggle("active", val <= count);
    star.setAttribute("aria-checked", val === count ? "true" : "false");
  });
}

// ---- Edit Mode ----

function enterEditMode(review) {
  editingId = review.id;
  recipeTitleInput.value = review.title;
  reviewerNameInput.value = review.reviewerName;
  if (reviewTextarea) reviewTextarea.value = review.text || "";
  setRating(review.rating);
  updateCharCounter();
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
  stars.forEach((s, i) => s.setAttribute("tabindex", i === 0 ? "0" : "-1"));
  updateCharCounter();
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

    if (!title || !reviewerName || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      formError.hidden = false;
      return;
    }

    formError.hidden = true;

    if (editingId) {
      const existing = getReviewById(editingId);
      const saved = saveReview({
        id: editingId,
        recipeId: existing?.recipeId || recipeId,
        title,
        reviewerName,
        image: existing?.image || recipeContext.image,
        rating,
        text,
        timestamp: existing?.timestamp || Date.now(),
        editedAt: Date.now()
      });
      if (!saved) {
        formError.hidden = false;
        return;
      }
      exitEditMode();
    } else {
      const saved = saveReview({
        id: Date.now(),
        recipeId,
        title,
        reviewerName,
        image: recipeContext.image,
        rating,
        text,
        timestamp: Date.now()
      });
      if (!saved) {
        formError.hidden = false;
        return;
      }
      form.reset();
      recipeTitleInput.value = title;
      selectedRating = 0;
      ratingInput.value = 0;
      highlightStars(0);
      updateCharCounter();
    }

    renderReviews();
  });
}

// ---- Render Past Reviews ----

function renderReviews() {
  const rawList = recipeContext.recipeId ? getReviewsForRecipe(recipeContext.recipeId) : [];

  const sortSelect = document.getElementById("sort-reviews");
  const sortType = sortSelect ? sortSelect.value : "newest";

  const filterSelect = document.getElementById("filter-reviews");
  const filterMin = filterSelect && filterSelect.value !== "all" ? Number(filterSelect.value) : 0;
  const filtered = filterMin > 0 ? rawList.filter((r) => r.rating >= filterMin) : rawList;

  const list = sortReviews(filtered, sortType);
  const avg = recipeContext.recipeId ? getAverageRating(recipeContext.recipeId) : 0;

  if (!reviewsList || !averageRating) {
    return;
  }

  if (rawList.length === 0) {
    averageRating.textContent = "Average rating: N/A";
  } else if (filterMin > 0) {
    averageRating.textContent = `Showing ${list.length} of ${rawList.length} review${rawList.length === 1 ? "" : "s"} \u00b7 Avg: ${avg.toFixed(1)} / 5`;
  } else {
    averageRating.textContent = `Average rating: ${avg.toFixed(1)} / 5 (${list.length} review${list.length === 1 ? "" : "s"})`;
  }

  if (list.length === 0) {
    reviewsList.innerHTML = filterMin > 0
      ? `<p class="empty-state">No ${filterMin}+ star reviews for this recipe.</p>`
      : recipeContext.recipeId
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
    <div class="review-card" data-id="${escapeHtml(review.id)}">
      ${review.image ? `<img src="${escapeHtml(review.image)}" alt="${escapeHtml(review.title)}">` : ""}
      <div class="review-body">
        <p class="review-title">${escapeHtml(review.title)}</p>
        <div class="review-stars">${FILLED_STAR.repeat(review.rating)}${EMPTY_STAR.repeat(5 - review.rating)}</div>
        <p class="review-byline">By ${escapeHtml(review.reviewerName || "Anonymous")}</p>
        ${review.text ? `<p class="review-text">${escapeHtml(review.text)}</p>` : ""}
        <span class="review-date">
          ${new Date(review.timestamp).toLocaleDateString()}
          ${review.editedAt ? `<span class="edited-badge">edited</span>` : ""}
        </span>
      </div>
      <div class="card-actions">
        <button class="edit-btn" data-id="${escapeHtml(review.id)}" aria-label="Edit review">${EDIT_ICON}</button>
        <button class="delete-btn" data-id="${escapeHtml(review.id)}" aria-label="Delete review">${DELETE_ICON}</button>
      </div>
    </div>
  `).join("");
}

// ---- Card action delegation (edit + delete) ----

if (reviewsList) {
  reviewsList.addEventListener("click", (e) => {
    const deleteBtn = e.target.closest(".delete-btn");
    if (deleteBtn) {
      if (deleteBtn.dataset.confirm === "true") {
        if (editingId === deleteBtn.dataset.id) exitEditMode();
        deleteReview(deleteBtn.dataset.id);
        renderReviews();
      } else {
        deleteBtn.dataset.confirm = "true";
        deleteBtn.textContent = "Delete?";
        deleteBtn.classList.add("confirm-state");
        setTimeout(() => {
          if (deleteBtn.isConnected && deleteBtn.dataset.confirm === "true") {
            deleteBtn.dataset.confirm = "false";
            deleteBtn.textContent = DELETE_ICON;
            deleteBtn.classList.remove("confirm-state");
          }
        }, 3000);
      }
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
const filterSelect = document.getElementById("filter-reviews");

if (sortSelect) {
  sortSelect.addEventListener("change", () => renderReviews());
}

if (filterSelect) {
  filterSelect.addEventListener("change", () => renderReviews());
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
