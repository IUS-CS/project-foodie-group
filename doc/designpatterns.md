# Design Patterns in Project Foodie Group

## Introduction

This project already uses a few pattern ideas, even if they are not implemented as formal textbook versions yet. The clearest current pattern is a lightweight Model-View-Presenter style separation. The files in `src/js/reviewsStore.js` and `src/js/favoritesStore.js` behave like model modules because they own persistence and data rules for reviews and favorites. The HTML files in `src/public` act as the view layer because they define the page structure. The page scripts such as `src/js/reviews.js` and `src/js/script.js` contain most of the presentation logic that responds to user actions, requests data, and updates the DOM.

The project also shows an Observer-style approach through browser events. Click handlers, form submission handlers, and change handlers respond when the state of the interface changes. OO Design describes Observer as a one-to-many dependency where dependents are notified when state changes, and that idea maps well to the event-driven behavior already present in this project. In practice, the browser event system is providing most of that notification mechanism for us.

At the same time, the main search script is still doing too many jobs in one place. It fetches API data, stores UI state, performs filtering and sorting, renders HTML, and handles navigation. Because of that, the project is a good candidate for a few additional design patterns that would make later work easier.

## Patterns That Fit This Design

### 1. Model-View-Presenter (MVP)

OO Design describes MVP as a pattern that separates the model, the view, and the presenter so that UI logic does not become tangled with data logic. This is already the closest match to the current project structure, but it is only partially applied.

In this project, the models are the storage and data modules such as `reviewsStore.js` and `favoritesStore.js`. The views are the HTML pages and the DOM elements they expose. The presenters are currently mixed into `script.js` and `reviews.js`. A stronger MVP structure would split the large `src/js/script.js` file into smaller presenters such as `SearchPresenter`, `RecipeDetailsPresenter`, and `FavoritesPresenter`. That would make the code easier to test and would reduce the amount of direct DOM manipulation spread across the app.

### 2. Strategy

OO Design describes Strategy as defining a family of algorithms and making them interchangeable. This project has a strong use case for that pattern in sorting and filtering recipes.

Right now, filtering by category and area and sorting from A to Z or Z to A are handled directly inside `src/js/script.js`. That works, but it means the page script must know every filtering and sorting rule. A Strategy-based approach would move those rules into separate modules such as `sortByNameAsc`, `sortByNameDesc`, `filterByCategory`, and `filterByArea`. The main presenter would only choose which strategy to apply. This would make it easier to add new options later, such as filtering by favorites, sorting by rating, or showing recently viewed recipes.

### 3. Adapter

OO Design describes Adapter as converting one interface into another interface that clients expect. This project fits that pattern because TheMealDB response format does not match the shape that the UI really wants to use.

The app currently reads fields such as `strMeal`, `strMealThumb`, `strCategory`, `strArea`, and the numbered ingredient fields directly from the API response. That creates tight coupling between the UI and the external API format. An adapter layer could normalize API responses into an internal `Recipe` object with fields such as `id`, `title`, `image`, `category`, `area`, `ingredients`, and `instructions`. If the API changes later, or if a second recipe source is added, only the adapter would need to change.

### 4. Mediator

OO Design describes Mediator as centralizing communication between related objects so they do not all depend directly on one another. This is a good fit for the search page controls.

On the main page, the search input, random button, favorites button, sort select, area select, category select, toolbar, and content area all interact through shared state in `src/js/script.js`. That already acts like an informal mediator. Making that role explicit would improve the design. A `SearchPageMediator` could coordinate updates between controls, route actions to presenters, and decide when content should refresh. That would keep individual UI components simpler and reduce the amount of global page logic.

### 5. Command

OO Design describes Command as encapsulating a request as an object. This is not required yet, but it could fit future work well.

Actions such as `search`, `toggle favorite`, `open recipe`, `submit review`, and `delete review` are currently hard-coded in event handlers. If the project later needs undo support, action history, analytics logging, or keyboard shortcuts, a Command-based design would help. Each user action could be represented as a command object with a clear execution path. This is especially relevant if the team later adds editing features for reviews or more advanced navigation.

## Plan for Continuing the Module Design

I intend to continue the design in a way that makes the current code more modular without forcing a full rewrite. The first step should be to strengthen the MVP structure that already exists. The `src/js/script.js` file should be split into smaller presenter-style modules, while storage logic should stay in dedicated model modules and HTML should remain focused on structure.

The next step should be to introduce an adapter for MealDB data. That will create one stable internal recipe format for the rest of the application. Once that adapter exists, the UI and storage code will no longer depend directly on the raw API field names.

After that, I would extract filtering and sorting into Strategy modules. This will make the search page easier to extend and will keep the presenter from becoming a collection of `if` statements. Finally, if the number of interactive controls keeps growing, I would add a mediator module for the main page so that search, favorites, filters, and navigation communicate through one coordinator instead of directly through one large script.

Overall, the project should move toward small modules with one clear job each: model modules for state and persistence, adapter modules for external data mapping, strategy modules for interchangeable algorithms, and presenter or mediator modules for UI coordination.
