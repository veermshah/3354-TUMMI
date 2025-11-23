import { Restaurant } from "../types/restaurant";

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
const PLACES_API_BASE = "https://places.googleapis.com/v1/places";

interface PlaceResult {
    id: string;
    displayName: { text: string };
    formattedAddress?: string;
    location?: { latitude: number; longitude: number };
    rating?: number;
    userRatingCount?: number;
    priceLevel?: string;
    primaryTypeDisplayName?: { text: string };
    types?: string[];
    regularOpeningHours?: any;
    currentOpeningHours?: any;
    primaryType?: string;
    nationalPhoneNumber?: string;
    websiteUri?: string;
    editorialSummary?: { text: string };
    photos?: Array<{
        name: string;
        widthPx: number;
        heightPx: number;
    }>;
}

// Map Google price levels to our format
const mapPriceLevel = (priceLevel?: string): "$" | "$$" | "$$$" | "$$$$" => {
    if (!priceLevel) return "$$";

    switch (priceLevel) {
        case "PRICE_LEVEL_FREE":
        case "PRICE_LEVEL_INEXPENSIVE":
            return "$";
        case "PRICE_LEVEL_MODERATE":
            return "$$";
        case "PRICE_LEVEL_EXPENSIVE":
            return "$$$";
        case "PRICE_LEVEL_VERY_EXPENSIVE":
            return "$$$$";
        default:
            return "$$";
    }
};

// Map Google types to cuisine categories
const mapTypesToCuisine = (types?: string[]): string[] => {
    if (!types) return ["Restaurant"];

    const cuisineMap: { [key: string]: string } = {
        american_restaurant: "American",
        chinese_restaurant: "Chinese",
        italian_restaurant: "Italian",
        japanese_restaurant: "Japanese",
        mexican_restaurant: "Mexican",
        thai_restaurant: "Thai",
        indian_restaurant: "Indian",
        french_restaurant: "French",
        spanish_restaurant: "Spanish",
        greek_restaurant: "Greek",
        korean_restaurant: "Korean",
        vietnamese_restaurant: "Vietnamese",
        mediterranean_restaurant: "Mediterranean",
        middle_eastern_restaurant: "Middle Eastern",
        pizza_restaurant: "Pizza",
        seafood_restaurant: "Seafood",
        steakhouse: "Steakhouse",
        sushi_restaurant: "Sushi",
        barbecue_restaurant: "BBQ",
        sandwich_shop: "Sandwiches",
        cafe: "Cafe",
        fast_food_restaurant: "Fast Food",
        hamburger_restaurant: "Burgers",
        vegan_restaurant: "Vegan",
        vegetarian_restaurant: "Vegetarian",
    };

    const cuisines = types
        .map((type) => cuisineMap[type])
        .filter((cuisine): cuisine is string => cuisine !== undefined);

    return cuisines.length > 0 ? cuisines : ["Restaurant"];
};

// Extract dietary options from types
const extractDietaryOptions = (types?: string[]): string[] => {
    if (!types) return [];

    const dietary: string[] = [];

    if (types.includes("vegan_restaurant")) dietary.push("Vegan");
    if (types.includes("vegetarian_restaurant")) dietary.push("Vegetarian");
    if (types.includes("halal_restaurant")) dietary.push("Halal");

    return dietary;
};

// Check if a restaurant type is incompatible with dietary restrictions
export const isIncompatibleWithDiet = (
    cuisineTypes: string[],
    dietaryRestrictions: string[]
): boolean => {
    if (dietaryRestrictions.length === 0) return false;

    // Restaurants that are typically incompatible with vegan/vegetarian diets
    const meatFocusedCuisines = [
        "BBQ",
        "Steakhouse",
        "Seafood",
        "Burgers",
        "Barbecue",
    ];

    const hasVeganOrVeg =
        dietaryRestrictions.includes("Vegan") ||
        dietaryRestrictions.includes("Vegetarian");

    if (hasVeganOrVeg) {
        // Filter out meat-focused restaurants
        return cuisineTypes.some((cuisine) =>
            meatFocusedCuisines.includes(cuisine)
        );
    }

    return false;
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const placesService = {
    /**
     * Search for nearby restaurants
     * @param latitude User's latitude
     * @param longitude User's longitude
     * @param radius Search radius in meters (default 5000m = ~3.1 miles)
     * @param cuisineTypes Optional cuisine types to filter (not used in API, filtered client-side)
     */
    async searchNearbyRestaurants(
        latitude: number,
        longitude: number,
        radius: number = 5000,
        cuisineTypes?: string[]
    ): Promise<Restaurant[]> {
        try {
            const response = await fetch(`${PLACES_API_BASE}:searchNearby`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": API_KEY!,
                    "X-Goog-FieldMask":
                        "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.types,places.primaryType,places.primaryTypeDisplayName,places.nationalPhoneNumber,places.websiteUri,places.editorialSummary,places.photos",
                },
                body: JSON.stringify({
                    includedTypes: ["restaurant"],
                    maxResultCount: 20,
                    locationRestriction: {
                        circle: {
                            center: {
                                latitude,
                                longitude,
                            },
                            radius,
                        },
                    },
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                console.error("Places API error:", error);
                throw new Error(`Places API error: ${response.status}`);
            }

            const data = await response.json();
            const places: PlaceResult[] = data.places || [];

            let results = places.map((place) => {
                const distance = place.location
                    ? calculateDistance(
                          latitude,
                          longitude,
                          place.location.latitude,
                          place.location.longitude
                      )
                    : 0;

                // Generate photo URLs from photo names
                const photoUrls =
                    place.photos?.slice(0, 5).map((photo) => {
                        const maxWidth = 800;
                        return `https://places.googleapis.com/v1/${photo.name}/media?key=${API_KEY}&maxWidthPx=${maxWidth}`;
                    }) || [];

                return {
                    id: place.id,
                    name: place.displayName.text,
                    cuisine: mapTypesToCuisine(place.types),
                    rating: place.rating || 0,
                    priceRange: mapPriceLevel(place.priceLevel),
                    distance,
                    address: place.formattedAddress || "",
                    description: place.editorialSummary?.text,
                    dietary: extractDietaryOptions(place.types),
                    phone: place.nationalPhoneNumber,
                    website: place.websiteUri,
                    imageUrl: photoUrls[0],
                    photos: photoUrls,
                };
            });

            // Filter by cuisine types client-side if provided
            if (cuisineTypes && cuisineTypes.length > 0) {
                results = results.filter((restaurant) =>
                    restaurant.cuisine.some((c) => cuisineTypes.includes(c))
                );
            }

            return results;
        } catch (error) {
            console.error("Error fetching nearby restaurants:", error);
            throw error;
        }
    },

    /**
     * Search restaurants by text query
     * @param query Search query (e.g., "pizza near me", "italian restaurants")
     * @param latitude Optional user latitude for location-based results
     * @param longitude Optional user longitude for location-based results
     */
    async searchRestaurantsByText(
        query: string,
        latitude?: number,
        longitude?: number
    ): Promise<Restaurant[]> {
        try {
            const body: any = {
                textQuery: query,
                maxResultCount: 20,
            };

            if (latitude && longitude) {
                body.locationBias = {
                    circle: {
                        center: {
                            latitude,
                            longitude,
                        },
                        radius: 5000,
                    },
                };
            }

            const response = await fetch(`${PLACES_API_BASE}:searchText`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": API_KEY!,
                    "X-Goog-FieldMask":
                        "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.types,places.primaryType,places.primaryTypeDisplayName,places.nationalPhoneNumber,places.websiteUri,places.editorialSummary,places.photos",
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const error = await response.text();
                console.error("Places API error:", error);
                throw new Error(`Places API error: ${response.status}`);
            }

            const data = await response.json();
            const places: PlaceResult[] = data.places || [];

            return places.map((place) => {
                const distance =
                    place.location && latitude && longitude
                        ? calculateDistance(
                              latitude,
                              longitude,
                              place.location.latitude,
                              place.location.longitude
                          )
                        : 0;

                // Generate photo URLs from photo names
                const photoUrls =
                    place.photos?.slice(0, 5).map((photo) => {
                        const maxWidth = 800;
                        return `https://places.googleapis.com/v1/${photo.name}/media?key=${API_KEY}&maxWidthPx=${maxWidth}`;
                    }) || [];

                return {
                    id: place.id,
                    name: place.displayName.text,
                    cuisine: mapTypesToCuisine(place.types),
                    rating: place.rating || 0,
                    priceRange: mapPriceLevel(place.priceLevel),
                    distance,
                    address: place.formattedAddress || "",
                    description: place.editorialSummary?.text,
                    dietary: extractDietaryOptions(place.types),
                    phone: place.nationalPhoneNumber,
                    website: place.websiteUri,
                    imageUrl: photoUrls[0],
                    photos: photoUrls,
                };
            });
        } catch (error) {
            console.error("Error searching restaurants:", error);
            throw error;
        }
    },

    /**
     * Get details for a specific place
     * @param placeId Google Place ID
     */
    async getPlaceDetails(placeId: string): Promise<Restaurant | null> {
        try {
            // Google Places API (New) uses places/{placeId} format
            const response = await fetch(`${PLACES_API_BASE}/${placeId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": API_KEY!,
                    "X-Goog-FieldMask":
                        "id,displayName,formattedAddress,location,rating,userRatingCount,priceLevel,types,primaryType,primaryTypeDisplayName,nationalPhoneNumber,websiteUri,editorialSummary,photos",
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Places API error details:", errorText);
                throw new Error(`Places API error: ${response.status}`);
            }

            const place: PlaceResult = await response.json();

            // Generate photo URLs from photo names
            const photoUrls =
                place.photos?.slice(0, 5).map((photo) => {
                    // Google Places API (New) photo URL format
                    const maxWidth = 800;
                    return `https://places.googleapis.com/v1/${photo.name}/media?key=${API_KEY}&maxWidthPx=${maxWidth}`;
                }) || [];

            return {
                id: place.id,
                name: place.displayName.text,
                cuisine: mapTypesToCuisine(place.types),
                rating: place.rating || 0,
                priceRange: mapPriceLevel(place.priceLevel),
                distance: 0,
                address: place.formattedAddress || "",
                description: place.editorialSummary?.text,
                dietary: extractDietaryOptions(place.types),
                phone: place.nationalPhoneNumber,
                website: place.websiteUri,
                imageUrl: photoUrls[0], // First photo as primary
                photos: photoUrls,
            };
        } catch (error) {
            console.error("Error fetching place details:", error);
            return null;
        }
    },
};
