import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FinanceHeader from "../../../components/commonComponents/FinanceHeader";
import { useFinanceNavigation } from "../../../navigations/AdminNavigationContext";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR } from "../../../constant/color";
import {
    buildUrl,
    extractApiData,
    GETNETWORK,
    isApiSuccess,
    logScreenApi,
} from "../../../utils/Network";

const SCREEN_BG = "#F3F4F6";
const CARD_BG = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const GREEN = "#16A34A";
const RED = "#DC2626";

const buildSummary = (data = {}) => [
    {
        id: "1",
        label: "LOW STOCK",
        value: String((data.lowStock || []).length),
        footer: "Items below minimum",
        icon: "⚠️",
        iconBg: "#FEE2E2",
        alert: true,
    },
    {
        id: "2",
        label: "EXPIRING SOON",
        value: String((data.expiringSoon || []).length),
        footer: "Within 30 days",
        icon: "⏰",
        iconBg: "#FEF3C7",
    },
    {
        id: "3",
        label: "MOVEMENTS",
        value: String((data.recentMovements || []).length),
        footer: "Recent stock moves",
        icon: "📦",
        iconBg: "#DBEAFE",
    },
    {
        id: "4",
        label: "STORE STATUS",
        value: (data.lowStock || []).length ? "Alert" : "Healthy",
        footer: "Warehouse overview",
        icon: "🏪",
        iconBg: "#DCFCE7",
        footerGreen: !(data.lowStock || []).length,
    },
];

const SummaryCard = ({ item, width }) => (
    <View style={[styles.summaryCard, { width }]}>
        <View style={styles.summaryTop}>
            <Text style={styles.summaryLabel}>{item.label}</Text>
            <View style={[styles.summaryIconWrap, { backgroundColor: item.iconBg }]}>
                <Text style={styles.summaryIcon}>{item.icon}</Text>
            </View>
        </View>
        <Text style={[styles.summaryValue, item.alert && styles.summaryValueAlert]}>{item.value}</Text>
        <Text style={[styles.summaryFooter, item.footerGreen && styles.summaryFooterGreen]}>
            {item.footerGreen ? "↑ " : "→ "}
            {item.footer}
        </Text>
    </View>
);

const StoreDashboardScreen = () => {
    const navigation = useFinanceNavigation();
    const { width } = useWindowDimensions();
    const [summary, setSummary] = useState(() => buildSummary());
    const [refreshing, setRefreshing] = useState(false);

    const cardWidth = (width - 42) / 2;

    const fetchDashboard = useCallback(async () => {
        try {
            const res = await GETNETWORK(buildUrl("inventory/reports"), true);
            logScreenApi("StoreDashboardScreen", "inventory/reports", res, buildUrl("inventory/reports"));
            if (isApiSuccess(res)) {
                setSummary(buildSummary(extractApiData(res) || {}));
            }
        } finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    return (
        <View style={styles.root}>
            <FinanceHeader
                profileInitial="W"
                onProfilePress={navigation.openDrawer}
                onNotificationPress={() => navigation.navigate("Notification")}
            />
            <SafeAreaView style={styles.safeArea} edges={[]}>
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                fetchDashboard();
                            }}
                            colors={[BRANDCOLOR]}
                        />
                    }
                >
                    <Text style={styles.title}>Warehouse Overview</Text>
                    <Text style={styles.subtitle}>Stock alerts, expiry & movements</Text>
                    <View style={styles.grid}>
                        {summary.map((item) => (
                            <SummaryCard key={item.id} item={item} width={cardWidth} />
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default StoreDashboardScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: SCREEN_BG },
    safeArea: { flex: 1 },
    scroll: { padding: 16, paddingBottom: 24 },
    title: { fontFamily: UBUNTUBOLD, fontSize: 24, color: TEXT_DARK, marginBottom: 4 },
    subtitle: { fontFamily: FIRASANS, fontSize: 14, color: TEXT_MUTED, marginBottom: 16 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    summaryCard: {
        backgroundColor: CARD_BG,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginBottom: 2,
    },
    summaryTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    summaryLabel: { fontFamily: FIRASANS, fontSize: 11, color: TEXT_MUTED, flex: 1 },
    summaryIconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
    summaryIcon: { fontSize: 16 },
    summaryValue: { fontFamily: UBUNTUBOLD, fontSize: 26, color: TEXT_DARK, marginTop: 10 },
    summaryValueAlert: { color: RED },
    summaryFooter: { fontFamily: FIRASANS, fontSize: 11, color: TEXT_MUTED, marginTop: 4 },
    summaryFooterGreen: { color: GREEN },
});
