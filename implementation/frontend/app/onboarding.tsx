import React, { useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { cuisineOptions, dietaryOptions } from "@/data/mockData";
import { UserPreferences } from "@/types/restaurant";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
    const [step, setStep] = useState(0);
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
    const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
    const [maxDistance, setMaxDistance] = useState(5);
    const [pricePreference, setPricePreference] = useState<string[]>([]);

    const { updatePreferences, completeOnboarding } = useAuth();

    const toggleCuisine = (cuisine: string) => {
        setSelectedCuisines((prev) =>
            prev.includes(cuisine)
                ? prev.filter((c) => c !== cuisine)
                : [...prev, cuisine]
        );
    };

    const toggleDietary = (dietary: string) => {
        setSelectedDietary((prev) =>
            prev.includes(dietary)
                ? prev.filter((d) => d !== dietary)
                : [...prev, dietary]
        );
    };

    const togglePrice = (price: string) => {
        setPricePreference((prev) =>
            prev.includes(price)
                ? prev.filter((p) => p !== price)
                : [...prev, price]
        );
    };

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const handleComplete = async () => {
        const preferences: UserPreferences = {
            favoritesCuisines: selectedCuisines,
            dietaryRestrictions: selectedDietary,
            maxDistance,
            pricePreference,
        };

        await updatePreferences(preferences);
        await completeOnboarding();
    };

    const canProceed = () => {
        switch (step) {
            case 0:
                return true; // Welcome screen
            case 1:
                return selectedCuisines.length > 0;
            case 2:
                return true; // Dietary is optional
            case 3:
                return pricePreference.length > 0;
            default:
                return false;
        }
    };

    const renderWelcome = () => (
        <View style={styles.stepContent}>
            <View style={styles.iconContainer}>
                <Ionicons name="restaurant" size={80} color="#2E7D32" />
            </View>
            <Text style={styles.stepTitle}>Welcome to TUMMI!</Text>
            <Text style={styles.stepDescription}>
                Let's personalize your experience with a few quick questions.
                This will help us recommend the perfect restaurants for you.
            </Text>
            <View style={styles.featureList}>
                <View style={styles.featureItem}>
                    <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#2E7D32"
                    />
                    <Text style={styles.featureText}>
                        Personalized recommendations
                    </Text>
                </View>
                <View style={styles.featureItem}>
                    <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#2E7D32"
                    />
                    <Text style={styles.featureText}>Save your favorites</Text>
                </View>
                <View style={styles.featureItem}>
                    <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#2E7D32"
                    />
                    <Text style={styles.featureText}>
                        Discover nearby restaurants
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderCuisines = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What cuisines do you love?</Text>
            <Text style={styles.stepDescription}>
                Select all that apply. We'll use this to personalize your
                recommendations.
            </Text>
            <ScrollView
                style={styles.optionsScroll}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.optionsGrid}>
                    {cuisineOptions.map((cuisine) => (
                        <TouchableOpacity
                            key={cuisine}
                            style={[
                                styles.optionChip,
                                selectedCuisines.includes(cuisine) &&
                                    styles.optionChipSelected,
                            ]}
                            onPress={() => toggleCuisine(cuisine)}
                        >
                            <Text
                                style={[
                                    styles.optionChipText,
                                    selectedCuisines.includes(cuisine) &&
                                        styles.optionChipTextSelected,
                                ]}
                            >
                                {cuisine}
                            </Text>
                            {selectedCuisines.includes(cuisine) && (
                                <Ionicons
                                    name="checkmark-circle"
                                    size={18}
                                    color="#fff"
                                    style={styles.checkIcon}
                                />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
            {selectedCuisines.length > 0 && (
                <Text style={styles.selectionCount}>
                    {selectedCuisines.length} cuisine
                    {selectedCuisines.length !== 1 ? "s" : ""} selected
                </Text>
            )}
        </View>
    );

    const renderDietary = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Any dietary restrictions?</Text>
            <Text style={styles.stepDescription}>
                This helps us filter restaurants that match your needs. Skip if
                none apply.
            </Text>
            <ScrollView
                style={styles.optionsScroll}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.optionsGrid}>
                    {dietaryOptions.map((dietary) => (
                        <TouchableOpacity
                            key={dietary}
                            style={[
                                styles.optionChip,
                                selectedDietary.includes(dietary) &&
                                    styles.optionChipSelected,
                            ]}
                            onPress={() => toggleDietary(dietary)}
                        >
                            <Text
                                style={[
                                    styles.optionChipText,
                                    selectedDietary.includes(dietary) &&
                                        styles.optionChipTextSelected,
                                ]}
                            >
                                {dietary}
                            </Text>
                            {selectedDietary.includes(dietary) && (
                                <Ionicons
                                    name="checkmark-circle"
                                    size={18}
                                    color="#fff"
                                    style={styles.checkIcon}
                                />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
            {selectedDietary.length > 0 && (
                <Text style={styles.selectionCount}>
                    {selectedDietary.length} restriction
                    {selectedDietary.length !== 1 ? "s" : ""} selected
                </Text>
            )}
        </View>
    );

    const renderPreferences = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Almost done!</Text>
            <Text style={styles.stepDescription}>
                Set your preferences for distance and price range.
            </Text>

            <View style={styles.preferenceSection}>
                <Text style={styles.preferenceLabel}>Maximum Distance</Text>
                <View style={styles.distanceContainer}>
                    <TouchableOpacity
                        style={styles.distanceButton}
                        onPress={() =>
                            setMaxDistance(Math.max(1, maxDistance - 1))
                        }
                    >
                        <Ionicons name="remove" size={24} color="#2E7D32" />
                    </TouchableOpacity>
                    <View style={styles.distanceDisplay}>
                        <Text style={styles.distanceValue}>{maxDistance}</Text>
                        <Text style={styles.distanceUnit}>miles</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.distanceButton}
                        onPress={() =>
                            setMaxDistance(Math.min(50, maxDistance + 1))
                        }
                    >
                        <Ionicons name="add" size={24} color="#2E7D32" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.preferenceSection}>
                <Text style={styles.preferenceLabel}>Price Range</Text>
                <View style={styles.priceContainer}>
                    {["$", "$$", "$$$", "$$$$"].map((price) => (
                        <TouchableOpacity
                            key={price}
                            style={[
                                styles.priceChip,
                                pricePreference.includes(price) &&
                                    styles.priceChipSelected,
                            ]}
                            onPress={() => togglePrice(price)}
                        >
                            <Text
                                style={[
                                    styles.priceText,
                                    pricePreference.includes(price) &&
                                        styles.priceTextSelected,
                                ]}
                            >
                                {price}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );

    const renderStep = () => {
        switch (step) {
            case 0:
                return renderWelcome();
            case 1:
                return renderCuisines();
            case 2:
                return renderDietary();
            case 3:
                return renderPreferences();
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <View style={styles.header}>
                <View style={styles.progressContainer}>
                    {[0, 1, 2, 3].map((i) => (
                        <View
                            key={i}
                            style={[
                                styles.progressDot,
                                i <= step && styles.progressDotActive,
                            ]}
                        />
                    ))}
                </View>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
            >
                {renderStep()}
            </ScrollView>

            <View style={styles.footer}>
                {step > 0 && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBack}
                    >
                        <Ionicons name="arrow-back" size={20} color="#666" />
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[
                        styles.nextButton,
                        !canProceed() && styles.nextButtonDisabled,
                        step === 0 && styles.nextButtonFull,
                    ]}
                    onPress={step === 3 ? handleComplete : handleNext}
                    disabled={!canProceed()}
                >
                    <Text style={styles.nextButtonText}>
                        {step === 3
                            ? "Get Started"
                            : step === 0
                            ? "Let's Go!"
                            : "Next"}
                    </Text>
                    {step !== 3 && (
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    header: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    progressContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#e0e0e0",
    },
    progressDotActive: {
        backgroundColor: "#2E7D32",
        width: 24,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 24,
    },
    stepContent: {
        flex: 1,
    },
    iconContainer: {
        alignItems: "center",
        marginVertical: 32,
    },
    stepTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 12,
        textAlign: "center",
    },
    stepDescription: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 32,
    },
    featureList: {
        gap: 16,
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    featureText: {
        fontSize: 16,
        color: "#1a1a1a",
        fontWeight: "500",
    },
    optionsScroll: {
        flex: 1,
    },
    optionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    optionChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 24,
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#e0e0e0",
    },
    optionChipSelected: {
        backgroundColor: "#2E7D32",
        borderColor: "#2E7D32",
    },
    optionChipText: {
        fontSize: 15,
        color: "#1a1a1a",
        fontWeight: "600",
    },
    optionChipTextSelected: {
        color: "#fff",
    },
    checkIcon: {
        marginLeft: 6,
    },
    selectionCount: {
        fontSize: 14,
        color: "#2E7D32",
        fontWeight: "600",
        textAlign: "center",
        marginTop: 16,
    },
    preferenceSection: {
        marginBottom: 32,
    },
    preferenceLabel: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 16,
    },
    distanceContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
    },
    distanceButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#E8F5E9",
        alignItems: "center",
        justifyContent: "center",
    },
    distanceDisplay: {
        alignItems: "center",
    },
    distanceValue: {
        fontSize: 48,
        fontWeight: "700",
        color: "#2E7D32",
    },
    distanceUnit: {
        fontSize: 16,
        color: "#666",
        fontWeight: "600",
    },
    priceContainer: {
        flexDirection: "row",
        gap: 12,
    },
    priceChip: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: "#fff",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#e0e0e0",
    },
    priceChipSelected: {
        backgroundColor: "#2E7D32",
        borderColor: "#2E7D32",
    },
    priceText: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1a1a1a",
    },
    priceTextSelected: {
        color: "#fff",
    },
    footer: {
        flexDirection: "row",
        paddingHorizontal: 24,
        paddingVertical: 16,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
        backgroundColor: "#fff",
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: "#f5f5f5",
        gap: 8,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
    },
    nextButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: "#2E7D32",
        gap: 8,
    },
    nextButtonFull: {
        flex: 1,
    },
    nextButtonDisabled: {
        backgroundColor: "#ccc",
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },
});
