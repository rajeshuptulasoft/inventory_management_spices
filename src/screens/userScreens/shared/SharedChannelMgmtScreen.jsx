import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    RefreshControl,
    BackHandler,
    Platform,
    Alert,
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
    extractApiList,
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

const mapTerritoryToChannel = (row) => ({
    id: String(row.id),
    channel: row.name || row.code || "",
    orders: String(row.order_count ?? 0),
    volume: fmtInr(row.volume ?? row.sales_volume ?? 0),
    _raw: row,
});

const SUMMARY_DATA = [
    {
        id: "channels",
        label: "CHANNELS",
        footer: "Active channels",
        icon: "👆",
        iconBg: "#DBEAFE",
    },
    {
        id: "orders",
        label: "ORDERS",
        footer: "Across all channels",
        icon: "🛒",
        iconBg: "#EDE9FE",
    },
];

const ROLE_FOOTER = {
    finance: "Priya Sharma (Finance Department)",
    marketing: "Anita Verma (Marketing Department)",
    shift: "Shift Supervisor (Shift Supervisor)",
};

const SummaryCard = ({ item, value }) => (
    <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
            <Text style={styles.summaryLabel}>{item.label}</Text>
            <View style={[styles.summaryIconWrap, { backgroundColor: item.iconBg }]}>
                <Text style={styles.summaryIcon}>{item.icon}</Text>
            </View>
        </View>
        <Text style={styles.summaryValue}>{value}</Text>
        <Text style={styles.summaryFooter}>→ {item.footer}</Text>
    </View>
);

const ChannelBreakdownCard = ({ item }) => (
    <View style={styles.breakdownCard}>
        <View style={styles.breakdownField}>
            <Text style={styles.fieldLabel}>CHANNEL</Text>
            <Text style={styles.channelName}>{item.channel}</Text>
        </View>
        <View style={styles.breakdownRow}>
            <View style={styles.breakdownCol}>
                <Text style={styles.fieldLabel}>ORDERS</Text>
                <Text style={styles.metaValue}>{item.orders}</Text>
            </View>
            <View style={styles.breakdownCol}>
                <Text style={styles.fieldLabel}>VOLUME</Text>
                <Text style={styles.volumeValue}>{item.volume}</Text>
            </View>
        </View>
    </View>
);

const SharedChannelMgmtScreen = () => {
    const navigation = useFinanceNavigation();
    const [channels, setChannels] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [footerRole, setFooterRole] = useState(ROLE_FOOTER.shift);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await GETNETWORK(buildUrl("fmcg/territories"), true);
            if (!isApiSuccess(res)) {
                Alert.alert("Error", getApiMessage(res, "Failed to load territories"));
                setChannels([]);
                return;
            }
            setChannels(extractApiList(res).map(mapTerritoryToChannel));
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
        if (Platform.OS !== "android") return undefined;
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

    const totalOrders = useMemo(
        () => channels.reduce((sum, item) => sum + Number(item.orders || 0), 0),
        [channels]
    );

    const filteredChannels = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return channels;
        return channels.filter(
            (item) =>
                item.channel.toLowerCase().includes(query) ||
                String(item.orders).includes(query) ||
                item.volume.toLowerCase().includes(query)
        );
    }, [search, channels]);

    const listHeader = (
        <View>
            <View style={styles.subAdminBanner}>
                <Text style={styles.subAdminBannerText}>Sub Admin Access</Text>
            </View>

            <View style={styles.pageHeader}>
                <Text style={styles.pageTitle}>Channel Management</Text>
                <Text style={styles.pageSubtitle}>Sales volume by channel from live orders</Text>
            </View>

            <View style={styles.summaryRow}>
                <SummaryCard item={SUMMARY_DATA[0]} value={String(channels.length)} />
                <SummaryCard item={SUMMARY_DATA[1]} value={String(totalOrders)} />
            </View>

            <View style={styles.listSection}>
                <Text style={styles.sectionTitle}>Channel Breakdown</Text>
                <View style={styles.searchBox}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search..."
                        placeholderTextColor={TEXT_LIGHT}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
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
                title="Channel Mgmt"
                backgroundColor={WHITE}
                onBackPress={handleBack}
            />

            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={filteredChannels}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <ChannelBreakdownCard item={item} />}
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
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <Text style={styles.emptyText}>No channel data found</Text>
                        </View>
                    }
                />
            </SafeAreaView>
        </View>
    );
};

export default SharedChannelMgmtScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: SCREEN_BG },
    safeArea: { flex: 1 },
    listContent: { paddingHorizontal: 16, paddingBottom: 24 },
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
        color: "#2563EB",
        textAlign: "center",
    },
    pageHeader: { paddingTop: 12, paddingBottom: 14 },
    pageTitle: { fontFamily: UBUNTUBOLD, fontSize: 22, color: TEXT_DARK, marginBottom: 6 },
    pageSubtitle: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_MUTED, lineHeight: 18 },
    summaryRow: {
        flexDirection: "row",
        gap: 10,
        paddingBottom: 14,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    summaryTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 10,
        gap: 6,
    },
    summaryLabel: {
        flex: 1,
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 10,
        color: TEXT_MUTED,
        letterSpacing: 0.3,
        lineHeight: 14,
    },
    summaryIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    summaryIcon: { fontSize: 14 },
    summaryValue: { fontFamily: UBUNTUBOLD, fontSize: 28, color: TEXT_DARK, marginBottom: 4 },
    summaryFooter: { fontFamily: FIRASANS, fontSize: 11, color: TEXT_LIGHT },
    listSection: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        padding: 14,
        marginBottom: 10,
    },
    sectionTitle: { fontFamily: UBUNTUBOLD, fontSize: 16, color: TEXT_DARK, marginBottom: 10 },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        paddingHorizontal: 12,
    },
    searchIcon: { fontSize: 14, marginRight: 8 },
    searchInput: {
        flex: 1,
        paddingVertical: 11,
        fontFamily: FIRASANS,
        fontSize: 14,
        color: TEXT_DARK,
    },
    breakdownCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    breakdownField: { marginBottom: 12 },
    fieldLabel: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 9,
        color: TEXT_MUTED,
        letterSpacing: 0.4,
        marginBottom: 4,
    },
    channelName: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: TEXT_DARK, lineHeight: 20 },
    breakdownRow: { flexDirection: "row", gap: 12 },
    breakdownCol: { flex: 1 },
    metaValue: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_DARK },
    volumeValue: { fontFamily: UBUNTUBOLD, fontSize: 16, color: GREEN },
    emptyWrap: { paddingVertical: 32, alignItems: "center" },
    emptyText: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_LIGHT },
    footerText: {
        fontFamily: FIRASANS,
        fontSize: 11,
        color: TEXT_LIGHT,
        textAlign: "center",
        marginTop: 8,
        lineHeight: 16,
    },
});
