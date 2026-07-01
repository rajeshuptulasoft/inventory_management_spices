import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    RefreshControl,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FinanceHeader from "../../../components/commonComponents/FinanceHeader";
import { useFinanceNavigation } from "../../../navigations/AdminNavigationContext";
import { getObjByKey } from "../../../utils/Storage";
import {
    buildUrl,
    GETNETWORK,
    extractApiList,
    isApiSuccess,
    logScreenApi,
} from "../../../utils/Network";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR } from "../../../constant/color";

const SCREEN_BG = "#F3F4F6";
const CARD_BG = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const TEXT_LIGHT = "#9CA3AF";
const BORDER_COLOR = "#E5E7EB";
const PRIMARY_BLUE = "#2563EB";
const GREEN = "#16A34A";
const AMBER = "#D97706";

const mapNotificationToTrail = (row) => {
    const name = row.user_name || row.title || "System";
    const parts = name.split(" ").filter(Boolean);
    const initials =
        parts.length >= 2
            ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
            : name.slice(0, 2).toUpperCase();
    return {
        id: String(row.id),
        time: row.created_at
            ? new Date(row.created_at).toLocaleString("en-IN")
            : row.time || "",
        userName: name,
        userInitials: initials,
        userId: String(row.user_id ?? row.id ?? ""),
        role: row.role || "User",
        action: row.title || row.type || "Notification",
        module: row.module || row.category || "System",
        details: row.message || row.body || row.description || "",
    };
};

const SummaryCard = ({ item, cardWidth }) => (
    <View style={[styles.summaryCard, { width: cardWidth }]}>
        <View style={styles.summaryTop}>
            <Text style={styles.summaryLabel} numberOfLines={2}>
                {item.label}
            </Text>
            <View style={[styles.summaryIconWrap, { backgroundColor: item.iconBg }]}>
                <Text style={styles.summaryIcon}>{item.icon}</Text>
            </View>
        </View>
        <Text style={styles.summaryValue}>{item.value}</Text>
        <Text style={[styles.summaryFooter, item.footerHighlight && styles.summaryFooterGreen]}>
            {item.footerHighlight ? "" : "→ "}
            {item.footer}
        </Text>
    </View>
);

const ActivityTrailCard = ({ item }) => (
    <View style={styles.trailCard}>
        <Text style={styles.trailTime}>{item.time}</Text>

        <View style={styles.trailUserRow}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.userInitials}</Text>
            </View>
            <View style={styles.trailUserInfo}>
                <Text style={styles.trailUserName}>{item.userName}</Text>
                <Text style={styles.trailUserId}>{item.userId}</Text>
            </View>
        </View>

        <View style={styles.trailBadgeRow}>
            <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{item.role}</Text>
            </View>
            <View style={styles.moduleBadge}>
                <Text style={styles.moduleBadgeText}>{item.module}</Text>
            </View>
        </View>

        <Text style={styles.trailAction}>{item.action}</Text>
        <Text style={styles.trailDetails}>{item.details}</Text>
    </View>
);

const FinanceTeamActivityLogScreen = () => {
    const navigation = useFinanceNavigation();
    const { width } = useWindowDimensions();
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [summaryData, setSummaryData] = useState([]);
    const [activityTrail, setActivityTrail] = useState([]);
    const [loggedInName, setLoggedInName] = useState("");
    const [userCount, setUserCount] = useState(0);

    const horizontalPadding = 16;
    const gap = 10;
    const cardWidth = (width - horizontalPadding * 2 - gap) / 2;

    const loadData = useCallback(async () => {
        const session = await getObjByKey("loginResponse");
        setLoggedInName(session?.name || session?.email || "");

        const [usersRes, notificationsRes] = await Promise.all([
            GETNETWORK(buildUrl("users", "limit=200"), true),
            GETNETWORK(buildUrl("notifications/mine", "limit=50"), true),
        ]);
        logScreenApi("FinanceTeamActivityLogScreen", "users", usersRes, buildUrl("users", "limit=200"));
        logScreenApi("FinanceTeamActivityLogScreen", "notifications/mine", notificationsRes, buildUrl("notifications/mine", "limit=50"));
        const users = isApiSuccess(usersRes) ? extractApiList(usersRes) : [];
        const notifications = isApiSuccess(notificationsRes) ? extractApiList(notificationsRes) : [];

        setUserCount(users.length);
        setSummaryData([
            {
                id: "1",
                label: "TOTAL USERS",
                value: String(users.length),
                footer: "Active accounts",
                icon: "👥",
                iconBg: "#DBEAFE",
            },
            {
                id: "2",
                label: "NOTIFICATIONS",
                value: String(notifications.length),
                footer: "Recent system events",
                footerHighlight: true,
                icon: "🔒",
                iconBg: "#DCFCE7",
            },
            {
                id: "3",
                label: "UNREAD",
                value: String(notifications.filter((n) => !n.is_read).length),
                footer: "Pending alerts",
                icon: "🏭",
                iconBg: "#EDE9FE",
            },
            {
                id: "4",
                label: "TOTAL ACTIONS",
                value: String(notifications.length),
                footer: "All modules",
                icon: "📚",
                iconBg: "#F3F4F6",
            },
        ]);
        setActivityTrail(notifications.map(mapNotificationToTrail));
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [loadData]);

    const filteredTrail = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return activityTrail;
        return activityTrail.filter(
            (item) =>
                item.userName.toLowerCase().includes(query) ||
                item.action.toLowerCase().includes(query) ||
                item.module.toLowerCase().includes(query) ||
                item.details.toLowerCase().includes(query)
        );
    }, [search, activityTrail]);

    const listHeader = (
        <View>
            <View style={styles.pageHeader}>
                <View style={styles.titleBlock}>
                    <Text style={styles.pageTitle}>Team Activity Log</Text>
                    <Text style={styles.pageSubtitle}>
                        Track every login, action & data change by every team member in real-time
                    </Text>
                </View>
                <Text style={styles.loggedInText}>
                    Logged in as:{"\n"}
                    <Text style={styles.loggedInName}>{loggedInName || "—"}</Text>
                </Text>
            </View>

            <View style={styles.summaryGrid}>
                {summaryData.map((item) => (
                    <SummaryCard key={item.id} item={item} cardWidth={cardWidth} />
                ))}
            </View>

            <View style={styles.liveStatusBar}>
                <Text style={styles.liveStatusIcon}>🏭</Text>
                <Text style={styles.liveStatusText}>Production Team — Live Status</Text>
            </View>

            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>All Registered Users ({userCount})</Text>
                <View style={styles.filterRow}>
                    <TouchableOpacity style={styles.filterPill} activeOpacity={0.85}>
                        <Text style={styles.filterText}>All Roles</Text>
                        <Text style={styles.filterChevron}>▾</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterPill} activeOpacity={0.85}>
                        <Text style={styles.filterText}>All Departments</Text>
                        <Text style={styles.filterChevron}>▾</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.entriesText}>{userCount} entries</Text>
                <View style={styles.emptyTable}>
                    <Text style={styles.emptyTableText}>
                        {userCount ? `${userCount} users loaded from API` : "No registered users to display"}
                    </Text>
                </View>
            </View>

            <View style={styles.trailSectionHeader}>
                <Text style={styles.sectionTitle}>Complete Activity Trail</Text>
                <View style={styles.searchBox}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search..."
                        placeholderTextColor={TEXT_LIGHT}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>
        </View>
    );

    const listFooter = (
        <Text style={styles.footerText}>
            SpiceCraft ERP v 2.0 • Logged in as: Rajesh Sahoo (Finance Head) • 22
        </Text>
    );

    return (
        <View style={styles.root}>
            <FinanceHeader
                title="Team Activity Log"
                profileInitial="P"
                onProfilePress={navigation.openDrawer}
            />

            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={filteredTrail}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <ActivityTrailCard item={item} />}
                    ListHeaderComponent={listHeader}
                    ListFooterComponent={listFooter}
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
                    ListEmptyComponent={
                        <View style={styles.emptyTrail}>
                            <Text style={styles.emptyTrailText}>No activity records found</Text>
                        </View>
                    }
                />
            </SafeAreaView>
        </View>
    );
};

export default FinanceTeamActivityLogScreen;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: SCREEN_BG,
    },
    safeArea: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    pageHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingTop: 14,
        paddingBottom: 14,
        gap: 12,
    },
    titleBlock: {
        flex: 1,
    },
    pageTitle: {
        fontFamily: UBUNTUBOLD,
        fontSize: 22,
        color: TEXT_DARK,
        marginBottom: 6,
    },
    pageSubtitle: {
        fontFamily: FIRASANS,
        fontSize: 12,
        color: TEXT_MUTED,
        lineHeight: 17,
    },
    loggedInText: {
        fontFamily: FIRASANS,
        fontSize: 11,
        color: TEXT_MUTED,
        textAlign: "right",
        maxWidth: 130,
        lineHeight: 16,
    },
    loggedInName: {
        fontFamily: FIRASANSSEMIBOLD,
        color: TEXT_DARK,
    },
    summaryGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 12,
        gap: 10,
    },
    summaryCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        marginBottom: 0,
        minHeight: 118,
    },
    summaryTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
        gap: 6,
    },
    summaryLabel: {
        flex: 1,
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 10,
        color: TEXT_MUTED,
        letterSpacing: 0.3,
        lineHeight: 14,
    },
    summaryIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    summaryIcon: {
        fontSize: 16,
    },
    summaryValue: {
        fontFamily: UBUNTUBOLD,
        fontSize: 24,
        color: TEXT_DARK,
        marginBottom: 4,
    },
    summaryFooter: {
        fontFamily: FIRASANS,
        fontSize: 11,
        color: TEXT_LIGHT,
    },
    summaryFooterGreen: {
        color: GREEN,
    },
    liveStatusBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: CARD_BG,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        gap: 10,
    },
    liveStatusIcon: {
        fontSize: 18,
    },
    liveStatusText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 14,
        color: TEXT_DARK,
    },
    sectionCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    sectionTitle: {
        fontFamily: UBUNTUBOLD,
        fontSize: 15,
        color: TEXT_DARK,
        marginBottom: 12,
    },
    filterRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 8,
    },
    filterPill: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    filterText: {
        fontFamily: FIRASANS,
        fontSize: 12,
        color: TEXT_DARK,
    },
    filterChevron: {
        fontSize: 10,
        color: TEXT_MUTED,
    },
    entriesText: {
        fontFamily: FIRASANS,
        fontSize: 12,
        color: TEXT_MUTED,
        marginBottom: 10,
    },
    emptyTable: {
        minHeight: 80,
        borderRadius: 8,
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    emptyTableText: {
        fontFamily: FIRASANS,
        fontSize: 13,
        color: TEXT_LIGHT,
    },
    trailSectionHeader: {
        marginBottom: 10,
    },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: CARD_BG,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        paddingHorizontal: 12,
        marginTop: 4,
    },
    searchIcon: {
        fontSize: 14,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 11,
        fontFamily: FIRASANS,
        fontSize: 14,
        color: TEXT_DARK,
    },
    trailCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    trailTime: {
        fontFamily: FIRASANS,
        fontSize: 11,
        color: TEXT_LIGHT,
        marginBottom: 10,
    },
    trailUserRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 10,
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
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 14,
        color: CARD_BG,
    },
    trailUserInfo: {
        flex: 1,
    },
    trailUserName: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 14,
        color: TEXT_DARK,
    },
    trailUserId: {
        fontFamily: FIRASANS,
        fontSize: 11,
        color: TEXT_LIGHT,
        marginTop: 2,
    },
    trailBadgeRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 8,
    },
    roleBadge: {
        backgroundColor: "#DBEAFE",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    roleBadgeText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 11,
        color: PRIMARY_BLUE,
    },
    moduleBadge: {
        backgroundColor: "#F3F4F6",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    moduleBadgeText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 11,
        color: TEXT_MUTED,
    },
    trailAction: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 14,
        color: AMBER,
        marginBottom: 6,
    },
    trailDetails: {
        fontFamily: FIRASANS,
        fontSize: 13,
        color: TEXT_MUTED,
        lineHeight: 18,
    },
    emptyTrail: {
        paddingVertical: 24,
        alignItems: "center",
    },
    emptyTrailText: {
        fontFamily: FIRASANS,
        fontSize: 13,
        color: TEXT_LIGHT,
    },
    footerText: {
        fontFamily: FIRASANS,
        fontSize: 11,
        color: TEXT_LIGHT,
        textAlign: "center",
        marginTop: 8,
        lineHeight: 16,
    },
});
