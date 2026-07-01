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

const SCREEN_BG = "#F3F4F6";
const CARD_BG = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const GREEN = "#16A34A";
const RED = "#DC2626";

const buildSummary = (data = {}, productCount = 0) => {
    const totalProducts = data.totalProducts ?? data.productCount ?? productCount ?? 0;
    const pendingOrders = data.pendingOrders ?? data.pending_orders ?? 0;
    const activeUsers = data.activeUsers ?? data.userCount ?? data.totalUsers ?? 0;
    const lowStock = data.lowStockAlerts ?? data.low_stock ?? 0;

    return [
        {
            id: "1",
            label: "TOTAL PRODUCTS",
            value: String(totalProducts),
            footer: "Catalog items",
            icon: "📦",
            iconBg: "#DBEAFE",
        },
        {
            id: "2",
            label: "ACTIVE USERS",
            value: String(activeUsers),
            footer: "Managed accounts",
            icon: "👥",
            iconBg: "#EDE9FE",
        },
        {
            id: "3",
            label: "PENDING ORDERS",
            value: String(pendingOrders),
            footer: "Awaiting action",
            icon: "📋",
            iconBg: "#FEF3C7",
            alert: pendingOrders > 0,
        },
        {
            id: "4",
            label: "REVENUE (MTD)",
            value: fmtInr(data.revenue ?? data.monthRevenue ?? 0),
            footer: lowStock ? `${lowStock} low stock alerts` : "Enterprise overview",
            icon: "💰",
            iconBg: "#DCFCE7",
            footerGreen: !lowStock,
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

const AdminDashboardScreen = () => {
    const navigation = useFinanceNavigation();
    const { width } = useWindowDimensions();
    const [summary, setSummary] = useState(() => buildSummary());
    const [refreshing, setRefreshing] = useState(false);

    const cardWidth = (width - 42) / 2;

    const fetchDashboard = useCallback(async () => {
        try {
            const [analyticsRes, productsRes] = await Promise.all([
                GETNETWORK(buildUrl("analytics/dashboard"), true),
                GETNETWORK(buildUrl("products", "limit=100"), true),
            ]);
            logScreenApi(
                "AdminDashboardScreen",
                "analytics/dashboard",
                analyticsRes,
                buildUrl("analytics/dashboard")
            );
            logScreenApi(
                "AdminDashboardScreen",
                "products",
                productsRes,
                buildUrl("products", "limit=100")
            );

            const analyticsData = isApiSuccess(analyticsRes) ? extractApiData(analyticsRes) || {} : {};
            let productCount = 0;
            if (isApiSuccess(productsRes)) {
                const payload = extractApiData(productsRes);
                productCount =
                    payload?.total ??
                    payload?.count ??
                    productsRes?.total ??
                    extractApiList(productsRes).length;
            }

            setSummary(buildSummary(analyticsData, productCount));
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
                    <Text style={styles.title}>Admin Command Center</Text>
                    <Text style={styles.subtitle}>Enterprise analytics & catalog overview</Text>
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

export default AdminDashboardScreen;

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
    summaryValue: { fontFamily: UBUNTUBOLD, fontSize: 22, color: TEXT_DARK, marginTop: 10 },
    summaryValueAlert: { color: RED },
    summaryFooter: { fontFamily: FIRASANS, fontSize: 11, color: TEXT_MUTED, marginTop: 4 },
    summaryFooterGreen: { color: GREEN },
});
