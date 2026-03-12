const REVIEWS_KEY = "foodie_reviews_v1";

export function getReviewsMap() {
  try {
    return JSON.parse(localStorage.getItem(REVIEWS_KEY)) || {};
  } catch {
    return {};
  }
}

export function getReviewsList() {
  return Object.values(getReviewsMap()).sort((a, b) => b.timestamp - a.timestamp);
}

export function getReviewsForRecipe(recipeId) {
  return getReviewsList().filter((review) => String(review.recipeId) === String(recipeId));
}

export function getReviewById(id) {
  const reviews = getReviewsMap();
  return reviews[String(id)] || null;
}

export function saveReview(review) {
  if (!review.id || !review.rating || !review.recipeId) return false;
  const reviews = getReviewsMap();
  reviews[String(review.id)] = {
    id: String(review.id),
    recipeId: String(review.recipeId),
    title: review.title || "Untitled Recipe",
    reviewerName: review.reviewerName || "Anonymous",
    image: review.image || "",
    rating: Number(review.rating),
    text: review.text || "",
    timestamp: review.timestamp || Date.now()
  };
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
  const total = reviews.reduce((sum, review) => sum + Number(review.rating), 0);
  return total / reviews.length;
}

export function hasReview(id) {
  return Boolean(getReviewsMap()[String(id)]);
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

if (typeof window !== "undefined") {
  window.loadReviews = loadReviews;
  window.saveReviews = saveReviews;
}
