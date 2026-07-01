import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
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
    fmtInr,
    GETNETWORK,
    isApiSuccess,
    logScreenApi,
} from "../../../utils/Network";

const SCREEN_BG = "#F3F4F6";
const CARD_BG = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const TEXT_LIGHT = "#9CA3AF";
const BORDER_COLOR = "#E5E7EB";
const GREEN = "#16A34A";

const buildKpiData = (stats = {}) => {
    const salesByMonth = stats.salesByMonth || [];
    const mtdRevenue = salesByMonth.length
        ? Number(salesByMonth[salesByMonth.length - 1]?.total || 0)
        : 0;
    const totalRevenue = salesByMonth.reduce((sum, row) => sum + Number(row.total || 0), 0);
    const topSelling = stats.topSelling || [];
    const unitsSold = topSelling.reduce((sum, row) => {
        const sold = row.totalSold ?? row.dataValues?.totalSold ?? 0;
        return sum + Number(sold);
    }, 0);

    return [
        {
            id: "1",
            label: "REVENUE (MTD)",
            value: fmtInr(mtdRevenue),
            footer: "Latest month sales",
            icon: "💰",
            iconBg: "#DBEAFE",
        },
        {
            id: "2",
            label: "ORDERS",
            value: String(topSelling.length),
            footer: "Top selling SKUs",
            icon: "🎫",
            iconBg: "#DCFCE7",
        },
        {
            id: "3",
            label: "ACTIVE PARTIES",
            value: String(stats.partyCount ?? stats.distributorCount ?? 0),
            footer: "Distributors & retailers",
            icon: "📅",
            iconBg: "#EDE9FE",
        },
        {
            id: "4",
            label: "ACTIVE SCHEMES",
            value: String(stats.schemeCount ?? stats.activeSchemes ?? 0),
            footer: "Running promotions",
            icon: "🎁",
            iconBg: "#FEF3C7",
        },
        {
            id: "5",
            label: "OUTSTANDING",
            value: fmtInr(stats.outstanding ?? 0),
            footer: "Receivables pending",
            icon: "⚠️",
            iconBg: "#FEF3C7",
        },
        {
            id: "6",
            label: "INVENTORY (UNITS)",
            value: String(unitsSold),
            footer: "Units sold (top SKUs)",
            icon: "📦",
            iconBg: "#EDE9FE",
        },
        {
            id: "7",
            label: "COLLECTIONS",
            value: fmtInr(totalRevenue),
            footer: "6-month revenue",
            footerHighlight: true,
            icon: "📊",
            iconBg: "#DCFCE7",
        },
        {
            id: "8",
            label: "PENDING APPROVALS",
            value: String(stats.pendingOrders ?? 0),
            footer: "Orders awaiting approval",
            icon: "🛒",
            iconBg: "#FEE2E2",
        },
    ];
};

const CHART_SECTIONS = [
    {
        id: "sales",
        title: "Sales Trend Analysis",
        subtitle: "Primary vs Secondary vs Tertiary",
        emptyText: "No sales trend data yet. Add orders to see trends.",
    },
    {
        id: "channel",
        title: "Channel Distribution",
        subtitle: null,
        emptyText: "No channel data yet",
    },
    {
        id: "receivable",
        title: "Receivable Aging",
        subtitle: null,
        emptyText: "No receivables data yet",
    },
    {
        id: "distributor",
        title: "Distributor Health",
        subtitle: null,
        emptyText: "No distributors yet. Add parties from the Parties module.",
    },
];

const KpiCard = ({ item, cardWidth }) => (
    <View style={[styles.kpiCard, { width: cardWidth }]}>
        <View style={styles.kpiCardTop}>
            <Text style={styles.kpiLabel} numberOfLines={2}>
                {item.label}
            </Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: item.iconBg }]}>
                <Text style={styles.kpiIcon}>{item.icon}</Text>
            </View>
        </View>
        <Text style={styles.kpiValue}>{item.value}</Text>
        <Text style={[styles.kpiFooter, item.footerHighlight && styles.kpiFooterGreen]}>
            {item.footerHighlight ? "↑ " : "→ "}
            {item.footer}
        </Text>
    </View>
);

const ChartSection = ({ title, subtitle, emptyText }) => (
    <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>{title}</Text>
        {subtitle ? <Text style={styles.chartSubtitle}>{subtitle}</Text> : null}
        <View style={styles.chartPlaceholder}>
            <Text style={styles.chartEmptyText}>{emptyText}</Text>
        </View>
    </View>
);

const MarketingDashboardScreen = () => {
    const navigation = useFinanceNavigation();
    const { width } = useWindowDimensions();
    const [kpiData, setKpiData] = useState(() => buildKpiData());
    const [refreshing, setRefreshing] = useState(false);

    const horizontalPadding = 16;
    const gap = 10;
    const cardWidth = (width - horizontalPadding * 2 - gap) / 2;

    const fetchDashboard = useCallback(async () => {
        try {
            const [marketingRes, salesRes, analyticsRes] = await Promise.all([
                GETNETWORK(buildUrl("dashboard/marketing"), true),
                GETNETWORK(buildUrl("fmcg/dashboard/sales"), true),
                GETNETWORK(buildUrl("fmcg/dashboard/analytics"), true),
            ]);
            logScreenApi("MarketingDashboardScreen", "dashboard/marketing", marketingRes, buildUrl("dashboard/marketing"));
            logScreenApi("MarketingDashboardScreen", "fmcg/dashboard/sales", salesRes, buildUrl("fmcg/dashboard/sales"));
            logScreenApi("MarketingDashboardScreen", "fmcg/dashboard/analytics", analyticsRes, buildUrl("fmcg/dashboard/analytics"));
            if (isApiSuccess(marketingRes)) {
                setKpiData(buildKpiData(extractApiData(marketingRes) || {}));
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

    const listHeader = (
        <View style={styles.listHeader}>
            <View style={styles.titleBlock}>
                <Text style={styles.dashboardTitle}>Marketing Head Dashboard</Text>
                <Text style={styles.dashboardSubtitle}>
                    Real-time business intelligence • SpiceCraft Industries Pvt. Ltd.
                </Text>
            </View>

            <View style={styles.controlsRow}>
                <TouchableOpacity style={styles.periodPill} activeOpacity={0.85}>
                    <Text style={styles.periodText}>This Month</Text>
                    <Text style={styles.periodChevron}>▾</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.exportButton} activeOpacity={0.9}>
                    <Text style={styles.exportButtonText}>Export Report</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const listFooter = (
        <View style={styles.listFooter}>
            {CHART_SECTIONS.map((section) => (
                <ChartSection
                    key={section.id}
                    title={section.title}
                    subtitle={section.subtitle}
                    emptyText={section.emptyText}
                />
            ))}
            <Text style={styles.footerText}>
                SpiceCraft ERP v3.0 • Logged in as Anita Verma (Marketing Head) • 24
            </Text>
        </View>
    );

    return (
        <View style={styles.root}>
            <FinanceHeader
                profileInitial="M"
                onProfilePress={navigation.openDrawer}
                onNotificationPress={() => navigation.navigate("Notification")}
            />

            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={kpiData}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.kpiRow}
                    renderItem={({ item }) => <KpiCard item={item} cardWidth={cardWidth} />}
                    ListHeaderComponent={listHeader}
                    ListFooterComponent={listFooter}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[BRANDCOLOR]}
                            tintColor={BRANDCOLOR}
                        />
                    }
                />
            </SafeAreaView>
        </View>
    );
};

export default MarketingDashboardScreen;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: SCREEN_BG,
    },
    safeArea: {
        flex: 1,
        backgroundColor: SCREEN_BG,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    listHeader: {
        paddingTop: 16,
        paddingBottom: 12,
    },
    titleBlock: {
        marginBottom: 14,
    },
    dashboardTitle: {
        fontFamily: UBUNTUBOLD,
        fontSize: 24,
        color: TEXT_DARK,
        marginBottom: 6,
    },
    dashboardSubtitle: {
        fontFamily: FIRASANS,
        fontSize: 13,
        color: TEXT_MUTED,
        lineHeight: 18,
    },
    controlsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 4,
    },
    periodPill: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: CARD_BG,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 11,
    },
    periodText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 14,
        color: TEXT_DARK,
    },
    periodChevron: {
        fontSize: 12,
        color: TEXT_MUTED,
    },
    exportButton: {
        backgroundColor: BRANDCOLOR,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    exportButtonText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 13,
        color: CARD_BG,
    },
    kpiRow: {
        justifyContent: "space-between",
        marginBottom: 10,
    },
    kpiCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        minHeight: 130,
    },
    kpiCardTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 10,
        gap: 6,
    },
    kpiLabel: {
        flex: 1,
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 10,
        color: TEXT_MUTED,
        letterSpacing: 0.3,
        lineHeight: 14,
    },
    kpiIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    kpiIcon: {
        fontSize: 18,
    },
    kpiValue: {
        fontFamily: UBUNTUBOLD,
        fontSize: 26,
        color: TEXT_DARK,
        marginBottom: 6,
    },
    kpiFooter: {
        fontFamily: FIRASANS,
        fontSize: 11,
        color: TEXT_LIGHT,
        lineHeight: 15,
    },
    kpiFooterGreen: {
        color: GREEN,
    },
    listFooter: {
        paddingTop: 8,
    },
    chartCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    chartTitle: {
        fontFamily: UBUNTUBOLD,
        fontSize: 16,
        color: TEXT_DARK,
        marginBottom: 4,
    },
    chartSubtitle: {
        fontFamily: FIRASANS,
        fontSize: 12,
        color: TEXT_MUTED,
        marginBottom: 12,
    },
    chartPlaceholder: {
        minHeight: 140,
        borderRadius: 10,
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 24,
        marginTop: 8,
    },
    chartEmptyText: {
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
        marginTop: 8,
        marginBottom: 8,
        lineHeight: 16,
    },
});
