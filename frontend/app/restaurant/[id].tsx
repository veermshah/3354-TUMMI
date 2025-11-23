import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    ScrollView,
    View,
    Text,
    Image,
    TouchableOpacity,
    Linking,
    Platform,
    ActivityIndicator,
    Dimensions,
} from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Restaurant } from "@/types/restaurant";
import { useFavorites } from "@/hooks/use-favorites";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { placesService } from "@/services/placesService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function RestaurantDetailScreen() {
    const params = useLocalSearchParams<{ id: string }>();
    const id = params.id;
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const { isFavorite, toggleFavorite } = useFavorites();
    const { addToRecentlyViewed, recentRestaurants } = useRecentlyViewed();

    useEffect(() => {
        if (id) {
            loadRestaurantDetails();
        }
    }, [id]);

    const loadRestaurantDetails = async () => {
        try {
            setLoading(true);

            // First, try to find the restaurant in recently viewed (which has full data)
            const recentRestaurant = recentRestaurants.find((r) => r.id === id);

            if (recentRestaurant) {
                setRestaurant(recentRestaurant);
                setLoading(false);
                return;
            }

            // If not in recent, try to fetch from API
            const data = await placesService.getPlaceDetails(id!);
            if (data) {
                setRestaurant(data);
                addToRecentlyViewed(id!, data);
            }
        } catch (error) {
            console.error("Error loading restaurant details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGetDirections = () => {
        if (!restaurant) return;

        const address = encodeURIComponent(restaurant.address);
        const label = encodeURIComponent(restaurant.name);

        let url = "";
        if (Platform.OS === "ios") {
            url = `maps://app?daddr=${address}&q=${label}`;
        } else if (Platform.OS === "android") {
            url = `google.navigation:q=${address}`;
        } else {
            // Web
            url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
        }

        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    return Linking.openURL(url);
                } else {
                    // Fallback to Google Maps website
                    return Linking.openURL(
                        `https://www.google.com/maps/dir/?api=1&destination=${address}`
                    );
                }
            })
            .catch((err) => console.error("Error opening maps:", err));
    };

    const handleCall = () => {
        if (!restaurant?.phone) return;
        const phoneNumber = restaurant.phone.replace(/\s/g, "");
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const handleWebsite = () => {
        if (!restaurant?.website) return;
        Linking.openURL(restaurant.website);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen
                    options={{
                        headerShown: true,
                        title: "Restaurant Details",
                        headerBackTitle: "Back",
                    }}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2E7D32" />
                </View>
            </SafeAreaView>
        );
    }

    if (!restaurant) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen
                    options={{
                        headerShown: true,
                        title: "Restaurant Details",
                        headerBackTitle: "Back",
                    }}
                />
                <View style={styles.loadingContainer}>
                    <Text style={styles.errorText}>Restaurant not found</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["bottom"]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: restaurant.name,
                    headerBackTitle: "Back",
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() =>
                                toggleFavorite(restaurant.id, restaurant)
                            }
                            style={styles.headerButton}
                        >
                            <Ionicons
                                name={
                                    isFavorite(restaurant.id)
                                        ? "heart"
                                        : "heart-outline"
                                }
                                size={28}
                                color={
                                    isFavorite(restaurant.id)
                                        ? "#FF6B6B"
                                        : "#1a1a1a"
                                }
                            />
                        </TouchableOpacity>
                    ),
                }}
            />
            <ScrollView style={styles.scrollView}>
                {/* Header Image */}
                {restaurant.photos && restaurant.photos.length > 0 ? (
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        style={styles.imageContainer}
                    >
                        {restaurant.photos.map((photoUrl, index) => (
                            <Image
                                key={index}
                                source={{ uri: photoUrl }}
                                style={styles.restaurantImage}
                                resizeMode="cover"
                            />
                        ))}
                    </ScrollView>
                ) : restaurant.imageUrl ? (
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: restaurant.imageUrl }}
                            style={styles.restaurantImage}
                            resizeMode="cover"
                        />
                    </View>
                ) : (
                    <View style={styles.imageContainer}>
                        <View style={styles.imagePlaceholder}>
                            <Ionicons
                                name="restaurant"
                                size={64}
                                color="#ccc"
                            />
                            <Text style={styles.imagePlaceholderText}>
                                No Image Available
                            </Text>
                        </View>
                    </View>
                )}

                {/* Restaurant Info */}
                <View style={styles.infoSection}>
                    <Text style={styles.restaurantName}>{restaurant.name}</Text>

                    <View style={styles.ratingContainer}>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={20} color="#FFB800" />
                            <Text style={styles.ratingText}>
                                {restaurant.rating.toFixed(1)} Rating
                            </Text>
                        </View>
                        <Text style={styles.priceText}>
                            {restaurant.priceRange}
                        </Text>
                    </View>

                    {/* Cuisine Tags */}
                    <View style={styles.cuisineContainer}>
                        {restaurant.cuisine.map((cuisine, index) => (
                            <View key={index} style={styles.cuisineTag}>
                                <Text style={styles.cuisineTagText}>
                                    {cuisine}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Dietary Options */}
                    {restaurant.dietary && restaurant.dietary.length > 0 && (
                        <View style={styles.dietaryContainer}>
                            {restaurant.dietary.map((option, index) => (
                                <View key={index} style={styles.dietaryTag}>
                                    <Text style={styles.dietaryTagText}>
                                        {option}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Description */}
                {restaurant.description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.description}>
                            {restaurant.description}
                        </Text>
                    </View>
                )}

                {/* Contact Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact & Location</Text>

                    <TouchableOpacity
                        style={styles.contactItem}
                        onPress={handleGetDirections}
                    >
                        <Ionicons name="location" size={24} color="#2E7D32" />
                        <View style={styles.contactText}>
                            <Text style={styles.contactLabel}>Address</Text>
                            <Text style={styles.contactValue}>
                                {restaurant.address}
                            </Text>
                            <Text style={styles.distanceText}>
                                {restaurant.distance.toFixed(1)} miles away
                            </Text>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#999"
                        />
                    </TouchableOpacity>

                    {restaurant.phone && (
                        <TouchableOpacity
                            style={styles.contactItem}
                            onPress={handleCall}
                        >
                            <Ionicons name="call" size={24} color="#2E7D32" />
                            <View style={styles.contactText}>
                                <Text style={styles.contactLabel}>Phone</Text>
                                <Text style={styles.contactValue}>
                                    {restaurant.phone}
                                </Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={24}
                                color="#999"
                            />
                        </TouchableOpacity>
                    )}

                    {restaurant.website && (
                        <TouchableOpacity
                            style={styles.contactItem}
                            onPress={handleWebsite}
                        >
                            <Ionicons name="globe" size={24} color="#2E7D32" />
                            <View style={styles.contactText}>
                                <Text style={styles.contactLabel}>Website</Text>
                                <Text
                                    style={styles.contactValueLink}
                                    numberOfLines={1}
                                >
                                    {restaurant.website}
                                </Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={24}
                                color="#999"
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Menu Section Placeholder */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Menu</Text>
                    <View style={styles.placeholderBox}>
                        <Ionicons
                            name="document-text-outline"
                            size={48}
                            color="#ccc"
                        />
                        <Text style={styles.placeholderText}>
                            Menu information coming soon
                        </Text>
                        {restaurant.website && (
                            <TouchableOpacity
                                style={styles.linkButton}
                                onPress={handleWebsite}
                            >
                                <Text style={styles.linkButtonText}>
                                    Visit Website for Menu
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Reviews Section Placeholder */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reviews</Text>
                    <View style={styles.placeholderBox}>
                        <Ionicons
                            name="chatbubbles-outline"
                            size={48}
                            color="#ccc"
                        />
                        <Text style={styles.placeholderText}>
                            Reviews coming soon
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Buttons */}
            <View style={styles.bottomActions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.directionsButton]}
                    onPress={handleGetDirections}
                >
                    <Ionicons name="navigate" size={24} color="#fff" />
                    <Text style={styles.actionButtonText}>Get Directions</Text>
                </TouchableOpacity>
                {restaurant.phone && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.callButton]}
                        onPress={handleCall}
                    >
                        <Ionicons name="call" size={24} color="#2E7D32" />
                        <Text
                            style={[
                                styles.actionButtonText,
                                styles.callButtonText,
                            ]}
                        >
                            Call
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
    },
    errorText: {
        fontSize: 18,
        color: "#666",
        marginBottom: 16,
    },
    backButton: {
        backgroundColor: "#2E7D32",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    headerButton: {
        padding: 8,
    },
    imageContainer: {
        width: SCREEN_WIDTH,
        height: 250,
        backgroundColor: "#e0e0e0",
    },
    restaurantImage: {
        width: SCREEN_WIDTH,
        height: 250,
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    imagePlaceholderText: {
        marginTop: 12,
        fontSize: 14,
        color: "#999",
    },
    infoSection: {
        backgroundColor: "#fff",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    restaurantName: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 12,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    ratingText: {
        fontSize: 16,
        color: "#666",
        fontWeight: "600",
    },
    priceText: {
        fontSize: 18,
        color: "#2E7D32",
        fontWeight: "700",
    },
    cuisineContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 12,
    },
    cuisineTag: {
        backgroundColor: "#E8F5E9",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    cuisineTagText: {
        fontSize: 14,
        color: "#2E7D32",
        fontWeight: "600",
    },
    dietaryContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    dietaryTag: {
        backgroundColor: "#FFF3E0",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    dietaryTagText: {
        fontSize: 13,
        color: "#E65100",
        fontWeight: "500",
    },
    section: {
        backgroundColor: "#fff",
        padding: 20,
        marginTop: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#e0e0e0",
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: "#666",
        lineHeight: 24,
    },
    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        gap: 12,
    },
    contactText: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 14,
        color: "#999",
        marginBottom: 4,
    },
    contactValue: {
        fontSize: 16,
        color: "#1a1a1a",
        fontWeight: "500",
    },
    contactValueLink: {
        fontSize: 16,
        color: "#2E7D32",
        fontWeight: "500",
    },
    distanceText: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
    },
    placeholderBox: {
        padding: 40,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fa",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    placeholderText: {
        marginTop: 12,
        fontSize: 16,
        color: "#999",
        textAlign: "center",
    },
    linkButton: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: "#2E7D32",
        borderRadius: 8,
    },
    linkButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    bottomActions: {
        flexDirection: "row",
        padding: 16,
        gap: 12,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    directionsButton: {
        backgroundColor: "#2E7D32",
    },
    callButton: {
        backgroundColor: "#E8F5E9",
        borderWidth: 1,
        borderColor: "#2E7D32",
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    callButtonText: {
        color: "#2E7D32",
    },
});
