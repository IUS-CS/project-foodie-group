const REVIEWS_KEY = "foodie_reviews_v1";

function asNonEmptyString(value) {
  return String(value ?? "").trim();
}

function normalizeTimestamp(value, fallback = Date.now()) {
  const timestamp = Number(value);
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : fallback;
}

function normalizeEditedAt(value) {
  if (value === null || value === undefined || value === "") return null;
  const editedAt = Number(value);
  return Number.isFinite(editedAt) && editedAt > 0 ? editedAt : null;
}

function normalizeRating(value) {
  const rating = Number(value);
  return Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null;
}

function normalizeReview(review) {
  if (!review || typeof review !== "object") return null;

  const id = asNonEmptyString(review.id);
  const recipeId = asNonEmptyString(review.recipeId);
  const rating = normalizeRating(review.rating);

  if (!id || !recipeId || rating === null) return null;

  return {
    id,
    recipeId,
    title: asNonEmptyString(review.title) || "Untitled Recipe",
    reviewerName: asNonEmptyString(review.reviewerName) || "Anonymous",
    image: asNonEmptyString(review.image),
    rating,
    text: asNonEmptyString(review.text),
    timestamp: normalizeTimestamp(review.timestamp),
    editedAt: normalizeEditedAt(review.editedAt)
  };
}

export function getReviewsMap() {
  try {
    const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY));
    return reviews && typeof reviews === "object" && !Array.isArray(reviews) ? reviews : {};
  } catch {
    return {};
  }
}

export function getReviewsList() {
  return Object.values(getReviewsMap())
    .map(normalizeReview)
    .filter(Boolean)
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function getReviewsForRecipe(recipeId) {
  return getReviewsList().filter((review) => String(review.recipeId) === String(recipeId));
}

export function getReviewById(id) {
  const review = getReviewsMap()[String(id)];
  return normalizeReview(review);
}

export function saveReview(review) {
  const normalized = normalizeReview(review);
  if (!normalized) return false;

  const reviews = getReviewsMap();
  reviews[normalized.id] = normalized;
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  return true;
}

export function deleteReview(id) {
  const reviews = getReviewsMap();
  delete reviews[String(id)];
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

export function getAverageRating(recipeId) {
  const reviews = getReviewsForRecipe(recipeId);
  if (reviews.length === 0) return 0;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return total / reviews.length;
}

export function hasReview(id) {
  return Boolean(getReviewById(id));
}

// Legacy browser-test helpers. These mirror the earlier array-based API.
export function loadReviews() {
  return getReviewsList();
}

export function saveReviews(reviews) {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify({}));
  reviews.forEach((review, index) => {
    saveReview({
      id: review.id || index + 1,
      recipeId: review.recipeId,
      title: review.title || review.recipeTitle || "Untitled Recipe",
      reviewerName: review.reviewerName || review.name || "Anonymous",
      image: review.image || "",
      rating: review.rating,
      text: review.text || review.comment || "",
      timestamp: review.timestamp || Date.now() + index
    });
  });
}

export function exportReviewsToCSV(recipeId) {
  const reviews = recipeId ? getReviewsForRecipe(recipeId) : getReviewsList();

  const escapeCSV = (value) => {
    const str = String(value ?? "");
    return str.includes(",") || str.includes('"') || str.includes("\n")
      ? `"${str.replaceAll('"', '""')}"`
      : str;
  };

  const headers = ["Recipe Name", "Reviewer Name", "Rating (out of 5)", "Review", "Date"];
  const rows = reviews.map((r) => [
    escapeCSV(r.title),
    escapeCSV(r.reviewerName),
    escapeCSV(r.rating),
    escapeCSV(r.text),
    escapeCSV(new Date(r.timestamp).toLocaleDateString())
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

if (typeof window !== "undefined") {
  window.loadReviews = loadReviews;
  window.saveReviews = saveReviews;
  window.deleteReview = deleteReview;
  window.getReviewById = getReviewById;
  window.getReviewsForRecipe = getReviewsForRecipe;
  window.getAverageRating = getAverageRating;
  window.hasReview = hasReview;
  window.exportReviewsToCSV = exportReviewsToCSV;
  window.saveReview = saveReview;
}
