import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FinanceHeader from "../../../components/commonComponents/FinanceHeader";
import { useFinanceNavigation } from "../../../navigations/AdminNavigationContext";
import { getObjByKey } from "../../../utils/Storage";
import { buildUrl, GETNETWORK, extractApiData, isApiSuccess } from "../../../utils/Network";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { WHITE, BRANDCOLOR } from "../../../constant/color";

const SCREEN_BG = "#F3F4F6";
const CARD_BG = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const PRIMARY_BLUE = "#2563EB";
const RED = "#DC2626";

const PROFILE_DATA = {
    name: "",
    role: "",
    userId: "",
    email: "",
    phone: "",
    department: "",
    joinedOn: "",
};

const ProfileField = ({ label, value }) => (
    <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value}</Text>
    </View>
);

const ProductionProfileScreen = () => {
    const navigation = useFinanceNavigation();
    const [profile, setProfile] = useState(PROFILE_DATA);
    const [loading, setLoading] = useState(true);

    const loadProfile = useCallback(async () => {
        setLoading(true);
        const stored = await getObjByKey("loginResponse");
        const res = await GETNETWORK(buildUrl("auth/profile"), true);
        const data = isApiSuccess(res) ? extractApiData(res) : stored?.user || stored;
        const name = data?.name || data?.full_name || stored?.name || "";
        const initials = name ? name.charAt(0).toUpperCase() : "P";
        setProfile({
            name,
            role: data?.role?.role_name || stored?.apiRole || stored?.role || "Finance",
            userId: String(data?.id ?? stored?.userId ?? ""),
            email: data?.email || stored?.email || "",
            phone: data?.phone || data?.mobile || "—",
            department: data?.department || "Production Management",
            joinedOn: data?.created_at?.slice?.(0, 10) || "—",
            initials,
        });
        setLoading(false);
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            { text: "Logout", style: "destructive", onPress: () => navigation.onLogout?.() },
        ]);
    };

    return (
        <View style={styles.root}>
            <FinanceHeader
                title="Profile"
                profileInitial={profile.initials || "P"}
                onProfilePress={navigation.openDrawer}
            />

            <SafeAreaView style={styles.safeArea} edges={[]}>
                {loading ? (
                    <View style={styles.loaderWrap}>
                        <ActivityIndicator size="large" color={BRANDCOLOR} />
                    </View>
                ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.avatarCard}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {(profile.name || "P").charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <Text style={styles.name}>{profile.name || "—"}</Text>
                        <Text style={styles.role}>{profile.role}</Text>
                    </View>

                    <View style={styles.detailsCard}>
                        <Text style={styles.sectionTitle}>Profile Details</Text>
                        <ProfileField label="User ID" value={profile.userId || "—"} />
                        <ProfileField label="Email" value={profile.email || "—"} />
                        <ProfileField label="Phone" value={profile.phone} />
                        <ProfileField label="Department" value={profile.department} />
                        <ProfileField label="Joined On" value={profile.joinedOn} />
                    </View>

                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </ScrollView>
                )}
            </SafeAreaView>
        </View>
    );
};

export default ProductionProfileScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: SCREEN_BG },
    loaderWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
    safeArea: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 32 },
    avatarCard: {
        backgroundColor: CARD_BG,
        borderRadius: 16,
        paddingVertical: 28,
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
    avatarText: { color: WHITE, fontFamily: UBUNTUBOLD, fontSize: 32 },
    name: { fontFamily: UBUNTUBOLD, fontSize: 22, color: TEXT_DARK, marginBottom: 4 },
    role: { fontFamily: FIRASANS, fontSize: 14, color: TEXT_MUTED },
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
    },
    fieldValue: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: TEXT_DARK },
    logoutButton: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#FECACA",
    },
    logoutText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 16, color: RED },
});
