# Project Architecture

## Overview
This system is a front-end recipe search system built using HTML, CSS, and JavaScript. It retrieves recipe data in real time from TheMealDB API and displays it based on user input. Since there is no backend, user-specific data such as saved recipes is handled directly in the browser using local storage.

---

## Components

### Interface
The interface is responsible for user interaction and rendering content on the page. It includes the search bar, filtering options for category and area, sorting controls, and the recipe card layout. Based on user input, the interface updates dynamically to reflect the most relevant results returned from the API.

---

### Data
Recipe data is retrieved from TheMealDB API through asynchronous fetch requests. The API returns structured JSON data that includes recipe names, images, ingredients, and instructions. This data is then processed before being displayed in the interface.

---

### State
The system maintains its current state on the client side. This includes the active search term, selected filters, the recipe currently being viewed, and any saved favorites. Favorites are stored using localStorage so they persist across sessions without requiring a database.

---

### Logic
The system logic coordinates how user actions affect the data and interface. When a user performs a search or applies filters, JavaScript handles the request to the API, processes the response, and updates the displayed results. It also manages interactions such as selecting a recipe or saving it as a favorite.

---

## Flow

1. The user enters a search term or selects filters such as category, area, or sorting  
2. The input is captured and used to build a request to TheMealDB API  
3. The API returns recipe data in JSON format  
4. The data is processed and adjusted based on the selected filters  
5. The filtered results are rendered as recipe cards in the interface  
6. The user can view detailed information or save a recipe  
7. Any saved recipes are written to localStorage  

---

## Structure

The system follows a simple separation of concerns similar to an MVC structure:

- Model: API data and local storage  
- View: HTML and CSS interface  
- Controller: JavaScript handling system logic and interaction  

This separation helps keep the code organized and makes future updates easier to manage.
