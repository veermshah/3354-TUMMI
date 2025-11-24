import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Restaurant } from "../types/restaurant";

export function useFavorites() {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<string[]>([]);
    const [favoriteRestaurants, setFavoriteRestaurants] = useState<
        Restaurant[]
    >([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadFavorites();
        } else {
            setFavorites([]);
            setFavoriteRestaurants([]);
            setLoading(false);
        }
    }, [user]);

    const loadFavorites = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from("user_favorites")
                .select("restaurant_id, restaurant_data")
                .eq("user_id", user.id);

            if (error) {
                console.error("Error loading favorites:", error);
            } else {
                setFavorites(data.map((item) => item.restaurant_id));
                setFavoriteRestaurants(
                    data
                        .filter((item) => item.restaurant_data)
                        .map((item) => item.restaurant_data as Restaurant)
                );
            }
        } catch (error) {
            console.error("Error loading favorites:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async (
        restaurantId: string,
        restaurantData?: Restaurant
    ) => {
        if (!user) return;

        const isFav = favorites.includes(restaurantId);

        try {
            if (isFav) {
                // Remove from favorites
                const { error } = await supabase
                    .from("user_favorites")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("restaurant_id", restaurantId);

                if (error) {
                    console.error("Error removing favorite:", error);
                } else {
                    setFavorites(favorites.filter((id) => id !== restaurantId));
                    setFavoriteRestaurants(
                        favoriteRestaurants.filter((r) => r.id !== restaurantId)
                    );
                }
            } else {
                // Add to favorites
                const { error } = await supabase.from("user_favorites").insert({
                    user_id: user.id,
                    restaurant_id: restaurantId,
                    restaurant_data: restaurantData,
                });

                if (error) {
                    console.error("Error adding favorite:", error);
                } else {
                    setFavorites([...favorites, restaurantId]);
                    if (restaurantData) {
                        setFavoriteRestaurants([
                            ...favoriteRestaurants,
                            restaurantData,
                        ]);
                    }
                }
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    };

    const isFavorite = (restaurantId: string) =>
        favorites.includes(restaurantId);

    const refreshFavorites = () => {
        loadFavorites();
    };

    return {
        favorites,
        favoriteRestaurants,
        loading,
        toggleFavorite,
        isFavorite,
        refreshFavorites,
    };
}
