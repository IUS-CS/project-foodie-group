const REVIEWS_KEY = "foodie_reviews_v1";

export function getReviewMap() {
    try {
        return JSON.parse(localStorage.getItem(REVIEWS_KEY)) || {};
    } catch {
        return {};
    }
}

export function getReviewsList() {
    return Object.values(getReviewMap()).sort((a,b) => b.timestamp - a.timestamp);
}

export function getReviewById(id) {
    const reviews = getReviewMap();
    return reviews[String(id)] || null;
}