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
    extractApiList,
    fmtInr,
    GETNETWORK,
    isApiSuccess,
    logScreenApi,
    mapSalesOrderRow,
} from "../../../utils/Network";

const buildSummary = (parties = [], orders = []) => {
    const pending = orders.filter((o) => (o.status || "").toLowerCase().includes("pending")).length;
    const totalOrderValue = orders.reduce((sum, o) => sum + Number(o.rawAmount ?? 0), 0);
    return [
        {
            id: "1",
            label: "PARTIES",
            value: String(parties.length),
            footer: "Linked accounts",
            icon: "🏬",
            iconBg: "#DBEAFE",
        },
        {
            id: "2",
            label: "ORDERS",
            value: String(orders.length),
            footer: `${pending} pending`,
            icon: "📋",
            iconBg: "#FEF3C7",
        },
        {
            id: "3",
            label: "ORDER VALUE",
            value: fmtInr(totalOrderValue),
            footer: "Total value",
            icon: "💰",
            iconBg: "#DCFCE7",
        },
        {
            id: "4",
            label: "WHOLESALER STATUS",
            value: pending > 0 ? "Action" : "On Track",
            footer: "Wholesale overview",
            icon: "📊",
            iconBg: "#EDE9FE",
            footerGreen: pending === 0,
        },
    ];
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

const WholesalerDashboardScreen = () => {
    const navigation = useFinanceNavigation();
    const { width } = useWindowDimensions();
    const [summary, setSummary] = useState(() => buildSummary());
    const [refreshing, setRefreshing] = useState(false);
    const cardWidth = (width - 42) / 2;

    const fetchDashboard = useCallback(async () => {
        const [partiesRes, ordersRes] = await Promise.all([
            GETNETWORK(buildUrl("parties", "limit=100"), true),
            GETNETWORK(buildUrl("orders", "limit=100"), true),
        ]);
        logScreenApi("WholesalerDashboardScreen", "parties", partiesRes, buildUrl("parties", "limit=100"));
        logScreenApi("WholesalerDashboardScreen", "orders", ordersRes, buildUrl("orders", "limit=100"));

        const parties = isApiSuccess(partiesRes) ? extractApiList(partiesRes) : [];
        const orders = isApiSuccess(ordersRes) ? extractApiList(ordersRes).map(mapSalesOrderRow) : [];
        setSummary(buildSummary(parties, orders));
        setRefreshing(false);
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
                    <Text style={styles.title}>Wholesaler Overview</Text>
                    <Text style={styles.subtitle}>Parties, orders & stock</Text>
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

export default WholesalerDashboardScreen;

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
