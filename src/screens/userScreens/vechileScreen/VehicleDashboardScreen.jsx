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
    extractApiList,
    GETNETWORK,
    isApiSuccess,
    logScreenApi,
} from "../../../utils/Network";

const buildSummary = (vehicles = [], trips = []) => [
    {
        id: "1",
        label: "FLEET SIZE",
        value: String(vehicles.length),
        footer: "Active vehicles",
        icon: "🚛",
        iconBg: "#DBEAFE",
    },
    {
        id: "2",
        label: "ACTIVE TRIPS",
        value: String(trips.filter((t) => (t.status || "").toLowerCase() === "in_transit" || (t.status || "").toLowerCase() === "active").length),
        footer: "In transit now",
        icon: "🛣️",
        iconBg: "#FEF3C7",
    },
    {
        id: "3",
        label: "TOTAL TRIPS",
        value: String(trips.length),
        footer: "All trips",
        icon: "📋",
        iconBg: "#DCFCE7",
    },
    {
        id: "4",
        label: "FLEET STATUS",
        value: vehicles.length ? "Operational" : "Idle",
        footer: "Transport overview",
        icon: "📊",
        iconBg: "#EDE9FE",
        footerGreen: vehicles.length > 0,
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

const VehicleDashboardScreen = () => {
    const navigation = useFinanceNavigation();
    const { width } = useWindowDimensions();
    const [summary, setSummary] = useState(() => buildSummary());
    const [recentTrips, setRecentTrips] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const cardWidth = (width - 42) / 2;

    const fetchDashboard = useCallback(async () => {
        const [vehiclesRes, tripsRes] = await Promise.all([
            GETNETWORK(buildUrl("vehicles", "limit=100"), true),
            GETNETWORK(buildUrl("trips", "limit=50"), true),
        ]);
        logScreenApi("VehicleDashboardScreen", "vehicles", vehiclesRes, buildUrl("vehicles", "limit=100"));
        logScreenApi("VehicleDashboardScreen", "trips", tripsRes, buildUrl("trips", "limit=50"));

        const vehicles = isApiSuccess(vehiclesRes) ? extractApiList(vehiclesRes) : [];
        const trips = isApiSuccess(tripsRes) ? extractApiList(tripsRes) : [];
        setSummary(buildSummary(vehicles, trips));
        setRecentTrips(
            trips.slice(0, 5).map((t, i) => ({
                id: String(t.id ?? i),
                tripNo: t.trip_number || t.trip_no || `TRIP-${t.id ?? i}`,
                vehicle: t.vehicle?.registration_no || t.vehicle_number || "—",
                route: t.route_name || t.destination || "—",
                status: t.status || "—",
            }))
        );
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    return (
        <View style={styles.root}>
            <FinanceHeader
                profileInitial="V"
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
                    <Text style={styles.title}>Fleet Overview</Text>
                    <Text style={styles.subtitle}>Vehicles & trip summary</Text>
                    <View style={styles.grid}>
                        {summary.map((item) => (
                            <SummaryCard key={item.id} item={item} width={cardWidth} />
                        ))}
                    </View>
                    <Text style={styles.sectionTitle}>Recent Trips</Text>
                    {recentTrips.length === 0 ? (
                        <Text style={styles.empty}>No trips yet</Text>
                    ) : (
                        recentTrips.map((t) => (
                            <View key={t.id} style={styles.tripCard}>
                                <Text style={styles.tripNo}>{t.tripNo}</Text>
                                <Text style={styles.tripMeta}>{t.vehicle} • {t.route}</Text>
                                <Text style={styles.tripStatus}>{t.status}</Text>
                            </View>
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default VehicleDashboardScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    safeArea: { flex: 1 },
    scroll: { padding: 16, paddingBottom: 24 },
    title: { fontFamily: UBUNTUBOLD, fontSize: 24, color: "#111827", marginBottom: 4 },
    subtitle: { fontFamily: FIRASANS, fontSize: 14, color: "#6B7280", marginBottom: 16 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
    summaryCard: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#E5E7EB" },
    summaryTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    summaryLabel: { fontFamily: FIRASANS, fontSize: 11, color: "#6B7280", flex: 1 },
    summaryIconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
    summaryIcon: { fontSize: 16 },
    summaryValue: { fontFamily: UBUNTUBOLD, fontSize: 22, color: "#111827", marginTop: 10 },
    summaryFooter: { fontFamily: FIRASANS, fontSize: 11, color: "#6B7280", marginTop: 4 },
    summaryFooterGreen: { color: "#16A34A" },
    sectionTitle: { fontFamily: UBUNTUBOLD, fontSize: 16, color: "#111827", marginBottom: 10 },
    tripCard: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#E5E7EB" },
    tripNo: { fontFamily: UBUNTUBOLD, fontSize: 14, color: "#111827" },
    tripMeta: { fontFamily: FIRASANS, fontSize: 12, color: "#6B7280", marginTop: 4 },
    tripStatus: { fontFamily: FIRASANSSEMIBOLD, fontSize: 12, color: BRANDCOLOR, marginTop: 6, textTransform: "capitalize" },
    empty: { fontFamily: FIRASANS, color: "#9CA3AF" },
});
