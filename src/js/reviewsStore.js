const REVIEWS_KEY = "foodie_reviews_v1";

export function getReviewMap() {
    try {
        return JSON.parse(localStorage.getItem(REVIEWS_KEY)) || {};
    } catch {
        return {};
    }
}
