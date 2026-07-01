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
    extractApiList,
    GETNETWORK,
    isApiSuccess,
    logScreenApi,
} from "../../../utils/Network";
import { useDashboardBackHandler } from "../../../hooks/useDashboardBackHandler";

const buildSummary = (stats = {}, pendingBatches = 0, pendingProduction = 0) => [
    {
        id: "1",
        label: "PENDING QC",
        value: String(pendingBatches + pendingProduction),
        footer: "Awaiting inspection",
        icon: "🔍",
        iconBg: "#FEF3C7",
        footerGreen: pendingBatches + pendingProduction > 0,
    },
    {
        id: "2",
        label: "BATCH REVIEWS",
        value: String(pendingBatches),
        footer: "Batches to inspect",
        icon: "📅",
        iconBg: "#DBEAFE",
    },
    {
        id: "3",
        label: "PRODUCTION QC",
        value: String(pendingProduction),
        footer: "Production runs",
        icon: "🏭",
        iconBg: "#EDE9FE",
    },
    {
        id: "4",
        label: "ACTIVE RUNS",
        value: String(stats.activeRuns ?? 0),
        footer: "On production floor",
        icon: "⚙️",
        iconBg: "#DCFCE7",
        footerGreen: (stats.activeRuns ?? 0) > 0,
    },
];

const isPendingQc = (status) => {
    const s = String(status || "pending").toLowerCase();
    return ["pending", "awaiting_qc", "in_review", "submitted", "draft"].includes(s);
};

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

const QcDashboardScreen = () => {
    const navigation = useFinanceNavigation();
    const { ExitAlert } = useDashboardBackHandler();
    const { width } = useWindowDimensions();
    const [summaryData, setSummaryData] = useState(() => buildSummary());
    const [recentItems, setRecentItems] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const cardWidth = (width - 32 - 10) / 2;

    const fetchDashboard = useCallback(async () => {
        try {
            const [dashRes, batchRes, prodRes] = await Promise.all([
                GETNETWORK(buildUrl("dashboard/production"), true),
                GETNETWORK(buildUrl("batches", "expiring=true"), true),
                GETNETWORK(buildUrl("production"), true),
            ]);
            logScreenApi("QcDashboardScreen", "dashboard/production", dashRes, buildUrl("dashboard/production"));
            logScreenApi("QcDashboardScreen", "batches", batchRes, buildUrl("batches", "expiring=true"));
            logScreenApi("QcDashboardScreen", "production", prodRes, buildUrl("production"));
            const stats = isApiSuccess(dashRes) ? extractApiData(dashRes) || {} : {};
            const batches = isApiSuccess(batchRes) ? extractApiList(batchRes) : [];
            const production = isApiSuccess(prodRes) ? extractApiList(prodRes) : [];

            const pendingBatches = batches.filter((b) => isPendingQc(b.qc_status || b.status)).length;
            const pendingProduction = production.filter((p) => isPendingQc(p.qc_status || p.status)).length;

            setSummaryData(buildSummary(stats, pendingBatches, pendingProduction));

            const recent = [
                ...batches.slice(0, 3).map((b) => ({
                    id: `b-${b.id}`,
                    title: b.batch_number || `Batch #${b.id}`,
                    subtitle: `Qty ${b.quantity ?? 0} • Exp ${b.expiry_date || "—"}`,
                    status: b.qc_status || b.status || "pending",
                })),
                ...production.slice(0, 3).map((p) => ({
                    id: `p-${p.id}`,
                    title: p.batch_code || `Run #${p.id}`,
                    subtitle: p.variant?.product?.product_name || "Production run",
                    status: p.qc_status || p.status || "pending",
                })),
            ].slice(0, 5);

            setRecentItems(recent);
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
                profileInitial="Q"
                onProfilePress={navigation.openDrawer}
                onNotificationPress={() => navigation.navigate("Notification")}
            />
            <SafeAreaView style={styles.safeArea} edges={[]}>
                <ScrollView
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
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.dashboardTitle}>QC Inspector Dashboard</Text>
                    <Text style={styles.dashboardSubtitle}>
                        Quality checks — batches, production & materials
                    </Text>

                    <View style={styles.summaryGrid}>
                        {summaryData.map((item) => (
                            <SummaryCard key={item.id} item={item} width={cardWidth} />
                        ))}
                    </View>

                    <View style={styles.panel}>
                        <Text style={styles.panelTitle}>Recent QC Queue</Text>
                        {recentItems.length === 0 ? (
                            <Text style={styles.empty}>No pending inspections</Text>
                        ) : (
                            recentItems.map((item) => (
                                <View key={item.id} style={styles.queueCard}>
                                    <View style={styles.queueBody}>
                                        <Text style={styles.queueTitle}>{item.title}</Text>
                                        <Text style={styles.queueSub}>{item.subtitle}</Text>
                                    </View>
                                    <View style={styles.statusBadge}>
                                        <Text style={styles.statusText}>
                                            {String(item.status).replace(/_/g, " ")}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
            <ExitAlert />
        </View>
    );
};

export default QcDashboardScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    safeArea: { flex: 1 },
    scroll: { padding: 16, paddingBottom: 24 },
    dashboardTitle: { fontFamily: UBUNTUBOLD, fontSize: 22, color: "#111827", marginBottom: 4 },
    dashboardSubtitle: { fontFamily: FIRASANS, fontSize: 13, color: "#6B7280", marginBottom: 16 },
    summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
    summaryCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    summaryTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    summaryLabel: { fontFamily: FIRASANS, fontSize: 10, color: "#6B7280", flex: 1 },
    summaryIconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
    summaryIcon: { fontSize: 16 },
    summaryValue: { fontFamily: UBUNTUBOLD, fontSize: 22, color: "#111827" },
    summaryFooter: { fontFamily: FIRASANS, fontSize: 11, color: "#9CA3AF", marginTop: 4 },
    summaryFooterGreen: { color: "#16A34A" },
    panel: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    panelTitle: { fontFamily: FIRASANSSEMIBOLD, fontSize: 16, color: "#111827", marginBottom: 12 },
    queueCard: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    queueBody: { flex: 1 },
    queueTitle: { fontFamily: FIRASANSSEMIBOLD, fontSize: 14, color: "#111827" },
    queueSub: { fontFamily: FIRASANS, fontSize: 12, color: "#6B7280", marginTop: 2 },
    statusBadge: { backgroundColor: "#FEF3C7", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 10, color: "#92400E", textTransform: "capitalize" },
    empty: { fontFamily: FIRASANS, fontSize: 13, color: "#9CA3AF", textAlign: "center", paddingVertical: 20 },
});
