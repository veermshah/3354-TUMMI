import React, { useState } from "react";
import {
    StyleSheet,
    ScrollView,
    View,
    Text,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RestaurantCard } from "@/components/restaurant-card";
import { mockRestaurants } from "@/data/mockData";
import { useFavorites } from "@/hooks/use-favorites";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { useAuth } from "@/contexts/AuthContext";
import { Restaurant } from "@/types/restaurant";

export default function HomeScreen() {
    const { favorites, toggleFavorite, isFavorite } = useFavorites();
    const { recentlyViewed, addToRecentlyViewed } = useRecentlyViewed();
    const { user, preferences } = useAuth();
    const [refreshing, setRefreshing] = useState(false);

    // Filter recommendations based on user preferences
    const getRecommendations = (): Restaurant[] => {
        if (!preferences) return mockRestaurants;

        return mockRestaurants
            .filter((restaurant) => {
                // Filter by max distance
                if (restaurant.distance > preferences.maxDistance) {
                    return false;
                }

                // Match preferred cuisines
                const matchesCuisine = restaurant.cuisine.some((c) =>
                    preferences.favoritesCuisines.includes(c)
                );

                return matchesCuisine;
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

    const getRecentlyViewedRestaurants = (): Restaurant[] => {
        return recentlyViewed
            .map((id) => mockRestaurants.find((r) => r.id === id))
            .filter((r): r is Restaurant => r !== undefined)
            .slice(0, 5);
    };

    const recommendations = getRecommendations();
    const recentRestaurants = getRecentlyViewedRestaurants();

    const onRefresh = () => {
        setRefreshing(true);
        // Simulate refresh
        setTimeout(() => setRefreshing(false), 1000);
    };

    const handleRestaurantPress = (restaurantId: string) => {
        // Track that user viewed this restaurant
        addToRecentlyViewed(restaurantId);
        // TODO: Navigate to restaurant detail page when implemented
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
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
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recommended for You</Text>
                    <Text style={styles.sectionSubtitle}>
                        Based on your preferences
                    </Text>
                </View>

                {recommendations.length > 0 ? (
                    recommendations.map((restaurant) => (
                        <RestaurantCard
                            key={restaurant.id}
                            restaurant={restaurant}
                            isFavorite={isFavorite(restaurant.id)}
                            onPress={() => handleRestaurantPress(restaurant.id)}
                            onFavoriteToggle={() =>
                                toggleFavorite(restaurant.id)
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
                                    handleRestaurantPress(restaurant.id)
                                }
                                onFavoriteToggle={() =>
                                    toggleFavorite(restaurant.id)
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
});
