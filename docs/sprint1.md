Date: 2026-03-08

Members present:

* Seth Payne
* Heidi Ganim
* Brayton Rumple
* Dominiq Marica


Demo

This sprint, we completed:

* Implemented the recipe search and recipe details page using the MealDB API.
* Built the ingredient parser that extracts ingredients and measurements from the API response.
* Implemented the favorites feature that allows users to save and remove recipes.
* Created the reviews page where users can write reviews and rate recipes using a star rating system.
* Implemented localStorage persistence for both favorites and reviews so data remains after refreshing the page.
* Added the ability to delete reviews from the review list.
* Created the UI styling for the review system, including review cards and star rating visuals.


Retro

Good

* The team worked well together and divided tasks across features like favorites, reviews, and recipe parsing.
* We successfully integrated the MealDB API and displayed recipe information including ingredients and instructions.
* The favorites system works using localStorage, allowing users to save recipes and see their saved status update.
* The reviews page now allows users to submit ratings and written feedback, which are stored and rendered dynamically.

Bad

* We experienced a few minor hiccups when testing the pages.
* At one point, group member names were accidentally appearing on the page during testing due to placeholder content.
* The View button initially did not work correctly, which prevented the recipe details page from loading.
* These issues were debugged and corrected during testing.


Actionable Commitments

* As a team, we will test features earlier and more frequently to catch small bugs sooner.
* We will continue improving the UI and usability of the application.
* We will review pull requests carefully before merging to reduce small issues.


Next Sprint Planning
Points	  Story
5	        * As a user, I want to search for recipes by name so I can quickly find meals I want to cook.
5	        * As a user, I want to view detailed recipe pages so I can see ingredients and cooking instructions.
3	        * As a user, I want to save recipes to my favorites so I can easily access them later.
5	        * As a user, I want to write and rate reviews for recipes so I can share feedback with others.
8	        * As an administrator, I want to manage the recipe data so incorrect or duplicate recipes can be removed.
5	        * As an administrator, I want to monitor user reviews so inappropriate content can be removed.
5	        * As an administrator, I want to view stored favorites and reviews so I can understand how users interact with recipes.
8	        * As an administrator, I want to maintain the system data and storage so the application runs reliably.
