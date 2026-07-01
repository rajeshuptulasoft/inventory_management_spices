import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    RefreshControl,
    BackHandler,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MyHeader } from "../../../components/commonComponents/MyHeader";
import { useFinanceNavigation } from "../../../navigations/AdminNavigationContext";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR, WHITE } from "../../../constant/color";
import {
    buildUrl,
    GETNETWORK,
    extractApiList,
    isApiSuccess,
    capitalizeStatus,
    logScreenApi,
} from "../../../utils/Network";

const SCREEN_NAME = "AdminRoleAuditScreen";

const SCREEN_BG = "#F3F4F6";
const CARD_BG = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const TEXT_LIGHT = "#9CA3AF";
const BORDER_COLOR = "#E5E7EB";
const GREEN = "#16A34A";
const PRIMARY_BLUE = "#2563EB";

const mapAuditRow = (row, index = 0) => ({
    id: String(row.id ?? `audit-${index}`),
    user: row.user_name || row.user || row.name || "—",
    role: row.role_name || row.role?.role_name || row.role || "—",
    menus: row.menus || row.menu_count || row.assigned_menus || "—",
    permissions: String(row.permissions ?? row.permission_count ?? row.permissions_count ?? 0),
    status: capitalizeStatus(row.status || "active"),
    changedAt: row.updated_at?.slice?.(0, 10) || row.changed_at?.slice?.(0, 10) || "—",
});

const AuditCard = ({ item }) => (
    <View style={styles.card}>
        <View style={styles.cardTop}>
            <Text style={styles.userName}>{item.user}</Text>
            <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{item.status}</Text>
            </View>
        </View>
        <View style={styles.metaRow}>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>ROLE</Text>
                <Text style={styles.roleLink}>{item.role}</Text>
            </View>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>MENUS</Text>
                <Text style={styles.metaValue}>{item.menus}</Text>
            </View>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>PERMISSIONS</Text>
                <Text style={styles.metaValue}>{item.permissions}</Text>
            </View>
        </View>
        <Text style={styles.changedAt}>Last updated: {item.changedAt}</Text>
    </View>
);

const AdminRoleAuditScreen = () => {
    const navigation = useFinanceNavigation();
    const [rows, setRows] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    const fetchAudit = useCallback(async () => {
        try {
            const res = await GETNETWORK(buildUrl("admin/role-audit"), true);
            logScreenApi(SCREEN_NAME, "admin/role-audit", res, buildUrl("admin/role-audit"));
            if (isApiSuccess(res)) {
                setRows(extractApiList(res).map(mapAuditRow));
            }
        } finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchAudit();
    }, [fetchAudit]);

    useEffect(() => {
        if (Platform.OS !== "android") return undefined;
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            navigation.goBack();
            return true;
        });
        return () => sub.remove();
    }, [navigation]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter(
            (item) =>
                item.user.toLowerCase().includes(q) ||
                item.role.toLowerCase().includes(q) ||
                item.status.toLowerCase().includes(q)
        );
    }, [rows, search]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchAudit();
    }, [fetchAudit]);

    const listHeader = (
        <View>
            <Text style={styles.pageTitle}>Role & Permission Audit</Text>
            <Text style={styles.pageSubtitle}>
                Review role assignments, menu access, and permission grants
            </Text>
            <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>TOTAL RECORDS</Text>
                <Text style={styles.summaryValue}>{rows.length}</Text>
                <Text style={styles.summaryFooter}>→ From admin role audit</Text>
            </View>
            <View style={styles.searchBox}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search user or role..."
                    placeholderTextColor={TEXT_LIGHT}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>
        </View>
    );

    return (
        <View style={styles.root}>
            <MyHeader
                showBack
                showCenterTitle
                title="Role Audit"
                backgroundColor={WHITE}
                onBackPress={handleBack}
            />
            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <AuditCard item={item} />}
                    ListHeaderComponent={listHeader}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[BRANDCOLOR]}
                            tintColor={BRANDCOLOR}
                        />
                    }
                    ListFooterComponent={
                        <Text style={styles.footerText}>
                            SpiceCraft ERP v3.0 • Logged in as Administrator (Super Admin)
                        </Text>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <Text style={styles.emptyText}>No audit records found</Text>
                        </View>
                    }
                />
            </SafeAreaView>
        </View>
    );
};

export default AdminRoleAuditScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: SCREEN_BG },
    safeArea: { flex: 1 },
    listContent: { padding: 16, paddingBottom: 24 },
    pageTitle: { fontFamily: UBUNTUBOLD, fontSize: 22, color: TEXT_DARK, marginBottom: 6 },
    pageSubtitle: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_MUTED, lineHeight: 18, marginBottom: 14 },
    summaryCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        marginBottom: 12,
        maxWidth: 200,
    },
    summaryLabel: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 10,
        color: TEXT_MUTED,
        letterSpacing: 0.3,
        marginBottom: 4,
    },
    summaryValue: { fontFamily: UBUNTUBOLD, fontSize: 28, color: TEXT_DARK, marginBottom: 4 },
    summaryFooter: { fontFamily: FIRASANS, fontSize: 11, color: TEXT_LIGHT },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: CARD_BG,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    searchIcon: { fontSize: 14, marginRight: 8 },
    searchInput: {
        flex: 1,
        paddingVertical: 11,
        fontFamily: FIRASANS,
        fontSize: 14,
        color: TEXT_DARK,
    },
    card: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    cardTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    userName: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: TEXT_DARK, flex: 1, paddingRight: 8 },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ECFDF5",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN },
    statusText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 11, color: GREEN },
    metaRow: { flexDirection: "row", gap: 8 },
    metaCol: { flex: 1 },
    fieldLabel: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 9,
        color: TEXT_MUTED,
        letterSpacing: 0.4,
        marginBottom: 4,
    },
    roleLink: { fontFamily: FIRASANSSEMIBOLD, fontSize: 13, color: PRIMARY_BLUE },
    metaValue: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_DARK },
    changedAt: { fontFamily: FIRASANS, fontSize: 11, color: TEXT_LIGHT, marginTop: 10 },
    emptyWrap: { alignItems: "center", paddingVertical: 48 },
    emptyText: { fontFamily: FIRASANS, fontSize: 14, color: TEXT_MUTED },
    footerText: {
        fontFamily: FIRASANS,
        fontSize: 11,
        color: TEXT_LIGHT,
        textAlign: "center",
        marginTop: 12,
        lineHeight: 16,
    },
});
