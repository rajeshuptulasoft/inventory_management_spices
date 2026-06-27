import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    BackHandler,
    Platform,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MyHeader } from "../../../components/commonComponents/MyHeader";
import { useFinanceNavigation } from "../../../navigations/AdminNavigationContext";
import { getObjByKey } from "../../../utils/Storage";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR, WHITE } from "../../../constant/color";
import {
    buildUrl,
    GETNETWORK,
    extractApiData,
    getApiMessage,
    isApiSuccess,
    fmtInr,
} from "../../../utils/Network";

const SCREEN_BG = "#F3F4F6";
const CARD_BG = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const TEXT_LIGHT = "#9CA3AF";
const BORDER_COLOR = "#E5E7EB";
const GREEN = "#16A34A";
const PRIMARY_BLUE = "#2563EB";

const ROLE_FOOTER = {
    finance: "Priya Sharma (Finance Department)",
    marketing: "Anita Verma (Marketing Department)",
    shift: "Shift Supervisor (Shift Supervisor)",
};

const KPI_DATA = [
    {
        id: "1",
        label: "TOTAL SALES",
        value: "₹0",
        footer: "↑ From invoices",
        icon: "💰",
        iconBg: "#DBEAFE",
        footerGreen: true,
    },
    {
        id: "2",
        label: "ORDERS",
        value: "0",
        footer: "→ All order types",
        icon: "🛒",
        iconBg: "#DBEAFE",
    },
    {
        id: "3",
        label: "ACTIVE PARTIES",
        value: "0",
        footer: "→ Distributors & retailers",
        icon: "👤",
        iconBg: "#EDE9FE",
    },
    {
        id: "4",
        label: "ACTIVE SCHEMES",
        value: "0",
        footer: "→ Trade promotions",
        icon: "🎁",
        iconBg: "#FEE2E2",
    },
];

const KpiCard = ({ item, width }) => (
    <View style={[styles.kpiCard, { width }]}>
        <View style={styles.kpiTop}>
            <Text style={styles.kpiLabel}>{item.label}</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: item.iconBg }]}>
                <Text style={styles.kpiIcon}>{item.icon}</Text>
            </View>
        </View>
        <Text style={styles.kpiValue}>{item.value}</Text>
        <Text style={[styles.kpiFooter, item.footerGreen && styles.kpiFooterGreen]}>{item.footer}</Text>
    </View>
);

const SharedAIAnalyticsScreen = () => {
    const navigation = useFinanceNavigation();
    const { width } = useWindowDimensions();
    const kpiWidth = (width - 48) / 2;
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [kpiData, setKpiData] = useState(KPI_DATA);
    const [footerRole, setFooterRole] = useState(ROLE_FOOTER.shift);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [marketingRes, enterpriseRes] = await Promise.all([
                GETNETWORK(buildUrl("dashboard/marketing"), true),
                GETNETWORK(buildUrl("fmcg/dashboard/enterprise"), true),
            ]);
            const marketing = isApiSuccess(marketingRes) ? extractApiData(marketingRes) : null;
            const enterprise = isApiSuccess(enterpriseRes) ? extractApiData(enterpriseRes) : null;
            const kpi = enterprise?.kpis || {};
            const totalRev =
                (marketing?.salesByMonth || []).reduce((s, m) => s + parseFloat(m.total || 0), 0) ||
                kpi.revenue ||
                0;
            setKpiData([
                { ...KPI_DATA[0], value: fmtInr(totalRev) },
                { ...KPI_DATA[1], value: String(kpi.pendingOrders ?? kpi.orderCount ?? 0) },
                { ...KPI_DATA[2], value: String(kpi.distributorCount ?? kpi.activeParties ?? 0) },
                { ...KPI_DATA[3], value: String(kpi.activeSchemes ?? 0) },
            ]);
        } catch {
            setKpiData(KPI_DATA);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        getObjByKey("loginResponse").then((session) => {
            const role = session?.role;
            if (role && ROLE_FOOTER[role]) {
                setFooterRole(ROLE_FOOTER[role]);
            }
        });
    }, []);

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    useEffect(() => {
        if (Platform.OS !== "android") {
            return undefined;
        }

        const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
            navigation.goBack();
            return true;
        });

        return () => subscription.remove();
    }, [navigation]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    const listHeader = (
        <View>
            <View style={styles.subAdminBanner}>
                <Text style={styles.subAdminBannerText}>Sub Admin Access</Text>
            </View>

            <View style={styles.pageHeader}>
                <Text style={styles.pageTitle}>AI Analytics</Text>
                <Text style={styles.pageSubtitle}>
                    Live KPIs computed from invoices, orders, parties & schemes
                </Text>
            </View>

            <View style={styles.kpiGrid}>
                {kpiData.map((item) => (
                    <KpiCard key={item.id} item={item} width={kpiWidth} />
                ))}
            </View>

            <View style={styles.chartCard}>
                <Text style={styles.chartPlaceholder}>
                    {loading
                        ? "Loading KPIs from dashboard..."
                        : "Trend charts populate as more sales and collection data is recorded in Finance and Orders."}
                </Text>
            </View>
        </View>
    );

    const listFooter = (
        <Text style={styles.footerText}>
            SpiceCraft ERP v3.0 • Logged in as {footerRole} • 29
        </Text>
    );

    return (
        <View style={styles.root}>
            <MyHeader
                showBack
                showCenterTitle
                title="AI Analytics"
                backgroundColor={WHITE}
                onBackPress={handleBack}
            />

            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={[]}
                    keyExtractor={(_, index) => String(index)}
                    renderItem={null}
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

export default SharedAIAnalyticsScreen;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: SCREEN_BG,
    },
    safeArea: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    subAdminBanner: {
        backgroundColor: "#DBEAFE",
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginTop: 12,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: "#BFDBFE",
    },
    subAdminBannerText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 12,
        color: PRIMARY_BLUE,
        textAlign: "center",
    },
    pageHeader: {
        paddingTop: 12,
        paddingBottom: 14,
    },
    pageTitle: {
        fontFamily: UBUNTUBOLD,
        fontSize: 22,
        color: TEXT_DARK,
        marginBottom: 6,
    },
    pageSubtitle: {
        fontFamily: FIRASANS,
        fontSize: 13,
        color: TEXT_MUTED,
        lineHeight: 18,
    },
    kpiGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 14,
    },
    kpiCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    kpiTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    kpiLabel: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 9,
        color: TEXT_MUTED,
        letterSpacing: 0.3,
        flex: 1,
        paddingRight: 8,
    },
    kpiIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    kpiIcon: {
        fontSize: 16,
    },
    kpiValue: {
        fontFamily: UBUNTUBOLD,
        fontSize: 24,
        color: TEXT_DARK,
        marginBottom: 4,
    },
    kpiFooter: {
        fontFamily: FIRASANS,
        fontSize: 11,
        color: TEXT_MUTED,
    },
    kpiFooterGreen: {
        color: GREEN,
    },
    chartCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        padding: 24,
        minHeight: 200,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 14,
    },
    chartPlaceholder: {
        fontFamily: FIRASANS,
        fontSize: 14,
        color: TEXT_LIGHT,
        textAlign: "center",
        lineHeight: 22,
        maxWidth: 320,
    },
    footerText: {
        fontFamily: FIRASANS,
        fontSize: 11,
        color: TEXT_LIGHT,
        textAlign: "center",
        marginTop: 8,
        lineHeight: 16,
    },
});
