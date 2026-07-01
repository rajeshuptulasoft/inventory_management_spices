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
import { FIRASANS, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR } from "../../../constant/color";
import {
    buildUrl,
    extractApiData,
    fmtInr,
    GETNETWORK,
    isApiSuccess,
    logScreenApi,
} from "../../../utils/Network";

const buildSummary = (data = {}) => [
    {
        id: "1",
        label: "TODAY VISITS",
        value: String(data.today_visits ?? data.visits_today ?? 0),
        footer: "Scheduled today",
        icon: "📍",
        iconBg: "#DBEAFE",
    },
    {
        id: "2",
        label: "ORDERS",
        value: String(data.total_orders ?? data.orders ?? 0),
        footer: fmtInr(data.order_value ?? data.total_order_value ?? 0),
        icon: "🛒",
        iconBg: "#DCFCE7",
    },
    {
        id: "3",
        label: "OUTLETS",
        value: String(data.outlets_covered ?? data.outlets ?? 0),
        footer: "Covered today",
        icon: "🏪",
        iconBg: "#FEF3C7",
    },
    {
        id: "4",
        label: "SO STATUS",
        value: (data.pending_tasks ?? 0) > 0 ? "Action" : "On Track",
        footer: "Sales officer overview",
        icon: "📊",
        iconBg: "#EDE9FE",
        footerGreen: !(data.pending_tasks ?? 0),
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
        <Text style={styles.summaryValue}>{item.value}</Text>
        <Text style={[styles.summaryFooter, item.footerGreen && styles.summaryFooterGreen]}>
            {item.footerGreen ? "↑ " : "→ "}
            {item.footer}
        </Text>
    </View>
);

const SoDashboardScreen = () => {
    const navigation = useFinanceNavigation();
    const { width } = useWindowDimensions();
    const [summary, setSummary] = useState(() => buildSummary());
    const [refreshing, setRefreshing] = useState(false);
    const cardWidth = (width - 42) / 2;

    const fetchDashboard = useCallback(async () => {
        const res = await GETNETWORK(buildUrl("sfa/analytics/dashboard"), true);
        logScreenApi("SoDashboardScreen", "sfa/analytics/dashboard", res, buildUrl("sfa/analytics/dashboard"));
        if (isApiSuccess(res)) {
            setSummary(buildSummary(extractApiData(res) || {}));
        }
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    return (
        <View style={styles.root}>
            <FinanceHeader
                profileInitial="S"
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
                    <Text style={styles.title}>Sales Officer Overview</Text>
                    <Text style={styles.subtitle}>Daily visits, orders & outlet coverage</Text>
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

export default SoDashboardScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    safeArea: { flex: 1 },
    scroll: { padding: 16, paddingBottom: 24 },
    title: { fontFamily: UBUNTUBOLD, fontSize: 24, color: "#111827", marginBottom: 4 },
    subtitle: { fontFamily: FIRASANS, fontSize: 14, color: "#6B7280", marginBottom: 16 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    summaryCard: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#E5E7EB" },
    summaryTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    summaryLabel: { fontFamily: FIRASANS, fontSize: 11, color: "#6B7280", flex: 1 },
    summaryIconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
    summaryIcon: { fontSize: 16 },
    summaryValue: { fontFamily: UBUNTUBOLD, fontSize: 22, color: "#111827", marginTop: 10 },
    summaryFooter: { fontFamily: FIRASANS, fontSize: 11, color: "#6B7280", marginTop: 4 },
    summaryFooterGreen: { color: "#16A34A" },
});
