import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    ScrollView,
    View,
    Text,
    RefreshControl,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { RestaurantCard } from "@/components/restaurant-card";
import { useFavorites } from "@/hooks/use-favorites";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { useRestaurants } from "@/hooks/use-restaurants";
import { useAuth } from "@/contexts/AuthContext";
import { Restaurant } from "@/types/restaurant";
import { isIncompatibleWithDiet } from "@/services/placesService";

export default function HomeScreen() {
    const { favorites, toggleFavorite, isFavorite } = useFavorites();
    const { recentRestaurants, addToRecentlyViewed } = useRecentlyViewed();
    const {
        restaurants,
        loading,
        location,
        locationPermission,
        fetchNearbyRestaurants,
        refreshLocation,
    } = useRestaurants();
    const { user, preferences } = useAuth();
    const [refreshing, setRefreshing] = useState(false);

    // Fetch nearby restaurants when location is available
    useEffect(() => {
        if (location && locationPermission) {
            const radius = (preferences?.maxDistance || 10) * 1609; // Convert miles to meters
            fetchNearbyRestaurants(radius, preferences?.favoritesCuisines);
        }
    }, [location, locationPermission, preferences]);

    // Filter recommendations based on user preferences
    const getRecommendations = (): Restaurant[] => {
        if (!preferences) return restaurants.slice(0, 10);

        return restaurants
            .filter((restaurant) => {
                // Filter by max distance
                if (restaurant.distance > preferences.maxDistance) {
                    return false;
                }

                // Match preferred cuisines if set
                if (preferences.favoritesCuisines.length > 0) {
                    const matchesCuisine = restaurant.cuisine.some((c) =>
                        preferences.favoritesCuisines.includes(c)
                    );
                    if (!matchesCuisine) return false;
                }

                // Match dietary restrictions if set
                // Filter out restaurants that are clearly incompatible (BBQ, steakhouse, etc.)
                // Also prefer restaurants with explicit dietary options
                if (preferences.dietaryRestrictions.length > 0) {
                    // Check if restaurant type is incompatible with dietary needs
                    if (
                        isIncompatibleWithDiet(
                            restaurant.cuisine,
                            preferences.dietaryRestrictions
                        )
                    ) {
                        return false;
                    }

                    // If restaurant has dietary info, check if it matches
                    if (restaurant.dietary && restaurant.dietary.length > 0) {
                        const matchesDietary = preferences.dietaryRestrictions.some(
                            (d) => restaurant.dietary?.includes(d)
                        );
                        if (!matchesDietary) return false;
                    }
                    // If no dietary info and not obviously incompatible, include it
                }

                return true;
            })
            .sort((a, b) => {
                // Sort by rating, then distance
                if (b.rating !== a.rating) {
                    return b.rating - a.rating;
                }
                return a.distance - b.distance;
            })
            .slice(0, 10); // Top 10 recommendations
    };

    const recommendations = getRecommendations();

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshLocation();
        if (location) {
            const radius = (preferences?.maxDistance || 10) * 1609;
            await fetchNearbyRestaurants(
                radius,
                preferences?.favoritesCuisines
            );
        }
        setRefreshing(false);
    };

    const handleRestaurantPress = (restaurant: Restaurant) => {
        // Track that user viewed this restaurant
        addToRecentlyViewed(restaurant.id, restaurant);
        router.push(`/restaurant/${restaurant.id}`);
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing || loading}
                        onRefresh={onRefresh}
                    />
                }
            >
                <View style={styles.header}>
                    <Text style={styles.greeting}>
                        Hello,{" "}
                        {user?.user_metadata?.name ||
                            user?.email?.split("@")[0] ||
                            "there"}
                        ! 👋
                    </Text>
                    <Text style={styles.subtitle}>
                        Discover your next favorite restaurant
                    </Text>
                    {!locationPermission && (
                        <View style={styles.locationWarning}>
                            <Ionicons
                                name="location-outline"
                                size={20}
                                color="#FF6B6B"
                            />
                            <Text style={styles.locationWarningText}>
                                Enable location to find nearby restaurants
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recommended for You</Text>
                    <Text style={styles.sectionSubtitle}>
                        {location
                            ? "Based on your location and preferences"
                            : "Based on your preferences"}
                    </Text>
                </View>

                {recommendations.length > 0 ? (
                    recommendations.map((restaurant) => (
                        <RestaurantCard
                            key={restaurant.id}
                            restaurant={restaurant}
                            isFavorite={isFavorite(restaurant.id)}
                            onPress={() => handleRestaurantPress(restaurant)}
                            onFavoriteToggle={() =>
                                toggleFavorite(restaurant.id, restaurant)
                            }
                        />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>
                            No recommendations found. Try updating your
                            preferences!
                        </Text>
                    </View>
                )}

                {recentRestaurants.length > 0 && (
                    <>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                Recently Viewed
                            </Text>
                            <Text style={styles.sectionSubtitle}>
                                Restaurants you've checked out
                            </Text>
                        </View>

                        {recentRestaurants.map((restaurant) => (
                            <RestaurantCard
                                key={restaurant.id}
                                restaurant={restaurant}
                                isFavorite={isFavorite(restaurant.id)}
                                onPress={() =>
                                    handleRestaurantPress(restaurant)
                                }
                                onFavoriteToggle={() =>
                                    toggleFavorite(restaurant.id, restaurant)
                                }
                            />
                        ))}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 16,
    },
    greeting: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
    },
    section: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: "#666",
    },
    emptyState: {
        padding: 32,
        alignItems: "center",
    },
    emptyText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
    },
    locationWarning: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 12,
        padding: 12,
        backgroundColor: "#FFF5F5",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#FFE0E0",
    },
    locationWarningText: {
        fontSize: 14,
        color: "#FF6B6B",
        flex: 1,
    },
});
