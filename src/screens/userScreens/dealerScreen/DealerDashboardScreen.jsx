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
    extractApiList,
    fmtInr,
    GETNETWORK,
    isApiSuccess,
    logScreenApi,
} from "../../../utils/Network";

const buildSummaryFromDashboard = (data = {}) => [
    {
        id: "1",
        label: "ORDERS",
        value: String(data.totalOrders ?? data.ordersCount ?? 0),
        footer: "Total orders",
        icon: "📋",
        iconBg: "#FEF3C7",
    },
    {
        id: "2",
        label: "PENDING",
        value: String(data.pendingOrders ?? 0),
        footer: "Awaiting action",
        icon: "⏳",
        iconBg: "#FEE2E2",
        alert: (data.pendingOrders ?? 0) > 0,
    },
    {
        id: "3",
        label: "PARTIES",
        value: String(data.totalParties ?? data.partiesCount ?? 0),
        footer: "Linked parties",
        icon: "🤝",
        iconBg: "#DBEAFE",
    },
    {
        id: "4",
        label: "COLLECTIONS",
        value: fmtInr(data.totalCollections ?? 0),
        footer: "Total collected",
        icon: "💵",
        iconBg: "#DCFCE7",
        footerGreen: true,
    },
];

const buildSummaryFromLists = (orders = [], parties = []) => {
    const pending = orders.filter(
        (o) => String(o.status || "").toLowerCase() === "pending"
    ).length;
    return [
        {
            id: "1",
            label: "ORDERS",
            value: String(orders.length),
            footer: "Total orders",
            icon: "📋",
            iconBg: "#FEF3C7",
        },
        {
            id: "2",
            label: "PENDING",
            value: String(pending),
            footer: "Awaiting action",
            icon: "⏳",
            iconBg: "#FEE2E2",
            alert: pending > 0,
        },
        {
            id: "3",
            label: "PARTIES",
            value: String(parties.length),
            footer: "Linked parties",
            icon: "🤝",
            iconBg: "#DBEAFE",
        },
        {
            id: "4",
            label: "STATUS",
            value: pending > 0 ? "Action" : "On Track",
            footer: "Dealer overview",
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
        <Text style={[styles.summaryValue, item.alert && styles.summaryValueAlert]}>{item.value}</Text>
        <Text style={[styles.summaryFooter, item.footerGreen && styles.summaryFooterGreen]}>
            {item.footerGreen ? "↑ " : "→ "}
            {item.footer}
        </Text>
    </View>
);

const DealerDashboardScreen = () => {
    const navigation = useFinanceNavigation();
    const { width } = useWindowDimensions();
    const [summary, setSummary] = useState(() => buildSummaryFromLists());
    const [refreshing, setRefreshing] = useState(false);
    const cardWidth = (width - 42) / 2;

    const fetchDashboard = useCallback(async () => {
        try {
            const res = await GETNETWORK(buildUrl("finance/dashboard"), true);
            logScreenApi("DealerDashboardScreen", "finance/dashboard", res, buildUrl("finance/dashboard"));
            if (isApiSuccess(res)) {
                setSummary(buildSummaryFromDashboard(extractApiData(res) || {}));
                return;
            }
            const [oRes, pRes] = await Promise.all([
                GETNETWORK(buildUrl("orders", "limit=100"), true),
                GETNETWORK(buildUrl("parties", "limit=200"), true),
            ]);
            logScreenApi("DealerDashboardScreen", "orders", oRes, buildUrl("orders", "limit=100"));
            logScreenApi("DealerDashboardScreen", "parties", pRes, buildUrl("parties", "limit=200"));
            const orders = isApiSuccess(oRes) ? extractApiList(oRes) : [];
            const parties = isApiSuccess(pRes) ? extractApiList(pRes) : [];
            setSummary(buildSummaryFromLists(orders, parties));
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
                profileInitial="L"
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
                    <Text style={styles.title}>Dealer Overview</Text>
                    <Text style={styles.subtitle}>Orders, parties & collections</Text>
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

export default DealerDashboardScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    safeArea: { flex: 1 },
    scroll: { padding: 16, paddingBottom: 24 },
    title: { fontFamily: UBUNTUBOLD, fontSize: 24, color: "#111827", marginBottom: 4 },
    subtitle: { fontFamily: FIRASANS, fontSize: 14, color: "#6B7280", marginBottom: 16 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    summaryCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginBottom: 2,
    },
    summaryTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    summaryLabel: { fontFamily: FIRASANS, fontSize: 11, color: "#6B7280", flex: 1 },
    summaryIconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
    summaryIcon: { fontSize: 16 },
    summaryValue: { fontFamily: UBUNTUBOLD, fontSize: 22, color: "#111827", marginTop: 10 },
    summaryValueAlert: { color: "#DC2626" },
    summaryFooter: { fontFamily: FIRASANS, fontSize: 11, color: "#6B7280", marginTop: 4 },
    summaryFooterGreen: { color: "#16A34A" },
});
