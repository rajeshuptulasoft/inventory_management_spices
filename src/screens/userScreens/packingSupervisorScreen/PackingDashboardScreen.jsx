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
    GETNETWORK,
    isApiSuccess,
    logScreenApi,
} from "../../../utils/Network";

const buildSummary = (stats = {}) => [
    {
        id: "1",
        label: "BATCHES",
        value: String(stats.batchCount ?? 0),
        footer: "Total batches",
        icon: "📅",
        iconBg: "#DBEAFE",
    },
    {
        id: "2",
        label: "EXPIRY ALERTS",
        value: String(stats.expiryAlerts ?? 0),
        footer: "Needs attention",
        icon: "⏰",
        iconBg: "#FEE2E2",
        alert: (stats.expiryAlerts ?? 0) > 0,
    },
    {
        id: "3",
        label: "ACTIVE RUNS",
        value: String(stats.activeRuns ?? 0),
        footer: "Packing in progress",
        icon: "🏭",
        iconBg: "#FEF3C7",
    },
    {
        id: "4",
        label: "PACKING STATUS",
        value: (stats.activeRuns ?? 0) > 0 ? "Active" : "Idle",
        footer: "Floor overview",
        icon: "📦",
        iconBg: "#DCFCE7",
        footerGreen: (stats.activeRuns ?? 0) > 0,
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

const PackingDashboardScreen = () => {
    const navigation = useFinanceNavigation();
    const { width } = useWindowDimensions();
    const [summary, setSummary] = useState(() => buildSummary());
    const [recentRuns, setRecentRuns] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const cardWidth = (width - 42) / 2;

    const fetchDashboard = useCallback(async () => {
        const res = await GETNETWORK(buildUrl("dashboard/production"), true);
        logScreenApi("PackingDashboardScreen", "dashboard/production", res, buildUrl("dashboard/production"));
        if (isApiSuccess(res)) {
            const stats = extractApiData(res) || {};
            setSummary(buildSummary(stats));
            setRecentRuns(
                (stats.recentProduction || []).slice(0, 5).map((row, i) => ({
                    id: String(row.id ?? i),
                    batch: row.batch_code || `PB-${row.id}`,
                    product: `${row.variant?.product?.product_name || ""} — ${row.variant?.size || ""}`.trim(),
                    qty: String(row.produced_qty ?? 0),
                    status: row.status || "—",
                }))
            );
        }
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    return (
        <View style={styles.root}>
            <FinanceHeader
                title="Packing Dashboard"
                profileInitial="P"
                onProfilePress={navigation.openDrawer}
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
                    <Text style={styles.title}>Packing Overview</Text>
                    <Text style={styles.subtitle}>Batches, runs & finished goods</Text>
                    <View style={styles.grid}>
                        {summary.map((item) => (
                            <SummaryCard key={item.id} item={item} width={cardWidth} />
                        ))}
                    </View>
                    <Text style={styles.sectionTitle}>Recent Production Runs</Text>
                    {recentRuns.length === 0 ? (
                        <Text style={styles.empty}>No recent runs</Text>
                    ) : (
                        recentRuns.map((run) => (
                            <View key={run.id} style={styles.runCard}>
                                <Text style={styles.runTitle}>{run.batch}</Text>
                                <Text style={styles.runMeta}>{run.product || "—"}</Text>
                                <Text style={styles.runMeta}>
                                    Qty: {run.qty} • {run.status}
                                </Text>
                            </View>
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default PackingDashboardScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    safeArea: { flex: 1 },
    scroll: { padding: 16, paddingBottom: 24 },
    title: { fontFamily: UBUNTUBOLD, fontSize: 24, color: "#111827", marginBottom: 4 },
    subtitle: { fontFamily: FIRASANS, fontSize: 14, color: "#6B7280", marginBottom: 16 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
    summaryCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    summaryTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    summaryLabel: { fontFamily: FIRASANS, fontSize: 11, color: "#6B7280", flex: 1 },
    summaryIconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
    summaryIcon: { fontSize: 16 },
    summaryValue: { fontFamily: UBUNTUBOLD, fontSize: 26, color: "#111827", marginTop: 10 },
    summaryValueAlert: { color: "#DC2626" },
    summaryFooter: { fontFamily: FIRASANS, fontSize: 11, color: "#6B7280", marginTop: 4 },
    summaryFooterGreen: { color: "#16A34A" },
    sectionTitle: { fontFamily: UBUNTUBOLD, fontSize: 16, color: "#111827", marginBottom: 10 },
    runCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    runTitle: { fontFamily: UBUNTUBOLD, fontSize: 14, color: "#111827" },
    runMeta: { fontFamily: FIRASANS, fontSize: 12, color: "#6B7280", marginTop: 4 },
    empty: { fontFamily: FIRASANS, color: "#9CA3AF", marginBottom: 12 },
});
