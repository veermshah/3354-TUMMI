import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Restaurant } from "../types/restaurant";

interface RestaurantCardProps {
    restaurant: Restaurant;
    isFavorite?: boolean;
    onPress?: () => void;
    onFavoriteToggle?: () => void;
}

export function RestaurantCard({
    restaurant,
    isFavorite = false,
    onPress,
    onFavoriteToggle,
}: RestaurantCardProps) {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.name}>{restaurant.name}</Text>
                    <View style={styles.cuisineContainer}>
                        {restaurant.cuisine
                            .slice(0, 2)
                            .map((cuisine, index) => (
                                <View key={index} style={styles.cuisineTag}>
                                    <Text style={styles.cuisineText}>
                                        {cuisine}
                                    </Text>
                                </View>
                            ))}
                    </View>
                </View>
                <Pressable
                    onPress={onFavoriteToggle}
                    style={styles.favoriteButton}
                >
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={24}
                        color={isFavorite ? "#FF6B6B" : "#666"}
                    />
                </Pressable>
            </View>

            <View style={styles.info}>
                <View style={styles.infoRow}>
                    <Ionicons name="star" size={16} color="#FFB800" />
                    <Text style={styles.infoText}>
                        {restaurant.rating.toFixed(1)}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>
                        {restaurant.distance.toFixed(1)} mi
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.priceText}>
                        {restaurant.priceRange}
                    </Text>
                </View>
            </View>

            {restaurant.dietary && restaurant.dietary.length > 0 && (
                <View style={styles.dietaryContainer}>
                    {restaurant.dietary.slice(0, 3).map((diet, index) => (
                        <View key={index} style={styles.dietaryTag}>
                            <Text style={styles.dietaryText}>{diet}</Text>
                        </View>
                    ))}
                </View>
            )}

            {restaurant.description && (
                <Text style={styles.description} numberOfLines={2}>
                    {restaurant.description}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    headerLeft: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 6,
    },
    cuisineContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
    },
    cuisineTag: {
        backgroundColor: "#E8F5E9",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    cuisineText: {
        fontSize: 12,
        color: "#2E7D32",
        fontWeight: "600",
    },
    favoriteButton: {
        padding: 4,
    },
    info: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        marginTop: 12,
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    infoText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    priceText: {
        fontSize: 14,
        color: "#2E7D32",
        fontWeight: "600",
    },
    dietaryContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 8,
    },
    dietaryTag: {
        backgroundColor: "#FFF3E0",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    dietaryText: {
        fontSize: 11,
        color: "#E65100",
        fontWeight: "500",
    },
    description: {
        fontSize: 13,
        color: "#666",
        marginTop: 8,
        lineHeight: 18,
    },
});
