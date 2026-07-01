import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LOGOUT, LOGO } from "../constant/imagePath";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../constant/fontPath";

const CustomDrawerNavigation = ({
    drawerItems = [],
    userName = "",
    userRole = "",
    onNavigate,
    onLogout,
    onClose,
}) => {
    const handleLogoutPress = () => {
        onClose?.();
        onLogout?.();
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
            <View style={styles.container}>
                <View style={styles.profileSection}>
                    <Image source={LOGO} style={styles.logo} resizeMode="contain" />
                    <Text style={styles.userName}>{userName}</Text>
                    <Text style={styles.userRole}>{userRole}</Text>
                </View>

                <ScrollView
                    style={styles.menuScroll}
                    contentContainerStyle={styles.menuContent}
                    showsVerticalScrollIndicator={false}
                >
                    {drawerItems.map((item, index) => {
                        const showSubAdminHeader =
                            item.isSubAdminItem &&
                            (index === 0 || !drawerItems[index - 1]?.isSubAdminItem);

                        return (
                            <React.Fragment key={item.key}>
                                {showSubAdminHeader ? (
                                    <View style={styles.subAdminHeader}>
                                        <Text style={styles.subAdminHeaderText}>Sub Admin Access</Text>
                                    </View>
                                ) : null}
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    activeOpacity={0.85}
                                    onPress={() => onNavigate?.(item.key)}
                                >
                                    <View style={styles.menuIconWrap}>
                                        <Text style={styles.menuIcon}>{item.icon}</Text>
                                    </View>
                                    <Text style={styles.menuLabel}>{item.label}</Text>
                                </TouchableOpacity>
                            </React.Fragment>
                        );
                    })}
                </ScrollView>

                <TouchableOpacity
                    style={styles.logoutButton}
                    activeOpacity={0.85}
                    onPress={handleLogoutPress}
                >
                    <View style={styles.menuIconWrap}>
                        <Image source={LOGOUT} style={styles.logoutIcon} resizeMode="contain" />
                    </View>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default CustomDrawerNavigation;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    profileSection: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        alignItems: "flex-start",
    },
    logo: {
        width: 120,
        height: 36,
        marginBottom: 16,
    },
    userName: {
        fontFamily: UBUNTUBOLD,
        fontSize: 18,
        color: "#111827",
        marginBottom: 4,
    },
    userRole: {
        fontFamily: FIRASANS,
        fontSize: 13,
        color: "#6B7280",
    },
    menuScroll: {
        flex: 1,
    },
    menuContent: {
        paddingVertical: 8,
    },
    subAdminHeader: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 6,
    },
    subAdminHeaderText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 11,
        color: "#2563EB",
        letterSpacing: 0.4,
        textTransform: "uppercase",
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    menuIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
    },
    menuIcon: {
        fontSize: 18,
    },
    menuLabel: {
        flex: 1,
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 15,
        color: "#111827",
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 18,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        gap: 12,
    },
    logoutIcon: {
        width: 20,
        height: 20,
        tintColor: "#DC2626",
    },
    logoutText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 16,
        color: "#DC2626",
    },
});
