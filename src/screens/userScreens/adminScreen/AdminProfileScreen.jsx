import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MyHeader } from "../../../components/commonComponents/MyHeader";
import { useNavigation } from "../../../navigations/AdminNavigationContext";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { WHITE } from "../../../constant/color";

const SCREEN_BG = "#F3F4F6";
const CARD_BG = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const PRIMARY_BLUE = "#2563EB";
const RED = "#DC2626";

const PROFILE_DATA = {
    name: "Rajesh",
    role: "Admin",
    userId: "ADM-001",
    email: "rajesh@yubispices.com",
    phone: "+91 98765 43210",
    department: "Administration",
    joinedOn: "12 Jan 2024",
};

const ProfileField = ({ label, value }) => (
    <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value}</Text>
    </View>
);

const AdminProfileScreen = () => {
    const navigation = useNavigation();

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            { text: "Logout", style: "destructive", onPress: () => navigation.onLogout?.() },
        ]);
    };

    return (
        <View style={styles.root}>
            <MyHeader showCenterTitle title="Profile" backgroundColor={WHITE} />

            <SafeAreaView style={styles.safeArea} edges={[]}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.avatarCard}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {PROFILE_DATA.name.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <Text style={styles.name}>{PROFILE_DATA.name}</Text>
                        <Text style={styles.role}>{PROFILE_DATA.role}</Text>
                    </View>

                    <View style={styles.detailsCard}>
                        <Text style={styles.sectionTitle}>Profile Details</Text>
                        <ProfileField label="User ID" value={PROFILE_DATA.userId} />
                        <ProfileField label="Email" value={PROFILE_DATA.email} />
                        <ProfileField label="Phone" value={PROFILE_DATA.phone} />
                        <ProfileField label="Department" value={PROFILE_DATA.department} />
                        <ProfileField label="Joined On" value={PROFILE_DATA.joinedOn} />
                    </View>

                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default AdminProfileScreen;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: SCREEN_BG,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    avatarCard: {
        backgroundColor: CARD_BG,
        borderRadius: 16,
        paddingVertical: 28,
        paddingHorizontal: 16,
        alignItems: "center",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: PRIMARY_BLUE,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    avatarText: {
        color: WHITE,
        fontFamily: UBUNTUBOLD,
        fontSize: 32,
    },
    name: {
        fontFamily: UBUNTUBOLD,
        fontSize: 22,
        color: TEXT_DARK,
        marginBottom: 4,
    },
    role: {
        fontFamily: FIRASANS,
        fontSize: 14,
        color: TEXT_MUTED,
    },
    detailsCard: {
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    sectionTitle: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 16,
        color: TEXT_DARK,
        marginBottom: 16,
    },
    fieldRow: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    fieldLabel: {
        fontFamily: FIRASANS,
        fontSize: 12,
        color: TEXT_MUTED,
        marginBottom: 4,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    fieldValue: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 15,
        color: TEXT_DARK,
    },
    logoutButton: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#FECACA",
    },
    logoutText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 16,
        color: RED,
    },
});
