import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Restaurant } from "../types/restaurant";

export function useRecentlyViewed() {
    const { user } = useAuth();
    const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
    const [recentRestaurants, setRecentRestaurants] = useState<Restaurant[]>(
        []
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadRecentlyViewed();
        } else {
            setRecentlyViewed([]);
            setRecentRestaurants([]);
            setLoading(false);
        }
    }, [user]);

    const loadRecentlyViewed = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from("recently_viewed")
                .select("restaurant_id, restaurant_data")
                .eq("user_id", user.id)
                .order("viewed_at", { ascending: false })
                .limit(20);

            if (error) {
                console.error("Error loading recently viewed:", error);
            } else {
                setRecentlyViewed(data.map((item) => item.restaurant_id));
                setRecentRestaurants(
                    data
                        .filter((item) => item.restaurant_data)
                        .map((item) => item.restaurant_data as Restaurant)
                );
            }
        } catch (error) {
            console.error("Error loading recently viewed:", error);
        } finally {
            setLoading(false);
        }
    };

    const addToRecentlyViewed = async (
        restaurantId: string,
        restaurantData?: Restaurant
    ) => {
        if (!user) return;

        try {
            // Use upsert to insert or update - this handles duplicates automatically
            // onConflict specifies which columns define uniqueness
            const { error } = await supabase.from("recently_viewed").upsert(
                {
                    user_id: user.id,
                    restaurant_id: restaurantId,
                    restaurant_data: restaurantData,
                    viewed_at: new Date().toISOString(),
                },
                {
                    onConflict: "user_id,restaurant_id",
                }
            );

            if (error) {
                console.error("Error adding to recently viewed:", error);
            } else {
                // Reload the list to reflect changes
                await loadRecentlyViewed();
            }
        } catch (error) {
            console.error("Error adding to recently viewed:", error);
        }
    };

    return {
        recentlyViewed,
        recentRestaurants,
        loading,
        addToRecentlyViewed,
    };
}
