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
} from "../../../utils/Network";

const SCREEN_BG = "#F3F4F6";
const CARD_BG = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const TEXT_LIGHT = "#9CA3AF";
const PRIMARY_BLUE = "#2563EB";
const BORDER_COLOR = "#E5E7EB";
const GREEN = "#16A34A";

const buildKpiData = (kpi = {}) => {
    const parties =
        (kpi.distributorCount ?? 0) + (kpi.wholesalerCount ?? 0) + (kpi.dealerCount ?? 0);
    const totalOrders = (kpi.pendingOrders ?? 0) + (kpi.deliveredOrders ?? 0);
    const pending = kpi.pendingOrders ?? 0;

    return [
        {
            id: "1",
            label: "REVENUE (MTD)",
            value: fmtInr(kpi.revenue),
            footer: "From invoices",
            icon: "💰",
            iconBg: "#DBEAFE",
        },
        {
            id: "2",
            label: "ORDERS",
            value: String(totalOrders),
            footer: "Total orders",
            icon: "🎫",
            iconBg: "#DCFCE7",
        },
        {
            id: "3",
            label: "ACTIVE PARTIES",
            value: String(parties),
            footer: "Distributors & retailers",
            icon: "📅",
            iconBg: "#EDE9FE",
        },
        {
            id: "4",
            label: "ACTIVE SCHEMES",
            value: String(kpi.activeSchemes ?? kpi.schemeCount ?? 0),
            footer: "Running promotions",
            icon: "🎁",
            iconBg: "#FEF3C7",
        },
        {
            id: "5",
            label: "OUTSTANDING",
            value: fmtInr(kpi.totalOutstanding),
            footer: `${pending} pending approvals`,
            icon: "⚠️",
            iconBg: "#FEF3C7",
        },
        {
            id: "6",
            label: "INVENTORY (UNITS)",
            value: String(kpi.inventoryUnits ?? kpi.productCount ?? 0),
            footer: "Finished goods in stock",
            icon: "📦",
            iconBg: "#EDE9FE",
        },
        {
            id: "7",
            label: "COLLECTIONS",
            value: fmtInr(kpi.monthCollections),
            footer: "Total collected",
            footerHighlight: true,
            icon: "📊",
            iconBg: "#DCFCE7",
        },
        {
            id: "8",
            label: "PENDING APPROVALS",
            value: String(pending),
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
            {item.footerHighlight ? "! " : "→ "}
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

const FinanceDashboardScreen = () => {
    const navigation = useFinanceNavigation();
    const { width } = useWindowDimensions();
    const [kpiData, setKpiData] = useState(() => buildKpiData());
    const [refreshing, setRefreshing] = useState(false);

    const horizontalPadding = 16;
    const gap = 10;
    const cardWidth = (width - horizontalPadding * 2 - gap) / 2;

    const fetchDashboard = useCallback(async () => {
        try {
            const res = await GETNETWORK(buildUrl("fmcg/dashboard/enterprise"), true);
            if (isApiSuccess(res)) {
                const payload = extractApiData(res) || {};
                setKpiData(buildKpiData(payload.kpis || payload));
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
                <Text style={styles.dashboardTitle}>CEO Dashboard</Text>
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
                SpiceCraft ERP v1.0 • Logged in as Rajesh Sahoo (Finance Head) • 24
            </Text>
        </View>
    );

    return (
        <View style={styles.root}>
            <FinanceHeader
                profileInitial="P"
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

export default FinanceDashboardScreen;

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
        backgroundColor: PRIMARY_BLUE,
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
