// ===============================
// Reviews Page
// ===============================

import { getReviewsList, saveReview, deleteReview } from "./reviewsStore.js";

// ---- Star Rating Logic ----

let selectedRating = 0;
const stars = document.querySelectorAll(".star");
const ratingInput = document.getElementById("rating-value");

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

  const title = document.getElementById("recipe-title").value.trim();
  const rating = Number(ratingInput.value);
  const text = document.getElementById("review-text").value.trim();

  if (!title || rating === 0) {
    formError.hidden = false;
    return;
  }

  formError.hidden = true;

  saveReview({
    // Use timestamp as a simple unique ID since there's no recipe ID from the form
    id: Date.now(),
    title,
    rating,
    text,
    timestamp: Date.now()
  });

  // Reset form
  form.reset();
  selectedRating = 0;
  ratingInput.value = 0;
  highlightStars(0);

  renderReviews();
});

// ---- Render Past Reviews ----

function renderReviews() {
  const list = getReviewsList();
  const container = document.getElementById("reviews-list");

  if (list.length === 0) {
    container.innerHTML = `<p class="empty-state">No reviews yet. Be the first to write one!</p>`;
    return;
  }

  container.innerHTML = list.map((review) => `
    <div class="review-card" data-id="${review.id}">
      ${review.image ? `<img src="${review.image}" alt="${review.title}">` : ""}
      <div class="review-body">
        <p class="review-title">${review.title}</p>
        <div class="review-stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
        ${review.text ? `<p class="review-text">${review.text}</p>` : ""}
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