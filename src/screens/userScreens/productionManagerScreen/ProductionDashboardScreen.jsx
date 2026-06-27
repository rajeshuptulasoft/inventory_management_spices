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
} from "../../../utils/Network";

const SCREEN_BG = "#F3F4F6";
const CARD_BG = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const TEXT_LIGHT = "#9CA3AF";
const BORDER_COLOR = "#E5E7EB";
const GREEN = "#16A34A";
const PRIMARY_BLUE = "#2563EB";

const buildSummaryData = (stats = {}) => {
    const activeRuns = stats.activeRuns ?? 0;
    const batchCount = stats.batchCount ?? 0;
    const rackCount = stats.rackCount ?? 0;
    const recent = stats.recentProduction || [];
    const output = recent.reduce((sum, row) => sum + Number(row.produced_qty || 0), 0);
    const machineTotal = rackCount || batchCount || 0;

    return [
        {
            id: "1",
            label: "PRODUCTION STATUS",
            value: activeRuns > 0 ? "Active" : "Idle",
            footer: activeRuns > 0 ? `${activeRuns} active run(s)` : "No active runs",
            icon: "🕐",
            iconBg: "#DBEAFE",
            footerGreen: activeRuns > 0,
        },
        {
            id: "2",
            label: "MACHINES RUNNING",
            value: `${activeRuns}/${machineTotal}`,
            footer: activeRuns > 0 ? "Production in progress" : "No machine data yet",
            icon: "🏭",
            iconBg: "#EDE9FE",
        },
        {
            id: "3",
            label: "PRODUCTION OUTPUT",
            value: String(output),
            footer: "units so far",
            icon: "📦",
            iconBg: "#FEF3C7",
        },
        {
            id: "4",
            label: "MY ACTIONS",
            value: String(batchCount),
            footer: "Total batches",
            icon: "📋",
            iconBg: "#DCFCE7",
        },
    ];
};

const mapBatches = (stats = {}) =>
    (stats.recentProduction || []).map((row, index) => {
        const statusRaw = String(row.status || "pending");
        const statusLower = statusRaw.toLowerCase().replace(/_/g, " ");
        const isCompleted = statusLower === "completed";
        const isProgress = ["in progress", "running", "active"].includes(statusLower);

        return {
            id: String(row.id ?? index),
            batchId: row.batch_code || `PB-${row.id ?? index}`,
            product:
                [row.variant?.product?.product_name, row.variant?.size].filter(Boolean).join(" ") ||
                "—",
            machine: row.machine_name || row.machine?.name || "—",
            status: statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1).replace(/_/g, " "),
            progress: isCompleted ? 1 : isProgress ? 0.6 : 0.3,
        };
    });

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

const BatchCard = ({ item }) => {
    const isCompleted = item.status === "Completed";
    const progressPercent = Math.round(item.progress * 100);

    return (
        <View style={styles.batchCard}>
            <View style={styles.batchHeader}>
                <View style={styles.batchInfo}>
                    <Text style={styles.batchId}>{item.batchId}</Text>
                    <Text style={styles.batchProduct}>{item.product}</Text>
                    <Text style={styles.batchMachine}>{item.machine}</Text>
                </View>
                <View style={[styles.statusBadge, isCompleted && styles.statusCompleted]}>
                    <Text style={[styles.statusText, isCompleted && styles.statusTextCompleted]}>
                        {item.status}
                    </Text>
                </View>
            </View>
            <View style={styles.progressTrack}>
                <View
                    style={[
                        styles.progressFill,
                        {
                            width: `${progressPercent}%`,
                            backgroundColor: isCompleted ? GREEN : PRIMARY_BLUE,
                        },
                    ]}
                />
            </View>
        </View>
    );
};

const ProductionDashboardScreen = () => {
    const navigation = useFinanceNavigation();
    const { width } = useWindowDimensions();
    const [summaryData, setSummaryData] = useState(() => buildSummaryData());
    const [activeBatches, setActiveBatches] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const horizontalPadding = 16;
    const gap = 10;
    const cardWidth = (width - horizontalPadding * 2 - gap) / 2;

    const fetchDashboard = useCallback(async () => {
        try {
            const res = await GETNETWORK(buildUrl("dashboard/production"), true);
            if (isApiSuccess(res)) {
                const stats = extractApiData(res) || {};
                setSummaryData(buildSummaryData(stats));
                setActiveBatches(mapBatches(stats));
            }
        } finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchDashboard();
    }, [fetchDashboard]);

    return (
        <View style={styles.root}>
            <FinanceHeader
                profileInitial="P"
                onProfilePress={navigation.openDrawer}
                onNotificationPress={() => navigation.navigate("Notification")}
            />

            <SafeAreaView style={styles.safeArea} edges={[]}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[BRANDCOLOR]}
                            tintColor={BRANDCOLOR}
                        />
                    }
                >
                    <View style={styles.pageHeader}>
                        <Text style={styles.dashboardTitle}>Production Manager Dashboard</Text>
                        <Text style={styles.dashboardSubtitle}>
                            Welcome — Production overview & live runs
                        </Text>
                    </View>

                    <View style={styles.summaryGrid}>
                        {summaryData.map((item) => (
                            <SummaryCard key={item.id} item={item} width={cardWidth} />
                        ))}
                    </View>

                    <View style={styles.panel}>
                        <Text style={styles.panelTitle}>Recent Production Runs</Text>
                        {activeBatches.length === 0 ? (
                            <View style={styles.activityEmpty}>
                                <Text style={styles.activityEmptyText}>No production runs yet</Text>
                            </View>
                        ) : (
                            activeBatches.map((batch) => <BatchCard key={batch.id} item={batch} />)
                        )}
                    </View>

                    <View style={styles.panel}>
                        <Text style={styles.panelTitle}>My Activity Log</Text>
                        <View style={styles.activityEmpty}>
                            <Text style={styles.activityEmptyText}>
                                No actions logged yet in this session
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.footerText}>
                        SpiceCraft ERP v3.0 • Logged in as Shift Supervisor (Shift Supervisor) • 27
                    </Text>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default ProductionDashboardScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: SCREEN_BG },
    safeArea: { flex: 1, backgroundColor: SCREEN_BG },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
    pageHeader: { paddingTop: 16, paddingBottom: 14 },
    dashboardTitle: { fontFamily: UBUNTUBOLD, fontSize: 24, color: TEXT_DARK, marginBottom: 6 },
    dashboardSubtitle: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_MUTED, lineHeight: 18 },
    summaryGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 14,
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
        fontSize: 9,
        color: TEXT_MUTED,
        letterSpacing: 0.3,
        lineHeight: 13,
    },
    summaryIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    summaryIcon: { fontSize: 16 },
    summaryValue: { fontFamily: UBUNTUBOLD, fontSize: 24, color: TEXT_DARK, marginBottom: 4 },
    summaryFooter: { fontFamily: FIRASANS, fontSize: 11, color: TEXT_LIGHT, lineHeight: 15 },
    summaryFooterGreen: { color: GREEN },
    panel: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        marginBottom: 12,
    },
    panelTitle: {
        fontFamily: UBUNTUBOLD,
        fontSize: 16,
        color: TEXT_DARK,
        marginBottom: 12,
    },
    batchCard: {
        backgroundColor: "#F9FAFB",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#F3F4F6",
    },
    batchHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 10,
        gap: 8,
    },
    batchInfo: { flex: 1 },
    batchId: { fontFamily: FIRASANSSEMIBOLD, fontSize: 13, color: PRIMARY_BLUE, marginBottom: 4 },
    batchProduct: { fontFamily: FIRASANSSEMIBOLD, fontSize: 14, color: TEXT_DARK, marginBottom: 2 },
    batchMachine: { fontFamily: FIRASANS, fontSize: 12, color: TEXT_MUTED },
    statusBadge: {
        backgroundColor: "#DBEAFE",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusCompleted: { backgroundColor: "#ECFDF5" },
    statusText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 11, color: PRIMARY_BLUE },
    statusTextCompleted: { color: GREEN },
    progressTrack: {
        height: 6,
        borderRadius: 3,
        backgroundColor: "#E5E7EB",
        overflow: "hidden",
    },
    progressFill: { height: "100%", borderRadius: 3 },
    activityEmpty: {
        minHeight: 120,
        borderRadius: 10,
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    activityEmptyText: {
        fontFamily: FIRASANS,
        fontSize: 13,
        color: TEXT_LIGHT,
        textAlign: "center",
        lineHeight: 20,
    },
    footerText: {
        fontFamily: FIRASANS,
        fontSize: 11,
        color: TEXT_LIGHT,
        textAlign: "center",
        marginTop: 4,
        lineHeight: 16,
    },
});
