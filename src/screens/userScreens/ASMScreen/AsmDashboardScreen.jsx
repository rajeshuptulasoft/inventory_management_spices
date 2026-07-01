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
        label: "TOTAL VISITS",
        value: String(data.total_visits ?? data.visits ?? 0),
        footer: "Field visits",
        icon: "📍",
        iconBg: "#DBEAFE",
    },
    {
        id: "2",
        label: "PRODUCTIVE",
        value: String(data.productive_visits ?? data.productive ?? 0),
        footer: "With orders",
        icon: "✓",
        iconBg: "#DCFCE7",
        footerGreen: true,
    },
    {
        id: "3",
        label: "ORDERS",
        value: String(data.total_orders ?? data.orders ?? 0),
        footer: fmtInr(data.order_value ?? data.total_order_value ?? 0),
        icon: "🛒",
        iconBg: "#FEF3C7",
    },
    {
        id: "4",
        label: "ASM STATUS",
        value: (data.pending_visits ?? 0) > 0 ? "Action" : "On Track",
        footer: "Area sales overview",
        icon: "📊",
        iconBg: "#EDE9FE",
        footerGreen: !(data.pending_visits ?? 0),
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

const AsmDashboardScreen = () => {
    const navigation = useFinanceNavigation();
    const { width } = useWindowDimensions();
    const [summary, setSummary] = useState(() => buildSummary());
    const [beats, setBeats] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const cardWidth = (width - 42) / 2;

    const fetchDashboard = useCallback(async () => {
        const res = await GETNETWORK(buildUrl("sfa/analytics/dashboard"), true);
        logScreenApi("AsmDashboardScreen", "sfa/analytics/dashboard", res, buildUrl("sfa/analytics/dashboard"));
        if (isApiSuccess(res)) {
            const data = extractApiData(res) || {};
            setSummary(buildSummary(data));
            setBeats(
                (data.beats || data.top_beats || []).map((b, i) => ({
                    id: String(b.id ?? i),
                    name: b.name || b.beat_name || "—",
                    visits: String(b.visits ?? b.visit_count ?? 0),
                    coverage: `${b.coverage_pct ?? b.coverage ?? 0}%`,
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
                profileInitial="A"
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
                    <Text style={styles.title}>Area Sales Overview</Text>
                    <Text style={styles.subtitle}>Visits, orders & beat coverage</Text>
                    <View style={styles.grid}>
                        {summary.map((item) => (
                            <SummaryCard key={item.id} item={item} width={cardWidth} />
                        ))}
                    </View>
                    <Text style={styles.sectionTitle}>Top Beats</Text>
                    {beats.length === 0 ? (
                        <Text style={styles.empty}>No beat data yet</Text>
                    ) : (
                        beats.map((b) => (
                            <View key={b.id} style={styles.beatCard}>
                                <View style={styles.beatRow}>
                                    <Text style={styles.beatName}>{b.name}</Text>
                                    <Text style={styles.beatCoverage}>{b.coverage}</Text>
                                </View>
                                <Text style={styles.beatMeta}>{b.visits} visits</Text>
                            </View>
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default AsmDashboardScreen;

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
    summaryValue: { fontFamily: UBUNTUBOLD, fontSize: 22, color: "#111827", marginTop: 10 },
    summaryFooter: { fontFamily: FIRASANS, fontSize: 11, color: "#6B7280", marginTop: 4 },
    summaryFooterGreen: { color: "#16A34A" },
    sectionTitle: { fontFamily: UBUNTUBOLD, fontSize: 16, color: "#111827", marginBottom: 10 },
    beatCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    beatRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
    beatName: { fontFamily: UBUNTUBOLD, fontSize: 14, color: "#111827" },
    beatCoverage: { fontFamily: UBUNTUBOLD, fontSize: 14, color: BRANDCOLOR },
    beatMeta: { fontFamily: FIRASANS, fontSize: 12, color: "#6B7280" },
    empty: { fontFamily: FIRASANS, color: "#9CA3AF" },
});
