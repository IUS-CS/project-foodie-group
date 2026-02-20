// ===============================
// Recipe Details Section
// Dominiq Marica
// ===============================

// This function pulls all ingredients + measurements from a meal object
// TheMealDB stores them as strIngredient1, strIngredient2, etc.
// Loop through 1–20 and collect the ones that exist

function getIngredients(meal) {

    const list = []; // this will store the final ingredient strings

    // The API allows up to 20 ingredients per recipe
    for (let i = 1; i <= 20; i++) {

        // Access dynamic property names like strIngredient1, strIngredient2...
        const ingredient = meal["strIngredient" + i];
        const measure = meal["strMeasure" + i];

        // Only add it if it exists and is not just empty spaces
        if (ingredient && ingredient.trim() !== "") {

            // Combine measurement + ingredient (ex: "1 cup Sugar")
            // If measurement is missing, it won’t break
            list.push(`${measure || ""} ${ingredient}`.trim());
        }
    }

    // Return the full cleaned ingredient list
    return list;
}
