import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export function useRecentlyViewed() {
    const { user } = useAuth();
    const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadRecentlyViewed();
        } else {
            setRecentlyViewed([]);
            setLoading(false);
        }
    }, [user]);

    const loadRecentlyViewed = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from("recently_viewed")
                .select("restaurant_id")
                .eq("user_id", user.id)
                .order("viewed_at", { ascending: false })
                .limit(20);

            if (error) {
                console.error("Error loading recently viewed:", error);
            } else {
                setRecentlyViewed(data.map((item) => item.restaurant_id));
            }
        } catch (error) {
            console.error("Error loading recently viewed:", error);
        } finally {
            setLoading(false);
        }
    };

    const addToRecentlyViewed = async (restaurantId: string) => {
        if (!user) return;

        try {
            // Check if already exists
            const { data: existing } = await supabase
                .from("recently_viewed")
                .select("id")
                .eq("user_id", user.id)
                .eq("restaurant_id", restaurantId)
                .single();

            if (existing) {
                // Update viewed_at timestamp
                const { error } = await supabase
                    .from("recently_viewed")
                    .update({ viewed_at: new Date().toISOString() })
                    .eq("user_id", user.id)
                    .eq("restaurant_id", restaurantId);

                if (error) {
                    console.error("Error updating recently viewed:", error);
                }
            } else {
                // Insert new record
                const { error } = await supabase
                    .from("recently_viewed")
                    .insert({
                        user_id: user.id,
                        restaurant_id: restaurantId,
                    });

                if (error) {
                    console.error("Error adding to recently viewed:", error);
                }
            }

            // Reload the list to reflect changes
            await loadRecentlyViewed();
        } catch (error) {
            console.error("Error adding to recently viewed:", error);
        }
    };

    return {
        recentlyViewed,
        loading,
        addToRecentlyViewed,
    };
}
