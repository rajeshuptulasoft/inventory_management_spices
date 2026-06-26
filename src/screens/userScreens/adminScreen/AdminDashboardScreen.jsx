import React, { useCallback, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/commonComponents/Header";
import { useNavigation } from "../../../navigations/AdminNavigationContext";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { WIDTH } from "../../../constant/config";
import { BRANDCOLOR } from "../../../constant/color";

const PRIMARY_BLUE = "#2563EB";
const SCREEN_BG = "#F3F4F6";
const CARD_BG = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const TEXT_LIGHT = "#9CA3AF";
const GREEN = "#16A34A";
const RED = "#DC2626";

const KPI_DATA = [
    { id: "1", label: "Total Revenue", value: "₹4.2M", trend: "+12%", trendUp: true, icon: "💳", iconBg: "#DBEAFE" },
    { id: "2", label: "Total Production", value: "850k units", trend: "+5.2%", trendUp: true, icon: "🏭", iconBg: "#FEF3C7" },
    { id: "3", label: "Active Orders", value: "1.2k", trend: "-2.1%", trendUp: false, icon: "🛒", iconBg: "#DCFCE7" },
];

const ACTIVITY_DATA = [
    { id: "1", title: "New Order #8922", subtitle: "Retailer: Global Foods Inc. • 2 mins ago", icon: "🛍️", iconBg: "#DCFCE7" },
    { id: "2", title: "Production Batch #45 Completed", subtitle: "Quality check passed: 100% • 45 mins ago", icon: "✓", iconBg: "#DBEAFE" },
    { id: "3", title: "Low Stock Alert", subtitle: "Turmeric Powder: < 50 units • 2 hours ago", icon: "!", iconBg: "#FEE2E2" },
    { id: "4", title: "Shipment Dispatched", subtitle: "Tracking ID: YB-990-22 • 5 hours ago", icon: "🚚", iconBg: "#FEF3C7" },
];

const STOCK_DATA = [
    { id: "1", name: "Cinnamon Bark", percent: 82, color: PRIMARY_BLUE },
    { id: "2", name: "Black Pepper", percent: 65, color: PRIMARY_BLUE },
    { id: "3", name: "Turmeric", percent: 13, color: RED },
];

const CHART_POINTS = [28, 42, 35, 58, 48, 72, 55, 68, 62, 78, 70, 85];
const CHART_LABELS = ["Jan", "Mar", "May", "Jul", "Sep", "Nov"];

const AdminDashboardScreen = () => {
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    return (
        <View style={styles.root}>
            <Header
                profileInitial="A"
                onNotificationPress={() => navigation.navigate("Notification")}
            />

            <SafeAreaView style={styles.safeArea} edges={[]}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[BRANDCOLOR]}
                            tintColor={BRANDCOLOR}
                        />
                    }
                >
                <View style={styles.welcomeSection}>
                    <View style={styles.welcomeTextBlock}>
                        <Text style={styles.greeting}>Good Morning, Alex</Text>
                        <Text style={styles.welcomeSubtitle}>
                            Your spice production is running at 94% efficiency today.
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.reportButton} activeOpacity={0.9}>
                        <Text style={styles.reportButtonText}>Generate Report</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.kpiColumn}>
                    {KPI_DATA.map((item) => (
                        <View key={item.id} style={styles.kpiCard}>
                            <View style={[styles.kpiIconWrap, { backgroundColor: item.iconBg }]}>
                                <Text style={styles.kpiIcon}>{item.icon}</Text>
                            </View>
                            <Text style={styles.kpiLabel}>{item.label}</Text>
                            <Text style={styles.kpiValue}>{item.value}</Text>
                            <Text style={[styles.kpiTrend, item.trendUp ? styles.trendUp : styles.trendDown]}>
                                {item.trend}
                            </Text>
                        </View>
                    ))}

                    <View style={[styles.kpiCard, styles.alertCard]}>
                        <View style={styles.alertBadge}>
                            <Text style={styles.alertBadgeText}>ACTION REQUIRED</Text>
                        </View>
                        <View style={[styles.kpiIconWrap, { backgroundColor: "#FEE2E2" }]}>
                            <Text style={styles.kpiIcon}>⚠️</Text>
                        </View>
                        <Text style={styles.kpiLabel}>Stock Alerts</Text>
                        <Text style={styles.kpiValue}>12</Text>
                    </View>
                </View>

                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>Monthly Sales Growth</Text>
                            <Text style={styles.sectionSubtitle}>Performance overview for the current fiscal year</Text>
                        </View>
                        <View style={styles.yearPill}>
                            <Text style={styles.yearPillText}>Year 2024</Text>
                        </View>
                    </View>

                    <View style={styles.chartContainer}>
                        <View style={styles.chartBars}>
                            {CHART_POINTS.map((height, index) => (
                                <View key={index} style={styles.chartBarColumn}>
                                    <View style={[styles.chartBar, { height: `${height}%` }]} />
                                </View>
                            ))}
                        </View>
                        <View style={styles.chartLabels}>
                            {CHART_LABELS.map((label) => (
                                <Text key={label} style={styles.chartLabel}>
                                    {label}
                                </Text>
                            ))}
                        </View>
                    </View>
                </View>

                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                        <TouchableOpacity activeOpacity={0.8}>
                            <Text style={styles.seeAll}>See all</Text>
                        </TouchableOpacity>
                    </View>

                    {ACTIVITY_DATA.map((item) => (
                        <View key={item.id} style={styles.activityRow}>
                            <View style={[styles.activityIcon, { backgroundColor: item.iconBg }]}>
                                <Text style={styles.activityIconText}>{item.icon}</Text>
                            </View>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityTitle}>{item.title}</Text>
                                <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Top Stock Availability</Text>

                    {STOCK_DATA.map((item) => (
                        <View key={item.id} style={styles.stockRow}>
                            <View style={styles.stockHeader}>
                                <Text style={styles.stockName}>{item.name}</Text>
                                <Text style={styles.stockPercent}>{item.percent}%</Text>
                            </View>
                            <View style={styles.stockTrack}>
                                <View
                                    style={[
                                        styles.stockFill,
                                        { width: `${item.percent}%`, backgroundColor: item.color },
                                    ]}
                                />
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.outlookCard}>
                    <View style={styles.outlookOverlay} />
                    <Text style={styles.outlookTitle}>Operational Outlook</Text>
                    <Text style={styles.outlookText}>
                        All production lines are scheduled for maintenance in 12 days. Plan inventory buffers accordingly.
                    </Text>
                    <TouchableOpacity style={styles.outlookButton} activeOpacity={0.9}>
                        <Text style={styles.outlookButtonText}>View Maintenance Schedule</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomSpacer} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default AdminDashboardScreen;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: SCREEN_BG,
    },
    safeArea: {
        flex: 1,
        backgroundColor: SCREEN_BG,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 24,
    },
    welcomeSection: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 16,
        gap: 12,
    },
    welcomeTextBlock: {
        flex: 1,
    },
    greeting: {
        fontSize: 22,
        fontFamily: UBUNTUBOLD,
        color: TEXT_DARK,
        marginBottom: 6,
        textAlign: "left",
    },
    welcomeSubtitle: {
        fontSize: 13,
        fontFamily: FIRASANS,
        color: TEXT_MUTED,
        lineHeight: 18,
        textAlign: "left",
    },
    reportButton: {
        backgroundColor: PRIMARY_BLUE,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        alignSelf: "flex-start",
    },
    reportButtonText: {
        color: CARD_BG,
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 12,
    },
    kpiColumn: {
        gap: 12,
    },
    kpiCard: {
        width: "100%",
        backgroundColor: CARD_BG,
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    alertCard: {},
    alertBadge: {
        alignSelf: "center",
        backgroundColor: "#FEE2E2",
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginBottom: 12,
    },
    alertBadgeText: {
        color: RED,
        fontSize: 9,
        fontFamily: FIRASANSSEMIBOLD,
        letterSpacing: 0.4,
    },
    kpiIconWrap: {
        width: 72,
        height: 72,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 14,
    },
    kpiIcon: {
        fontSize: 32,
    },
    kpiLabel: {
        fontSize: 13,
        fontFamily: FIRASANS,
        color: TEXT_MUTED,
        marginBottom: 6,
        textAlign: "center",
    },
    kpiValue: {
        fontSize: 24,
        fontFamily: UBUNTUBOLD,
        color: TEXT_DARK,
        marginBottom: 6,
        textAlign: "center",
    },
    kpiTrend: {
        fontSize: 13,
        fontFamily: FIRASANSSEMIBOLD,
        textAlign: "center",
    },
    trendUp: {
        color: GREEN,
    },
    trendDown: {
        color: RED,
    },
    sectionCard: {
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 16,
        gap: 12,
    },
    sectionHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: UBUNTUBOLD,
        color: TEXT_DARK,
    },
    sectionSubtitle: {
        fontSize: 12,
        fontFamily: FIRASANS,
        color: TEXT_LIGHT,
        marginTop: 4,
        maxWidth: WIDTH * 0.55,
    },
    yearPill: {
        backgroundColor: "#F3F4F6",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    yearPillText: {
        fontSize: 11,
        fontFamily: FIRASANSSEMIBOLD,
        color: TEXT_MUTED,
    },
    chartContainer: {
        marginTop: 4,
    },
    chartBars: {
        height: 140,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    chartBarColumn: {
        flex: 1,
        height: "100%",
        justifyContent: "flex-end",
        alignItems: "center",
        marginHorizontal: 2,
    },
    chartBar: {
        width: "70%",
        minHeight: 8,
        backgroundColor: PRIMARY_BLUE,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        opacity: 0.85,
    },
    chartLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
        paddingHorizontal: 2,
    },
    chartLabel: {
        fontSize: 11,
        fontFamily: FIRASANS,
        color: TEXT_LIGHT,
    },
    seeAll: {
        fontSize: 13,
        fontFamily: FIRASANSSEMIBOLD,
        color: PRIMARY_BLUE,
    },
    activityRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    activityIconText: {
        fontSize: 16,
        fontFamily: UBUNTUBOLD,
        color: TEXT_DARK,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 14,
        fontFamily: FIRASANSSEMIBOLD,
        color: TEXT_DARK,
        marginBottom: 2,
    },
    activitySubtitle: {
        fontSize: 12,
        fontFamily: FIRASANS,
        color: TEXT_MUTED,
    },
    stockRow: {
        marginTop: 14,
    },
    stockHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    stockName: {
        fontSize: 14,
        fontFamily: FIRASANSSEMIBOLD,
        color: TEXT_DARK,
    },
    stockPercent: {
        fontSize: 13,
        fontFamily: FIRASANSSEMIBOLD,
        color: TEXT_MUTED,
    },
    stockTrack: {
        height: 8,
        backgroundColor: "#E5E7EB",
        borderRadius: 999,
        overflow: "hidden",
    },
    stockFill: {
        height: "100%",
        borderRadius: 999,
    },
    outlookCard: {
        marginTop: 16,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#1F2937",
        padding: 18,
        minHeight: 160,
        justifyContent: "flex-end",
    },
    outlookOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(17, 24, 39, 0.55)",
    },
    outlookTitle: {
        fontSize: 18,
        fontFamily: UBUNTUBOLD,
        color: CARD_BG,
        marginBottom: 8,
        zIndex: 1,
    },
    outlookText: {
        fontSize: 13,
        fontFamily: FIRASANS,
        color: "#E5E7EB",
        lineHeight: 18,
        marginBottom: 14,
        zIndex: 1,
    },
    outlookButton: {
        alignSelf: "flex-start",
        backgroundColor: CARD_BG,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        zIndex: 1,
    },
    outlookButtonText: {
        fontSize: 12,
        fontFamily: FIRASANSSEMIBOLD,
        color: TEXT_DARK,
    },
    bottomSpacer: {
        height: 88,
    },
});
