import React from "react";
import { StyleSheet, ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { RestaurantCard } from "@/components/restaurant-card";
import { useFavorites } from "@/hooks/use-favorites";
import { useRestaurants } from "@/hooks/use-restaurants";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

export default function FavoritesScreen() {
    const {
        favoriteRestaurants,
        toggleFavorite,
        isFavorite,
        loading,
        refreshFavorites,
    } = useFavorites();
    const { addToRecentlyViewed } = useRecentlyViewed();

    // Reload favorites when this screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            refreshFavorites();
        }, [])
    );

    const handleRestaurantPress = (restaurant: any) => {
        addToRecentlyViewed(restaurant.id, restaurant);
        router.push(`/restaurant/${restaurant.id}`);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <View style={styles.centerContent}>
                    <Text style={styles.emptyText}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <Text style={styles.title}>Favorites</Text>
                <Text style={styles.subtitle}>
                    {favoriteRestaurants.length} restaurant
                    {favoriteRestaurants.length !== 1 ? "s" : ""}
                </Text>
            </View>

            {favoriteRestaurants.length > 0 ? (
                <ScrollView style={styles.scrollView}>
                    {favoriteRestaurants.map((restaurant) => (
                        <RestaurantCard
                            key={restaurant.id}
                            restaurant={restaurant}
                            isFavorite={true}
                            onPress={() => handleRestaurantPress(restaurant)}
                            onFavoriteToggle={() =>
                                toggleFavorite(restaurant.id, restaurant)
                            }
                        />
                    ))}
                </ScrollView>
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="heart-outline" size={80} color="#ccc" />
                    <Text style={styles.emptyTitle}>No Favorites Yet</Text>
                    <Text style={styles.emptyText}>
                        Start adding restaurants to your favorites by tapping
                        the heart icon!
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
    },
    scrollView: {
        flex: 1,
    },
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1a1a1a",
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        lineHeight: 24,
    },
    centerContent: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});
