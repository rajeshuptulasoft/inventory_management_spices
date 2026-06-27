import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
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
    extractApiList,
    GETNETWORK,
    isApiSuccess,
} from "../../../utils/Network";

const TYPE_META = {
    low_stock: { icon: "📦", iconBg: "#FEE2E2" },
    expiry: { icon: "⏰", iconBg: "#FEF3C7" },
    payment_due: { icon: "💰", iconBg: "#DCFCE7" },
    pending_order: { icon: "📋", iconBg: "#FEF3C7" },
    production: { icon: "🏭", iconBg: "#DBEAFE" },
    system: { icon: "🔔", iconBg: "#E0E7FF" },
};

const formatNotificationTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMins < 60) return `${diffMins || 1} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const mapNotificationRow = (row) => {
    const meta = TYPE_META[row.type] || { icon: "🔔", iconBg: "#E0E7FF" };
    return {
        id: String(row.id),
        title: row.title || "Notification",
        message: row.message || "",
        time: formatNotificationTime(row.created_at),
        unread: !row.is_read,
        icon: meta.icon,
        iconBg: meta.iconBg,
    };
};

const SCREEN_BG = "#F3F4F6";
const CARD_BG = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const UNREAD_DOT = "#2563EB";

const NotificationCard = ({ item }) => (
    <TouchableOpacity activeOpacity={0.85} style={styles.card}>
        <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
            <Text style={styles.iconText}>{item.icon}</Text>
        </View>
        <View style={styles.cardBody}>
            <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.unread ? <View style={styles.unreadDot} /> : null}
            </View>
            <Text style={styles.cardMessage}>{item.message}</Text>
            <Text style={styles.cardTime}>{item.time}</Text>
        </View>
    </TouchableOpacity>
);

const FinanceNotificationScreen = () => {
    const navigation = useFinanceNavigation();
    const [notifications, setNotifications] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await GETNETWORK(buildUrl("notifications", "limit=30"), true);
            if (isApiSuccess(res)) {
                setNotifications(extractApiList(res).map(mapNotificationRow));
            }
        } finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        if (Platform.OS !== "android") return undefined;
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            navigation.goBack();
            return true;
        });
        return () => sub.remove();
    }, [navigation]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications();
    }, [fetchNotifications]);

    return (
        <View style={styles.root}>
            <MyHeader
                showBack
                showCenterTitle
                title="Notification"
                backgroundColor={WHITE}
                onBackPress={handleBack}
            />
            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <NotificationCard item={item} />}
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
                    ListHeaderComponent={
                        <Text style={styles.sectionLabel}>Recent Notifications</Text>
                    }
                    ListFooterComponent={
                        <Text style={styles.footerText}>
                            SpiceCraft ERP v3.0 • Logged in as Priya Sharma (Finance Department)
                        </Text>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <Text style={styles.emptyTitle}>No notifications</Text>
                            <Text style={styles.emptyText}>You are all caught up.</Text>
                        </View>
                    }
                />
            </SafeAreaView>
        </View>
    );
};

export default FinanceNotificationScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: SCREEN_BG },
    safeArea: { flex: 1 },
    listContent: { padding: 16, paddingBottom: 24 },
    sectionLabel: {
        fontFamily: UBUNTUBOLD,
        fontSize: 16,
        color: TEXT_DARK,
        marginBottom: 12,
    },
    card: {
        flexDirection: "row",
        backgroundColor: CARD_BG,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        gap: 12,
    },
    iconWrap: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: "center",
        alignItems: "center",
    },
    iconText: { fontSize: 18 },
    cardBody: { flex: 1 },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 4,
    },
    cardTitle: {
        flex: 1,
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 15,
        color: TEXT_DARK,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: UNREAD_DOT,
    },
    cardMessage: {
        fontFamily: FIRASANS,
        fontSize: 13,
        color: TEXT_MUTED,
        lineHeight: 18,
        marginBottom: 6,
    },
    cardTime: { fontFamily: FIRASANS, fontSize: 12, color: "#9CA3AF" },
    emptyWrap: { alignItems: "center", paddingVertical: 48 },
    emptyTitle: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 16,
        color: TEXT_DARK,
        marginBottom: 6,
    },
    emptyText: { fontFamily: FIRASANS, fontSize: 14, color: TEXT_MUTED },
    footerText: {
        fontFamily: FIRASANS,
        fontSize: 11,
        color: "#9CA3AF",
        textAlign: "center",
        marginTop: 12,
        lineHeight: 16,
    },
});
