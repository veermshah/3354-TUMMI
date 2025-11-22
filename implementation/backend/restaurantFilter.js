// kshrugal jain

// Functional Requirement: Filter option used to filter by cuisines.
function filterByCuisine(allRestaurants, cuisineQuery) {
    if (!allRestaurants || !cuisineQuery) {
        return [];
    }

    // Returns  list w/ only places that match input/cuisine (case insensitive)
    return allRestaurants.filter(r => 
        r.cuisine.toLowerCase() === cuisineQuery.toLowerCase()
    );
}

module.exports = filterByCuisine;