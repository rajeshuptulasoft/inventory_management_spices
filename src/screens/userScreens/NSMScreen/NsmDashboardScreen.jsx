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
        label: "PENDING ORDERS",
        value: String(data.pendingOrders ?? 0),
        footer: "Awaiting action",
        icon: "📋",
        iconBg: "#FEF3C7",
    },
    {
        id: "2",
        label: "COLLECTIONS",
        value: fmtInr(data.totalCollections ?? 0),
        footer: "Total collected",
        icon: "💵",
        iconBg: "#DCFCE7",
    },
    {
        id: "3",
        label: "ACTIVE TARGETS",
        value: String((data.targets || []).length),
        footer: "Monthly targets",
        icon: "🎯",
        iconBg: "#DBEAFE",
    },
    {
        id: "4",
        label: "NSM STATUS",
        value: (data.pendingOrders ?? 0) > 0 ? "Action" : "On Track",
        footer: "National sales overview",
        icon: "📊",
        iconBg: "#EDE9FE",
        footerGreen: !(data.pendingOrders ?? 0),
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

const NsmDashboardScreen = () => {
    const navigation = useFinanceNavigation();
    const { width } = useWindowDimensions();
    const [summary, setSummary] = useState(() => buildSummary());
    const [targets, setTargets] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const cardWidth = (width - 42) / 2;

    const fetchDashboard = useCallback(async () => {
        const res = await GETNETWORK(buildUrl("analytics/dashboard"), true);
        logScreenApi("NsmDashboardScreen", "analytics/dashboard", res, buildUrl("analytics/dashboard"));
        if (isApiSuccess(res)) {
            const data = extractApiData(res) || {};
            setSummary(buildSummary(data));
            setTargets(
                (data.targets || []).map((t, i) => {
                    const pct = t.target_amount
                        ? Math.round((Number(t.achieved_amount) / Number(t.target_amount)) * 100)
                        : 0;
                    return {
                        id: String(t.id ?? i),
                        month: t.target_month
                            ? new Date(t.target_month).toLocaleDateString("en-IN", {
                                  month: "long",
                                  year: "numeric",
                              })
                            : "—",
                        pct: String(pct),
                        achieved: fmtInr(t.achieved_amount),
                        target: fmtInr(t.target_amount),
                    };
                })
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
                profileInitial="N"
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
                    <Text style={styles.title}>National Sales Overview</Text>
                    <Text style={styles.subtitle}>Orders, collections & targets</Text>
                    <View style={styles.grid}>
                        {summary.map((item) => (
                            <SummaryCard key={item.id} item={item} width={cardWidth} />
                        ))}
                    </View>
                    <Text style={styles.sectionTitle}>Monthly Targets</Text>
                    {targets.length === 0 ? (
                        <Text style={styles.empty}>No targets assigned yet</Text>
                    ) : (
                        targets.map((t) => (
                            <View key={t.id} style={styles.targetCard}>
                                <View style={styles.targetRow}>
                                    <Text style={styles.targetMonth}>{t.month}</Text>
                                    <Text style={styles.targetPct}>{t.pct}%</Text>
                                </View>
                                <Text style={styles.targetMeta}>
                                    {t.achieved} / {t.target}
                                </Text>
                            </View>
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default NsmDashboardScreen;

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
    targetCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    targetRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
    targetMonth: { fontFamily: UBUNTUBOLD, fontSize: 14, color: "#111827" },
    targetPct: { fontFamily: UBUNTUBOLD, fontSize: 14, color: BRANDCOLOR },
    targetMeta: { fontFamily: FIRASANS, fontSize: 12, color: "#6B7280" },
    empty: { fontFamily: FIRASANS, color: "#9CA3AF" },
});
