import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

export const unstable_settings = {
    anchor: "(tabs)",
};

function RootLayoutNav() {
    const colorScheme = useColorScheme();
    const { user, loading, hasCompletedOnboarding } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === "auth";
        const inOnboardingGroup = segments[0] === "onboarding";
        const inTabsGroup = segments[0] === "(tabs)";

        if (!user && !inAuthGroup) {
            // Redirect to auth if not logged in
            router.replace("/auth");
        } else if (
            user &&
            !hasCompletedOnboarding &&
            !inOnboardingGroup &&
            !inAuthGroup
        ) {
            // Redirect to onboarding if logged in but haven't completed onboarding
            // Allow access to auth for logout purposes
            router.replace("/onboarding");
        } else if (
            user &&
            hasCompletedOnboarding &&
            !inTabsGroup &&
            !inAuthGroup
        ) {
            // Redirect to main app if logged in and completed onboarding
            // Allow access to auth for logout purposes
            router.replace("/(tabs)");
        }
    }, [user, loading, hasCompletedOnboarding, segments]);

    return (
        <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
            <Stack>
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen
                    name="onboarding"
                    options={{ headerShown: false }}
                />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="modal"
                    options={{ presentation: "modal", title: "Modal" }}
                />
            </Stack>
            <StatusBar style="auto" />
        </ThemeProvider>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <RootLayoutNav />
        </AuthProvider>
    );
}
