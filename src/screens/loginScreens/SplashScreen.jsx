import React, { useEffect, useRef } from "react";
import {
    Animated,
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { LOGO } from "../../constant/imagePath";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../constant/fontPath";
import { WHITE } from "../../constant/color";
import { ensureDeviceLocationEnabled } from "../../utils/AppPermissions";
import { getToken, getTokenByKey, AUTH_ROLE_KEY, getLoginSession } from "../../utils/RoleStorage";
import { checkuserToken } from "../../redux/actions/auth";

const BRAND_GREEN = "#05A845";
const SPLASH_DURATION_MS = 3200;

const SplashScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const progress = useRef(new Animated.Value(0)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(contentOpacity, {
                toValue: 1,
                duration: 800,
                delay: 200,
                useNativeDriver: true,
            }),
            Animated.timing(progress, {
                toValue: 0.72,
                duration: 2800,
                useNativeDriver: false,
            }),
        ]).start();

        let mounted = true;

        const boot = async () => {
            const splashStart = Date.now();

            if (Platform.OS === "android") {
                await ensureDeviceLocationEnabled();
            }

            let nextRoute = "Login";
            const storedRole = await getTokenByKey(AUTH_ROLE_KEY);
            const session = await getLoginSession();
            const storedToken = (await getToken(storedRole || session?.role)) || session?.token;

            if (storedToken && (storedRole || session?.role)) {
                const isValid = await dispatch(checkuserToken());
                if (mounted && isValid) {
                    nextRoute = "Main";
                }
            }

            const elapsed = Date.now() - splashStart;
            const remaining = Math.max(0, SPLASH_DURATION_MS - elapsed);

            setTimeout(() => {
                if (mounted) {
                    navigation.replace(nextRoute);
                }
            }, remaining);
        };

        boot();

        return () => {
            mounted = false;
        };
    }, [dispatch, navigation, progress, logoOpacity, contentOpacity]);

    const progressWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
    });

    const Container = Platform.OS === "ios" ? SafeAreaView : View;

    return (
        <Container style={styles.container}>
            <StatusBar backgroundColor={BRAND_GREEN} barStyle="light-content" />

            <View style={styles.centerContent}>
                <Animated.View style={[styles.logoWrap, { opacity: logoOpacity }]}>
                    <Image source={LOGO} style={styles.logo} resizeMode="contain" />
                </Animated.View>

                <Animated.View style={[styles.brandBlock, { opacity: contentOpacity }]}>
                    <Text style={styles.brandName}>Yubi Spices</Text>
                    <Text style={styles.brandTagline}>GLOBAL SUPPLY CHAIN ENGINE</Text>
                </Animated.View>
            </View>

            <Animated.View style={[styles.bottomBlock, { opacity: contentOpacity }]}>
                <View style={styles.progressTrack}>
                    <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
                </View>
                <Text style={styles.loadingText}>INITIALIZING SYSTEMS</Text>
                <Text style={styles.versionText}>v4.8.2 | Enterprise Integrated</Text>
            </Animated.View>
        </Container>
    );
};

export default SplashScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BRAND_GREEN,
        justifyContent: "space-between",
    },
    centerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    logoWrap: {
        width: 120,
        height: 120,
        borderRadius: 28,
        backgroundColor: "rgba(255,255,255,0.18)",
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.35)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 28,
        padding: 16,
    },
    logo: {
        width: 72,
        height: 72,
    },
    brandBlock: {
        alignItems: "center",
    },
    brandName: {
        fontFamily: UBUNTUBOLD,
        fontSize: 32,
        color: WHITE,
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    brandTagline: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 11,
        color: "rgba(255,255,255,0.85)",
        letterSpacing: 2.4,
        textAlign: "center",
    },
    bottomBlock: {
        paddingHorizontal: 40,
        paddingBottom: 36,
        alignItems: "center",
    },
    progressTrack: {
        width: "100%",
        height: 3,
        borderRadius: 2,
        backgroundColor: "rgba(255,255,255,0.25)",
        overflow: "hidden",
        marginBottom: 14,
    },
    progressFill: {
        height: "100%",
        backgroundColor: WHITE,
        borderRadius: 2,
    },
    loadingText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 10,
        color: "rgba(255,255,255,0.9)",
        letterSpacing: 1.8,
        marginBottom: 10,
    },
    versionText: {
        fontFamily: FIRASANS,
        fontSize: 10,
        color: "rgba(255,255,255,0.65)",
    },
});
