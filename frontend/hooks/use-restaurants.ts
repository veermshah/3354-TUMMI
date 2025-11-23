import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { Restaurant } from "../types/restaurant";
import { placesService } from "../services/placesService";
import { mockRestaurants } from "../data/mockData";

export function useRestaurants() {
    const [restaurants, setRestaurants] =
        useState<Restaurant[]>(mockRestaurants);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [locationPermission, setLocationPermission] =
        useState<boolean>(false);

    useEffect(() => {
        requestLocationPermission();
    }, []);

    const requestLocationPermission = async () => {
        try {
            const { status } =
                await Location.requestForegroundPermissionsAsync();
            setLocationPermission(status === "granted");

            if (status === "granted") {
                const location = await Location.getCurrentPositionAsync({});
                setLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            }
        } catch (error) {
            console.error("Error requesting location permission:", error);
            setError("Unable to get location permission");
        }
    };

    const fetchNearbyRestaurants = async (
        radius: number = 5000,
        cuisineTypes?: string[]
    ) => {
        if (!location) {
            setError("Location not available");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await placesService.searchNearbyRestaurants(
                location.latitude,
                location.longitude,
                radius,
                cuisineTypes
            );
            setRestaurants(data);
        } catch (err) {
            console.error("Error fetching restaurants:", err);
            setError("Failed to fetch restaurants");
            // Keep mock data on error
        } finally {
            setLoading(false);
        }
    };

    const searchRestaurants = async (query: string) => {
        setLoading(true);
        setError(null);

        try {
            const data = await placesService.searchRestaurantsByText(
                query,
                location?.latitude,
                location?.longitude
            );
            setRestaurants(data);
        } catch (err) {
            console.error("Error searching restaurants:", err);
            setError("Failed to search restaurants");
            // Keep current data on error
        } finally {
            setLoading(false);
        }
    };

    const refreshLocation = async () => {
        if (!locationPermission) {
            await requestLocationPermission();
            return;
        }

        try {
            const newLocation = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: newLocation.coords.latitude,
                longitude: newLocation.coords.longitude,
            });
        } catch (error) {
            console.error("Error refreshing location:", error);
            setError("Unable to refresh location");
        }
    };

    return {
        restaurants,
        loading,
        error,
        location,
        locationPermission,
        fetchNearbyRestaurants,
        searchRestaurants,
        refreshLocation,
    };
}
