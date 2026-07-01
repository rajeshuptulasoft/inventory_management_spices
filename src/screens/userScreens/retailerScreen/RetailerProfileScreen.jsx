import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FinanceHeader from "../../../components/commonComponents/FinanceHeader";
import { useFinanceNavigation } from "../../../navigations/AdminNavigationContext";
import { getObjByKey } from "../../../utils/Storage";
import { buildUrl, GETNETWORK, extractApiData, isApiSuccess, logScreenApi } from "../../../utils/Network";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { WHITE, BRANDCOLOR } from "../../../constant/color";

const ProfileField = ({ label, value }) => (
    <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value}</Text>
    </View>
);

const RetailerProfileScreen = () => {
    const navigation = useFinanceNavigation();
    const [profile, setProfile] = useState({
        name: "",
        role: "",
        userId: "",
        email: "",
        phone: "",
        department: "Trade Channel",
        joinedOn: "",
        initials: "R",
    });
    const [loading, setLoading] = useState(true);

    const loadProfile = useCallback(async () => {
        setLoading(true);
        const stored = await getObjByKey("loginResponse");
        const res = await GETNETWORK(buildUrl("auth/profile"), true);
        logScreenApi("RetailerProfileScreen", "auth/profile", res, buildUrl("auth/profile"));
        const data = isApiSuccess(res) ? extractApiData(res) : stored?.user || stored;
        const name = data?.name || data?.full_name || stored?.name || "";
        setProfile({
            name,
            role: data?.role?.role_name || stored?.apiRole || stored?.role || "Retailer",
            userId: String(data?.id ?? stored?.userId ?? ""),
            email: data?.email || stored?.email || "",
            phone: data?.phone || data?.mobile || "—",
            department: data?.department || "Trade Channel",
            joinedOn: data?.created_at?.slice?.(0, 10) || "—",
            initials: name ? name.charAt(0).toUpperCase() : "R",
        });
        setLoading(false);
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    return (
        <View style={styles.root}>
            <FinanceHeader title="Profile" profileInitial={profile.initials} onProfilePress={navigation.openDrawer} />
            <SafeAreaView style={styles.safeArea} edges={[]}>
                {loading ? (
                    <View style={styles.loaderWrap}>
                        <ActivityIndicator size="large" color={BRANDCOLOR} />
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.avatarCard}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{profile.initials}</Text>
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
                        <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.onLogout?.()} activeOpacity={0.85}>
                            <Text style={styles.logoutText}>Logout</Text>
                        </TouchableOpacity>
                    </ScrollView>
                )}
            </SafeAreaView>
        </View>
    );
};

export default RetailerProfileScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    loaderWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
    safeArea: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 32 },
    avatarCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 24, alignItems: "center", marginBottom: 16, borderWidth: 1, borderColor: "#E5E7EB" },
    avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center", marginBottom: 12 },
    avatarText: { color: WHITE, fontFamily: UBUNTUBOLD, fontSize: 28 },
    name: { fontFamily: UBUNTUBOLD, fontSize: 22, color: "#111827", marginBottom: 4 },
    role: { fontFamily: FIRASANS, fontSize: 14, color: "#6B7280" },
    detailsCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: "#E5E7EB" },
    sectionTitle: { fontFamily: FIRASANSSEMIBOLD, fontSize: 16, color: "#111827", marginBottom: 16 },
    fieldRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
    fieldLabel: { fontFamily: FIRASANS, fontSize: 12, color: "#6B7280", marginBottom: 4, textTransform: "uppercase" },
    fieldValue: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: "#111827" },
    logoutButton: { backgroundColor: "#FFFFFF", borderRadius: 12, paddingVertical: 16, alignItems: "center", borderWidth: 1, borderColor: "#FECACA" },
    logoutText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 16, color: "#DC2626" },
});
