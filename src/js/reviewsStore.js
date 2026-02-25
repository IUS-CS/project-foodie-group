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

export function getReviewById(id) {
  const reviews = getReviewsMap();
  return reviews[String(id)] || null;
}

export function saveReview(review) {
  if (!review.id || !review.rating) return false;
  const reviews = getReviewsMap();
  reviews[String(review.id)] = {
    id: String(review.id),
    title: review.title || "Untitled Recipe",
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

export function hasReview(id) {
  return Boolean(getReviewsMap()[String(id)]);
}