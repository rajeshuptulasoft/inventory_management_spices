import React from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LOGO } from "../../constant/imagePath";
import { UBUNTUBOLD } from "../../constant/fontPath";

const CARD_BG = "#FFFFFF";
const PRIMARY_BLUE = "#2563EB";
const RED = "#DC2626";

const Header = ({
    title = "",
    profileInitial = "A",
    onProfilePress = () => {},
    onNotificationPress = () => {},
    showNotificationDot = true,
}) => {
    if (title) {
        return (
            <>
                <StatusBar
                    backgroundColor={CARD_BG}
                    barStyle="dark-content"
                    translucent={Platform.OS === "android"}
                />

                <SafeAreaView edges={["top"]} style={styles.safeArea}>
                    <View style={styles.header}>
                        <View style={styles.sideSlot} />

                        <View style={styles.centerSlot}>
                            <Text style={styles.titleText}>{title}</Text>
                        </View>

                        <View style={styles.sideSlot} />
                    </View>
                </SafeAreaView>
            </>
        );
    }

    return (
        <>
            <StatusBar
                backgroundColor={CARD_BG}
                barStyle="dark-content"
                translucent={Platform.OS === "android"}
            />

            <SafeAreaView edges={["top"]} style={styles.safeArea}>
                <View style={styles.header}>
                    <View style={styles.sideSlot}>
                        <TouchableOpacity
                            style={styles.avatar}
                            onPress={onProfilePress}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.avatarText}>{profileInitial}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.centerSlot}>
                        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
                    </View>

                    <View style={[styles.sideSlot, styles.rightSlot]}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={onNotificationPress}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.bellIcon}>🔔</Text>
                            {showNotificationDot ? <View style={styles.notificationDot} /> : null}
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </>
    );
};

export default Header;

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: CARD_BG,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: CARD_BG,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    sideSlot: {
        width: 44,
        justifyContent: "center",
    },
    rightSlot: {
        alignItems: "flex-end",
    },
    centerSlot: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    logo: {
        width: 130,
        height: 36,
    },
    titleText: {
        fontSize: 18,
        fontFamily: UBUNTUBOLD,
        color: "#111827",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: PRIMARY_BLUE,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: CARD_BG,
        fontFamily: UBUNTUBOLD,
        fontSize: 15,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
    },
    bellIcon: {
        fontSize: 18,
    },
    notificationDot: {
        position: "absolute",
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: RED,
        borderWidth: 1.5,
        borderColor: CARD_BG,
    },
});
