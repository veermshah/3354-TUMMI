export interface Restaurant {
    id: string;
    name: string;
    cuisine: string[];
    rating: number;
    distance: number; // in miles
    address: string;
    priceRange: "$" | "$$" | "$$$" | "$$$$";
    imageUrl?: string;
    description?: string;
    dietary?: string[]; // e.g., 'vegetarian', 'vegan', 'gluten-free'
    phone?: string;
    website?: string;
    photos?: string[]; // Array of photo URLs
}

export interface UserPreferences {
    favoritesCuisines: string[];
    dietaryRestrictions: string[];
    maxDistance: number;
    pricePreference: string[];
}

export interface User {
    id: string;
    email: string;
    name?: string;
    preferences?: UserPreferences;
    favorites: string[]; // restaurant IDs
    recentlyViewed: string[]; // restaurant IDs
}

export type FilterOptions = {
    cuisine?: string[];
    minRating?: number;
    maxDistance?: number;
    priceRange?: string[];
    dietary?: string[];
};
