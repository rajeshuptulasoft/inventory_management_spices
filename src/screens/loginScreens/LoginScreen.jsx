import React, { useEffect, useState } from "react";
import {
    StatusBar,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    BackHandler,
    Image,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    SafeAreaView,
    Alert,
} from "react-native";
import { useDispatch } from "react-redux";

import { BLACK, WHITE, BRANDCOLOR } from "../../constant/color";
import { UBUNTUBOLD, FIRASANS } from "../../constant/fontPath";
import { TextInputComponent } from "../../components/commonComponents/TextInputComponent";
import { USERID, PASSWORD, HIDE, VIEW, LOGO } from "../../constant/imagePath";
import { HEIGHT, WIDTH } from "../../constant/config";
import { loginUser } from "../../redux/actions/auth";
import { POSTNETWORK } from "../../utils/Network";
import { extractApiData, getApiMessage, isApiSuccess, mapApiRoleToAppRole, extractLoginPayload, resolveApiRoleName } from "../../utils/Network";
import { buildUrl } from "../../utils/Network";

const SCREEN_BG = "#F5F7FA";
const TEXT_SECONDARY = "#6B7280";
const TEXT_LIGHT = "#9CA3AF";
const BORDER_COLOR = "#E5E7EB";

const LoginScreen = () => {
    const dispatch = useDispatch();
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const passwordToggleIcon = showPassword ? VIEW : HIDE;

    useEffect(() => {
        if (Platform.OS !== "android") {
            return undefined;
        }

        const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
            BackHandler.exitApp();
            return true;
        });

        return () => subscription.remove();
    }, []);

    const handleSignIn = async () => {
        const email = userId.trim().toLowerCase();
        const pass = password.trim();

        if (!email || !pass) {
            Alert.alert("Sign In", "Please enter your User ID and password.");
            return;
        }

        try {
            setSubmitting(true);
            const res = await POSTNETWORK(buildUrl("v1/auth/login"), {
                email,
                password: pass,
            });

            if (!isApiSuccess(res)) {
                Alert.alert("Sign In", getApiMessage(res, "Invalid User ID or password."));
                return;
            }

            const payload = extractLoginPayload(res);
            const user = payload?.user || payload;
            const token = payload?.accessToken || payload?.token || user?.accessToken || user?.token;
            const refreshToken = payload?.refreshToken || user?.refreshToken;
            const apiRole = resolveApiRoleName(user);
            const role = mapApiRoleToAppRole(apiRole, email);
            const isSubAdmin = email.includes("subadmin") || user?.is_sub_admin === true;

            if (!token || !role) {
                Alert.alert(
                    "Sign In",
                    "Your account role is not supported on mobile. Contact administrator."
                );
                return;
            }

            await dispatch(
                loginUser({
                    email,
                    role,
                    apiRole,
                    name: user?.name || user?.full_name || email,
                    userId: user?.id,
                    isSubAdmin,
                    token,
                    refreshToken,
                    user,
                })
            );
        } catch {
            Alert.alert("Sign In", "Unable to connect. Please check your network and try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const Container = Platform.OS === "ios" ? SafeAreaView : View;

    return (
        <>
            <StatusBar backgroundColor={SCREEN_BG} barStyle="dark-content" />

            <Container style={{ flex: 1, backgroundColor: SCREEN_BG }}>
                <KeyboardAvoidingView
                    style={{ flex: 1, backgroundColor: SCREEN_BG }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.loginCard}>
                            <View style={styles.brandSection}>
                                <Image source={LOGO} style={styles.brandLogo} />
                                {/* <Text style={styles.welcomeText}>Welcome back, Manager</Text> */}
                            </View>

                            <Text style={styles.dashboardTitle}>Login to Dashboard</Text>
                            {/* <Text style={styles.dashboardSubtitle}>
                                Access your inventory and sales analytics
                            </Text> */}

                            <View style={styles.inputWrapper}>
                                <TextInputComponent
                                    placeholder="User ID"
                                    inputdata={userId}
                                    setInputdata={setUserId}
                                    image={USERID}
                                    borderColor={BORDER_COLOR}
                                    autoCapitalize="none"
                                    maxLength={100}
                                    width="100%"
                                />
                            </View>

                            <View style={styles.inputSpacer} />

                            <View style={styles.inputWrapper}>
                                <TextInputComponent
                                    placeholder="Enter Password"
                                    type="password"
                                    inputdata={password}
                                    setInputdata={setPassword}
                                    image={PASSWORD}
                                    borderColor={BORDER_COLOR}
                                    showPassword={showPassword}
                                    rightIcon={passwordToggleIcon}
                                    onRightPress={() => setShowPassword((prev) => !prev)}
                                    width="100%"
                                    autoCapitalize="none"
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.signInButton, submitting && styles.signInButtonDisabled]}
                                onPress={handleSignIn}
                                activeOpacity={0.9}
                                disabled={submitting}
                            >
                                <Text style={styles.signInButtonText}>
                                    {submitting ? "Signing In..." : "Sign In"}
                                </Text>
                                <Text style={styles.signInArrow}>→</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Container>
        </>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: WIDTH * 0.06,
        paddingVertical: HEIGHT * 0.04,
    },
    loginCard: {
        backgroundColor: WHITE,
        borderRadius: 30,
        paddingHorizontal: WIDTH * 0.06,
        paddingVertical: HEIGHT * 0.035,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 6,
    },
    brandSection: {
        alignItems: "center",
        marginBottom: HEIGHT * 0.022,
    },
    brandLogo: {
        width: 160,
        height: 56,
        resizeMode: "contain",
        marginBottom: 8,
    },
    welcomeText: {
        fontSize: 14,
        fontFamily: FIRASANS,
        color: TEXT_SECONDARY,
    },
    dashboardTitle: {
        fontSize: 20,
        fontFamily: UBUNTUBOLD,
        color: BLACK,
        marginBottom: 6,
        textAlign: "center",
        alignSelf: "center",
    },
    dashboardSubtitle: {
        fontSize: 13,
        fontFamily: FIRASANS,
        color: TEXT_LIGHT,
        marginBottom: HEIGHT * 0.022,
        lineHeight: 18,
        textAlign: "center",
        alignSelf: "center",
    },
    inputWrapper: {
        width: "100%",
    },
    inputSpacer: {
        height: 14,
    },
    signInButton: {
        width: "100%",
        backgroundColor: BRANDCOLOR,
        borderRadius: 14,
        paddingVertical: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: HEIGHT * 0.022,
        shadowColor: BRANDCOLOR,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 5,
    },
    signInButtonDisabled: {
        opacity: 0.7,
    },
    signInButtonText: {
        fontSize: 16,
        fontFamily: UBUNTUBOLD,
        color: WHITE,
        marginRight: 8,
    },
    signInArrow: {
        fontSize: 18,
        color: WHITE,
        fontFamily: UBUNTUBOLD,
    },
});
