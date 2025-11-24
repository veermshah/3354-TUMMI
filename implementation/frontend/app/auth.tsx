import React, { useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthScreen() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();

    const handleEmailAuth = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (isSignUp && password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            if (isSignUp) {
                const { error } = await signUpWithEmail(email, password);
                if (error) {
                    Alert.alert("Sign Up Failed", error.message);
                } else {
                    Alert.alert(
                        "Success",
                        "Account created! Please check your email to verify your account."
                    );
                }
            } else {
                const { error } = await signInWithEmail(email, password);
                if (error) {
                    Alert.alert("Sign In Failed", error.message);
                }
            }
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error: any) {
            Alert.alert("Google Sign In Failed", error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Ionicons
                                name="restaurant"
                                size={64}
                                color="#2E7D32"
                            />
                        </View>
                        <Text style={styles.title}>TUMMI</Text>
                        <Text style={styles.subtitle}>
                            Discover your next favorite restaurant
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.formTitle}>
                            {isSignUp ? "Create Account" : "Welcome Back"}
                        </Text>

                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="mail-outline"
                                size={20}
                                color="#666"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                color="#666"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoComplete="password"
                                placeholderTextColor="#999"
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.passwordToggle}
                            >
                                <Ionicons
                                    name={
                                        showPassword
                                            ? "eye-off-outline"
                                            : "eye-outline"
                                    }
                                    size={20}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>

                        {isSignUp && (
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color="#666"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        )}

                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                loading && styles.buttonDisabled,
                            ]}
                            onPress={handleEmailAuth}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.primaryButtonText}>
                                    {isSignUp ? "Sign Up" : "Sign In"}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity
                            style={styles.googleButton}
                            onPress={handleGoogleSignIn}
                            disabled={loading}
                        >
                            <Ionicons
                                name="logo-google"
                                size={20}
                                color="#DB4437"
                            />
                            <Text style={styles.googleButtonText}>
                                Continue with Google
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.switchButton}
                            onPress={() => {
                                setIsSignUp(!isSignUp);
                                setConfirmPassword("");
                            }}
                        >
                            <Text style={styles.switchButtonText}>
                                {isSignUp
                                    ? "Already have an account? "
                                    : "Don't have an account? "}
                                <Text style={styles.switchButtonTextBold}>
                                    {isSignUp ? "Sign In" : "Sign Up"}
                                </Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
    },
    header: {
        alignItems: "center",
        marginBottom: 48,
    },
    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#E8F5E9",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 36,
        fontWeight: "800",
        color: "#2E7D32",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
    },
    form: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 24,
        textAlign: "center",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: "#1a1a1a",
    },
    passwordToggle: {
        padding: 4,
    },
    primaryButton: {
        backgroundColor: "#2E7D32",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    primaryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#e0e0e0",
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        color: "#999",
        fontWeight: "600",
    },
    googleButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        gap: 12,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1a1a1a",
    },
    switchButton: {
        marginTop: 24,
        alignItems: "center",
    },
    switchButtonText: {
        fontSize: 14,
        color: "#666",
    },
    switchButtonTextBold: {
        fontWeight: "700",
        color: "#2E7D32",
    },
});
