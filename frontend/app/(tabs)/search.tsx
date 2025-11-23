import React, { useState, useMemo } from "react";
import {
    StyleSheet,
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { RestaurantCard } from "@/components/restaurant-card";
import { mockRestaurants, cuisineOptions } from "@/data/mockData";
import { useFavorites } from "@/hooks/use-favorites";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { Restaurant } from "@/types/restaurant";

export default function SearchScreen() {
    const { toggleFavorite, isFavorite } = useFavorites();
    const { addToRecentlyViewed } = useRecentlyViewed();
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
    const [minRating, setMinRating] = useState(0);
    const [maxDistance, setMaxDistance] = useState(10);

    const filteredRestaurants = useMemo(() => {
        return mockRestaurants.filter((restaurant) => {
            // Search filter
            const matchesSearch =
                searchQuery === "" ||
                restaurant.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                restaurant.cuisine.some((c) =>
                    c.toLowerCase().includes(searchQuery.toLowerCase())
                );

            // Cuisine filter
            const matchesCuisine =
                selectedCuisines.length === 0 ||
                restaurant.cuisine.some((c) => selectedCuisines.includes(c));

            // Rating filter
            const matchesRating = restaurant.rating >= minRating;

            // Distance filter
            const matchesDistance = restaurant.distance <= maxDistance;

            return (
                matchesSearch &&
                matchesCuisine &&
                matchesRating &&
                matchesDistance
            );
        });
    }, [searchQuery, selectedCuisines, minRating, maxDistance]);

    const toggleCuisine = (cuisine: string) => {
        setSelectedCuisines((prev) =>
            prev.includes(cuisine)
                ? prev.filter((c) => c !== cuisine)
                : [...prev, cuisine]
        );
    };

    const clearFilters = () => {
        setSelectedCuisines([]);
        setMinRating(0);
        setMaxDistance(10);
    };

    const activeFiltersCount =
        selectedCuisines.length +
        (minRating > 0 ? 1 : 0) +
        (maxDistance < 10 ? 1 : 0);

    const handleRestaurantPress = (restaurantId: string) => {
        // Track that user viewed this restaurant
        addToRecentlyViewed(restaurantId);
        // TODO: Navigate to restaurant detail page when implemented
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <Text style={styles.title}>Search Restaurants</Text>

                <View style={styles.searchContainer}>
                    <Ionicons
                        name="search"
                        size={20}
                        color="#666"
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or cuisine..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#999"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <Ionicons
                                name="close-circle"
                                size={20}
                                color="#666"
                            />
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setShowFilters(true)}
                >
                    <Ionicons
                        name="options-outline"
                        size={20}
                        color="#2E7D32"
                    />
                    <Text style={styles.filterButtonText}>Filters</Text>
                    {activeFiltersCount > 0 && (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>
                                {activeFiltersCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
                <Text style={styles.resultsText}>
                    {filteredRestaurants.length} restaurant
                    {filteredRestaurants.length !== 1 ? "s" : ""} found
                </Text>

                {filteredRestaurants.map((restaurant) => (
                    <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        isFavorite={isFavorite(restaurant.id)}
                        onPress={() => handleRestaurantPress(restaurant.id)}
                        onFavoriteToggle={() => toggleFavorite(restaurant.id)}
                    />
                ))}
            </ScrollView>

            {/* Filter Modal */}
            <Modal
                visible={showFilters}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowFilters(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filters</Text>
                            <TouchableOpacity
                                onPress={() => setShowFilters(false)}
                            >
                                <Ionicons
                                    name="close"
                                    size={28}
                                    color="#1a1a1a"
                                />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {/* Cuisines */}
                            <Text style={styles.filterSectionTitle}>
                                Cuisines
                            </Text>
                            <View style={styles.cuisineGrid}>
                                {cuisineOptions.map((cuisine) => (
                                    <TouchableOpacity
                                        key={cuisine}
                                        style={[
                                            styles.cuisineChip,
                                            selectedCuisines.includes(
                                                cuisine
                                            ) && styles.cuisineChipSelected,
                                        ]}
                                        onPress={() => toggleCuisine(cuisine)}
                                    >
                                        <Text
                                            style={[
                                                styles.cuisineChipText,
                                                selectedCuisines.includes(
                                                    cuisine
                                                ) &&
                                                    styles.cuisineChipTextSelected,
                                            ]}
                                        >
                                            {cuisine}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Rating */}
                            <Text style={styles.filterSectionTitle}>
                                Minimum Rating
                            </Text>
                            <View style={styles.ratingContainer}>
                                {[0, 3, 3.5, 4, 4.5].map((rating) => (
                                    <TouchableOpacity
                                        key={rating}
                                        style={[
                                            styles.ratingButton,
                                            minRating === rating &&
                                                styles.ratingButtonSelected,
                                        ]}
                                        onPress={() => setMinRating(rating)}
                                    >
                                        <Ionicons
                                            name="star"
                                            size={16}
                                            color={
                                                minRating === rating
                                                    ? "#fff"
                                                    : "#FFB800"
                                            }
                                        />
                                        <Text
                                            style={[
                                                styles.ratingButtonText,
                                                minRating === rating &&
                                                    styles.ratingButtonTextSelected,
                                            ]}
                                        >
                                            {rating === 0
                                                ? "Any"
                                                : `${rating}+`}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Distance */}
                            <Text style={styles.filterSectionTitle}>
                                Maximum Distance
                            </Text>
                            <View style={styles.distanceContainer}>
                                {[1, 2, 5, 10].map((distance) => (
                                    <TouchableOpacity
                                        key={distance}
                                        style={[
                                            styles.distanceButton,
                                            maxDistance === distance &&
                                                styles.distanceButtonSelected,
                                        ]}
                                        onPress={() => setMaxDistance(distance)}
                                    >
                                        <Text
                                            style={[
                                                styles.distanceButtonText,
                                                maxDistance === distance &&
                                                    styles.distanceButtonTextSelected,
                                            ]}
                                        >
                                            {distance} mi
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={clearFilters}
                            >
                                <Text style={styles.clearButtonText}>
                                    Clear All
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.applyButton}
                                onPress={() => setShowFilters(false)}
                            >
                                <Text style={styles.applyButtonText}>
                                    Apply Filters
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        paddingTop: 16,
        paddingBottom: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 16,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#1a1a1a",
    },
    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#E8F5E9",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 6,
    },
    filterButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2E7D32",
    },
    filterBadge: {
        backgroundColor: "#2E7D32",
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 4,
    },
    filterBadgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
    },
    scrollView: {
        flex: 1,
    },
    resultsText: {
        fontSize: 14,
        color: "#666",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "80%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1a1a1a",
    },
    modalBody: {
        padding: 20,
    },
    filterSectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 12,
        marginTop: 8,
    },
    cuisineGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 20,
    },
    cuisineChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#f5f5f5",
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    cuisineChipSelected: {
        backgroundColor: "#2E7D32",
        borderColor: "#2E7D32",
    },
    cuisineChipText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    cuisineChipTextSelected: {
        color: "#fff",
    },
    ratingContainer: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 20,
    },
    ratingButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: "#f5f5f5",
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    ratingButtonSelected: {
        backgroundColor: "#FFB800",
        borderColor: "#FFB800",
    },
    ratingButtonText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "600",
    },
    ratingButtonTextSelected: {
        color: "#fff",
    },
    distanceContainer: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 20,
    },
    distanceButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: "#f5f5f5",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    distanceButtonSelected: {
        backgroundColor: "#2E7D32",
        borderColor: "#2E7D32",
    },
    distanceButtonText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "600",
    },
    distanceButtonTextSelected: {
        color: "#fff",
    },
    modalFooter: {
        flexDirection: "row",
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
    },
    clearButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#f5f5f5",
        alignItems: "center",
    },
    clearButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
    },
    applyButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#2E7D32",
        alignItems: "center",
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
});
