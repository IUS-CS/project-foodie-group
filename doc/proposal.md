# Project Proposal: Foodie Group

## Vision Statement

To build an accessible, browser-based recipe companion that helps users discover new meals, save their favorites, and share their experiences without needing an account, a server, or a database.

## Project Description

Foodie Group is a web-based recipe lookup and review application built with HTML, CSS, and JavaScript. It's designed to run as a static site with no backend server, no database, and no user authentication. All data is either fetched from a public API in real time or stored locally in the user's browser using localStorage. This keeps the app lightweight, fast, and easy to deploy on platforms like GitHub Pages.

The main feature is recipe search. Users can type any keyword (a dish name, an ingredient, or a cuisine type) and the app queries TheMealDB, a free public recipe API, to return a list of matching results. Each result shows the recipe name, an image, and metadata like cuisine area and category. From the results, users can open a detailed recipe view with the full ingredient list and step-by-step cooking instructions. Filter and sort controls let users narrow results by category or area and sort them alphabetically.

The Favorites system lets users save recipes they want to come back to. It stores a list of recipe IDs in localStorage so favorites stick around across page refreshes and browser sessions. Users can add or remove favorites from both the search results and the recipe detail view, and a dedicated Favorites page shows everything they've saved. A small badge in the header keeps the count updated in real time.

The Reviews system gives users a way to leave feedback on recipes. On any recipe's detail page, users can submit a review with their name, a rating from 1 to 5, and a written comment. Reviews are stored in localStorage under a key tied to the recipe's unique API ID, so they always stay linked to the right recipe. The page also shows an average rating based on all submitted reviews. Users can delete their own reviews and export all reviews for a recipe to a CSV file.

The app also has a few extra features to improve the experience. A random recipe button helps users find something new when they're not sure what to search for. A light and dark mode toggle makes it easier to use in different environments. Navigation is handled through a client-side stack so switching between views feels smooth without needing separate HTML pages or a framework.

## Team and Responsibilities

The project is built by a team of four, with each person owning one main feature while everyone pitches in on integration, styling, and testing.

**Seth Payne** is handling the Favorites system, including the save/remove buttons, the Favorites page, and localStorage persistence.

**Heidi Ganim** is handling Recipe Search, including the search interface, TheMealDB API integration, and the results display.

**Dominiq Marica** is handling the Recipe Details page, including ingredient extraction, instructions display, and the detail view layout.

**Brayton Rumple** is handling the Reviews system, including the review form, review display, average rating calculation, and CSV export.

Everyone is sharing responsibility for navigation, consistent styling, testing, and final polish.

## Technical Approach

The app is built with vanilla HTML, CSS, and JavaScript with no frameworks, no build tools, and no external dependencies beyond TheMealDB. Persistent data like favorites and reviews lives in localStorage. The app uses a single HTML page that dynamically renders different views into a central content area depending on what the user is doing. JavaScript files are organized under `src/js/` and stylesheets under `src/public/css/`, which keeps things clean and makes it easier for multiple people to work on different features without stepping on each other.