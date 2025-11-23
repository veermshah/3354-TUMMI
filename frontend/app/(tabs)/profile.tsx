import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Modal,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { cuisineOptions, dietaryOptions } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { UserPreferences } from "@/types/restaurant";

export default function ProfileScreen() {
    const { user, preferences, updatePreferences, signOut } = useAuth();
    const [localPreferences, setLocalPreferences] = useState<UserPreferences>(
        preferences || {
            favoritesCuisines: [],
            dietaryRestrictions: [],
            maxDistance: 10,
            pricePreference: [],
        }
    );
    const [showCuisineModal, setShowCuisineModal] = useState(false);
    const [showDietaryModal, setShowDietaryModal] = useState(false);
    const [showSignOutModal, setShowSignOutModal] = useState(false);

    useEffect(() => {
        if (preferences) {
            setLocalPreferences(preferences);
        }
    }, [preferences]);

    const toggleCuisine = (cuisine: string) => {
        const newCuisines = localPreferences.favoritesCuisines.includes(cuisine)
            ? localPreferences.favoritesCuisines.filter((c) => c !== cuisine)
            : [...localPreferences.favoritesCuisines, cuisine];

        const newPreferences = {
            ...localPreferences,
            favoritesCuisines: newCuisines,
        };
        setLocalPreferences(newPreferences);
        updatePreferences(newPreferences);
    };

    const toggleDietary = (dietary: string) => {
        const newDietary = localPreferences.dietaryRestrictions.includes(
            dietary
        )
            ? localPreferences.dietaryRestrictions.filter((d) => d !== dietary)
            : [...localPreferences.dietaryRestrictions, dietary];

        const newPreferences = {
            ...localPreferences,
            dietaryRestrictions: newDietary,
        };
        setLocalPreferences(newPreferences);
        updatePreferences(newPreferences);
    };

    const updateMaxDistance = (distance: number) => {
        const newPreferences = {
            ...localPreferences,
            maxDistance: distance,
        };
        setLocalPreferences(newPreferences);
        updatePreferences(newPreferences);
    };

    const handleSignOut = async () => {
        if (Platform.OS === "web") {
            if (window.confirm("Are you sure you want to sign out?")) {
                await signOut();
            }
        } else {
            // For native platforms, use a simple confirmation modal
            setShowSignOutModal(true);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={48} color="#fff" />
                        </View>
                    </View>
                    <Text style={styles.name}>
                        {user?.user_metadata?.name ||
                            user?.email?.split("@")[0] ||
                            "User"}
                    </Text>
                    <Text style={styles.email}>{user?.email}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>

                    <TouchableOpacity
                        style={styles.preferenceItem}
                        onPress={() => setShowCuisineModal(true)}
                    >
                        <View style={styles.preferenceLeft}>
                            <Ionicons
                                name="restaurant"
                                size={24}
                                color="#2E7D32"
                            />
                            <View style={styles.preferenceText}>
                                <Text style={styles.preferenceLabel}>
                                    Favorite Cuisines
                                </Text>
                                <Text style={styles.preferenceValue}>
                                    {localPreferences.favoritesCuisines
                                        .length || 0}{" "}
                                    selected
                                </Text>
                            </View>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#ccc"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.preferenceItem}
                        onPress={() => setShowDietaryModal(true)}
                    >
                        <View style={styles.preferenceLeft}>
                            <Ionicons name="leaf" size={24} color="#2E7D32" />
                            <View style={styles.preferenceText}>
                                <Text style={styles.preferenceLabel}>
                                    Dietary Restrictions
                                </Text>
                                <Text style={styles.preferenceValue}>
                                    {localPreferences.dietaryRestrictions
                                        .length || 0}{" "}
                                    selected
                                </Text>
                            </View>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#ccc"
                        />
                    </TouchableOpacity>

                    <View style={styles.preferenceItem}>
                        <View style={styles.preferenceLeft}>
                            <Ionicons
                                name="location"
                                size={24}
                                color="#2E7D32"
                            />
                            <View style={styles.preferenceText}>
                                <Text style={styles.preferenceLabel}>
                                    Max Distance
                                </Text>
                                <Text style={styles.preferenceValue}>
                                    {localPreferences.maxDistance} miles
                                </Text>
                            </View>
                        </View>
                        <View style={styles.distanceControls}>
                            <TouchableOpacity
                                style={styles.distanceButton}
                                onPress={() =>
                                    updateMaxDistance(
                                        Math.max(
                                            1,
                                            localPreferences.maxDistance - 1
                                        )
                                    )
                                }
                            >
                                <Ionicons
                                    name="remove"
                                    size={20}
                                    color="#2E7D32"
                                />
                            </TouchableOpacity>
                            <Text style={styles.distanceValue}>
                                {localPreferences.maxDistance}
                            </Text>
                            <TouchableOpacity
                                style={styles.distanceButton}
                                onPress={() =>
                                    updateMaxDistance(
                                        Math.min(
                                            50,
                                            localPreferences.maxDistance + 1
                                        )
                                    )
                                }
                            >
                                <Ionicons
                                    name="add"
                                    size={20}
                                    color="#2E7D32"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons
                            name="settings-outline"
                            size={24}
                            color="#666"
                        />
                        <Text style={styles.menuText}>Settings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons
                            name="help-circle-outline"
                            size={24}
                            color="#666"
                        />
                        <Text style={styles.menuText}>Help & Support</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={handleSignOut}
                    >
                        <Ionicons
                            name="log-out-outline"
                            size={24}
                            color="#FF6B6B"
                        />
                        <Text style={[styles.menuText, { color: "#FF6B6B" }]}>
                            Log Out
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Cuisine Modal */}
            <Modal
                visible={showCuisineModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCuisineModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Favorite Cuisines
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowCuisineModal(false)}
                            >
                                <Ionicons
                                    name="close"
                                    size={28}
                                    color="#1a1a1a"
                                />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            <View style={styles.optionsGrid}>
                                {cuisineOptions.map((cuisine) => (
                                    <TouchableOpacity
                                        key={cuisine}
                                        style={[
                                            styles.optionChip,
                                            localPreferences.favoritesCuisines.includes(
                                                cuisine
                                            ) && styles.optionChipSelected,
                                        ]}
                                        onPress={() => toggleCuisine(cuisine)}
                                    >
                                        <Text
                                            style={[
                                                styles.optionChipText,
                                                localPreferences.favoritesCuisines.includes(
                                                    cuisine
                                                ) &&
                                                    styles.optionChipTextSelected,
                                            ]}
                                        >
                                            {cuisine}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.doneButton}
                                onPress={() => setShowCuisineModal(false)}
                            >
                                <Text style={styles.doneButtonText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Dietary Modal */}
            <Modal
                visible={showDietaryModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowDietaryModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Dietary Restrictions
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowDietaryModal(false)}
                            >
                                <Ionicons
                                    name="close"
                                    size={28}
                                    color="#1a1a1a"
                                />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            <View style={styles.optionsGrid}>
                                {dietaryOptions.map((dietary) => (
                                    <TouchableOpacity
                                        key={dietary}
                                        style={[
                                            styles.optionChip,
                                            localPreferences.dietaryRestrictions.includes(
                                                dietary
                                            ) && styles.optionChipSelected,
                                        ]}
                                        onPress={() => toggleDietary(dietary)}
                                    >
                                        <Text
                                            style={[
                                                styles.optionChipText,
                                                localPreferences.dietaryRestrictions.includes(
                                                    dietary
                                                ) &&
                                                    styles.optionChipTextSelected,
                                            ]}
                                        >
                                            {dietary}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.doneButton}
                                onPress={() => setShowDietaryModal(false)}
                            >
                                <Text style={styles.doneButtonText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Sign Out Confirmation Modal */}
            <Modal
                visible={showSignOutModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowSignOutModal(false)}
            >
                <View style={styles.confirmModalOverlay}>
                    <View style={styles.confirmModalContent}>
                        <Text style={styles.confirmModalTitle}>Sign Out</Text>
                        <Text style={styles.confirmModalMessage}>
                            Are you sure you want to sign out?
                        </Text>
                        <View style={styles.confirmModalButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.confirmButton,
                                    styles.confirmButtonCancel,
                                ]}
                                onPress={() => setShowSignOutModal(false)}
                            >
                                <Text style={styles.confirmButtonTextCancel}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.confirmButton,
                                    styles.confirmButtonConfirm,
                                ]}
                                onPress={() => {
                                    setShowSignOutModal(false);
                                    signOut();
                                }}
                            >
                                <Text style={styles.confirmButtonTextConfirm}>
                                    Sign Out
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
    scrollView: {
        flex: 1,
    },
    header: {
        backgroundColor: "#fff",
        paddingVertical: 32,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: "#2E7D32",
        alignItems: "center",
        justifyContent: "center",
    },
    name: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        color: "#666",
    },
    section: {
        backgroundColor: "#fff",
        marginTop: 16,
        paddingVertical: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1a1a1a",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    preferenceItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    preferenceLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    preferenceText: {
        marginLeft: 12,
        flex: 1,
    },
    preferenceLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1a1a1a",
        marginBottom: 2,
    },
    preferenceValue: {
        fontSize: 14,
        color: "#666",
    },
    distanceControls: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    distanceButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#E8F5E9",
        alignItems: "center",
        justifyContent: "center",
    },
    distanceValue: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1a1a1a",
        minWidth: 24,
        textAlign: "center",
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    menuText: {
        fontSize: 16,
        color: "#1a1a1a",
        marginLeft: 12,
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
        maxHeight: "70%",
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
    optionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    optionChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: "#f5f5f5",
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    optionChipSelected: {
        backgroundColor: "#2E7D32",
        borderColor: "#2E7D32",
    },
    optionChipText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    optionChipTextSelected: {
        color: "#fff",
    },
    modalFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
    },
    doneButton: {
        backgroundColor: "#2E7D32",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    doneButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    confirmModalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    confirmModalContent: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 24,
        width: "80%",
        maxWidth: 400,
    },
    confirmModalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 12,
    },
    confirmModalMessage: {
        fontSize: 16,
        color: "#666",
        marginBottom: 24,
    },
    confirmModalButtons: {
        flexDirection: "row",
        gap: 12,
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    confirmButtonCancel: {
        backgroundColor: "#f5f5f5",
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    confirmButtonConfirm: {
        backgroundColor: "#FF6B6B",
    },
    confirmButtonTextCancel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
    },
    confirmButtonTextConfirm: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
});
