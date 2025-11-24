// kshrugal jain

const filterByCuisine = require('./restaurantFilter');

describe('Restaurant Filter System', () => {
    
    // mock database
    const database = [
        { name: "Taco Bell", cuisine: "Mexican", rating: 4.0 },
        { name: "Olive Garden", cuisine: "Italian", rating: 4.5 },
        { name: "Chipotle", cuisine: "Mexican", rating: 4.2 },
        { name: "Burger King", cuisine: "American", rating: 3.5 }
    ];

    test('Test1: Exact Match - finds 2 Mexican restaurants', () => {
        const results = filterByCuisine(database, "Mexican");
        expect(results.length).toBe(2);
        expect(results[0].name).toBe("Taco Bell");
    });

    test('Test2: No Match - returns empty list', () => {
        const results = filterByCuisine(database, "Thai");
        expect(results.length).toBe(0);
    });

    test('Test3: Case Insensitivity - handles lowercase input', () => {
        const results = filterByCuisine(database, "mexican");
        expect(results.length).toBe(2);
    });
});