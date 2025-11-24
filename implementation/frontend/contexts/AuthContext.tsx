import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { UserPreferences } from "../types/restaurant";

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    preferences: UserPreferences | null;
    hasCompletedOnboarding: boolean;
    signInWithEmail: (
        email: string,
        password: string
    ) => Promise<{ error: any }>;
    signUpWithEmail: (
        email: string,
        password: string
    ) => Promise<{ error: any }>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    updatePreferences: (preferences: UserPreferences) => Promise<void>;
    completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [preferences, setPreferences] = useState<UserPreferences | null>(
        null
    );
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                loadUserData(session.user.id);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                loadUserData(session.user.id);
            } else {
                setPreferences(null);
                setHasCompletedOnboarding(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadUserData = async (userId: string) => {
        try {
            // Load user preferences and onboarding status
            const { data, error } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (error) {
                console.error("Error loading user data:", error);
                return;
            }

            if (data) {
                setPreferences({
                    favoritesCuisines: data.favorite_cuisines || [],
                    dietaryRestrictions: data.dietary_restrictions || [],
                    maxDistance: data.max_distance || 10,
                    pricePreference: data.price_preference || [],
                });
                setHasCompletedOnboarding(data.completed_onboarding || false);
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error };
    };

    const signUpWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });
        return { error };
    };

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: "tummi://auth/callback",
            },
        });
        if (error) {
            console.error("Error signing in with Google:", error);
        }
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error signing out:", error);
        }
    };

    const updatePreferences = async (newPreferences: UserPreferences) => {
        if (!user) return;

        try {
            const { error } = await supabase.from("user_profiles").upsert({
                id: user.id,
                favorite_cuisines: newPreferences.favoritesCuisines,
                dietary_restrictions: newPreferences.dietaryRestrictions,
                max_distance: newPreferences.maxDistance,
                price_preference: newPreferences.pricePreference,
                updated_at: new Date().toISOString(),
            });

            if (error) {
                console.error("Error updating preferences:", error);
            } else {
                setPreferences(newPreferences);
            }
        } catch (error) {
            console.error("Error updating preferences:", error);
        }
    };

    const completeOnboarding = async () => {
        if (!user) return;

        try {
            const { error } = await supabase.from("user_profiles").upsert({
                id: user.id,
                completed_onboarding: true,
                updated_at: new Date().toISOString(),
            });

            if (error) {
                console.error("Error completing onboarding:", error);
            } else {
                setHasCompletedOnboarding(true);
            }
        } catch (error) {
            console.error("Error completing onboarding:", error);
        }
    };

    const value = {
        session,
        user,
        loading,
        preferences,
        hasCompletedOnboarding,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        updatePreferences,
        completeOnboarding,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
