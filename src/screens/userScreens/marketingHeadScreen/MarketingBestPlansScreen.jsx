import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FinanceHeader from "../../../components/commonComponents/FinanceHeader";
import { useFinanceNavigation } from "../../../navigations/AdminNavigationContext";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR } from "../../../constant/color";
import {
    buildUrl,
    GETNETWORK,
    extractApiList,
    getApiMessage,
    isApiSuccess,
    capitalizeStatus,
} from "../../../utils/Network";

const SCREEN_BG = "#F3F4F6";
const CARD_BG = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const TEXT_LIGHT = "#9CA3AF";
const BORDER_COLOR = "#E5E7EB";
const GREEN = "#05A845";

const mapSchemeToPlan = (row) => ({
    id: String(row.id),
    beat: row.scheme_type?.replace(/_/g, " ").toUpperCase() || `SCHEME-${row.id}`,
    name: row.name || "",
    day: row.start_date?.slice?.(0, 10) || row.end_date?.slice?.(0, 10) || "—",
    outlets: String(row.buy_qty ?? 0),
    assignedSo: row.description || "—",
    status: capitalizeStatus(row.status),
});

const SummaryCard = ({ item }) => (
    <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
            <Text style={styles.summaryLabel}>{item.label}</Text>
            <View style={[styles.summaryIconWrap, { backgroundColor: item.iconBg }]}>
                <Text style={styles.summaryIcon}>{item.icon}</Text>
            </View>
        </View>
        <Text style={styles.summaryValue}>{item.value}</Text>
        <Text style={styles.summaryFooter}>→ {item.footer}</Text>
    </View>
);

const BeatPlanCard = ({ item }) => (
    <View style={styles.planCard}>
        <View style={styles.planCardHeader}>
            <View>
                <Text style={styles.fieldLabel}>BEAT</Text>
                <Text style={styles.beatCode}>{item.beat}</Text>
            </View>
            <View style={[styles.statusBadge, item.status !== "Active" && styles.statusInactive]}>
                <View style={[styles.statusDot, item.status !== "Active" && styles.statusDotInactive]} />
                <Text style={[styles.statusText, item.status !== "Active" && styles.statusTextInactive]}>
                    {item.status}
                </Text>
            </View>
        </View>

        <View style={styles.planField}>
            <Text style={styles.fieldLabel}>NAME</Text>
            <Text style={styles.planName}>{item.name}</Text>
        </View>

        <View style={styles.planRow}>
            <View style={styles.planCol}>
                <Text style={styles.fieldLabel}>DAY</Text>
                <Text style={styles.fieldValue}>{item.day}</Text>
            </View>
            <View style={styles.planCol}>
                <Text style={styles.fieldLabel}>OUTLETS</Text>
                <Text style={styles.outletValue}>{item.outlets}</Text>
            </View>
        </View>

        <View style={styles.planField}>
            <Text style={styles.fieldLabel}>ASSIGNED SO</Text>
            <Text style={styles.fieldValue}>{item.assignedSo}</Text>
        </View>
    </View>
);

const MarketingBestPlansScreen = () => {
    const navigation = useFinanceNavigation();
    const [plans, setPlans] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const fetchSchemes = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const res = await GETNETWORK(buildUrl("fmcg/schemes"), true);
            if (!isApiSuccess(res)) {
                setLoadError(getApiMessage(res, "Failed to load schemes"));
                setPlans([]);
                return;
            }
            setPlans(extractApiList(res).map(mapSchemeToPlan));
            setLoadError("");
        } catch {
            setLoadError("Failed to load schemes");
            setPlans([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchSchemes();
    }, [fetchSchemes]);

    const onRefresh = useCallback(() => {
        fetchSchemes(true);
    }, [fetchSchemes]);

    const summaryData = useMemo(() => {
        const activeCount = plans.filter((p) => p.status === "Active").length;
        const outletTotal = plans.reduce((sum, p) => sum + Number(p.outlets || 0), 0);
        return [
            {
                id: "1",
                label: "ACTIVE BEATS",
                value: String(activeCount),
                footer: loading ? "Loading..." : loadError || "From database",
                icon: "🗺️",
                iconBg: "#DBEAFE",
            },
            {
                id: "2",
                label: "TOTAL OUTLETS",
                value: String(outletTotal),
                footer: "Mapped retailers/dealers",
                icon: "🏪",
                iconBg: "#EDE9FE",
            },
        ];
    }, [plans, loading, loadError]);

    const filteredPlans = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return plans;
        return plans.filter(
            (row) =>
                row.beat.toLowerCase().includes(query) ||
                row.name.toLowerCase().includes(query) ||
                row.day.toLowerCase().includes(query) ||
                row.assignedSo.toLowerCase().includes(query) ||
                row.status.toLowerCase().includes(query)
        );
    }, [search, plans]);

    const listHeader = (
        <View>
            <View style={styles.pageHeader}>
                <Text style={styles.pageTitle}>Beat Plan Management</Text>
                <Text style={styles.pageSubtitle}>
                    Territory beats, outlet mapping & sales officer routes
                </Text>
            </View>

            <View style={styles.summaryStack}>
                {summaryData.map((item) => (
                    <SummaryCard key={item.id} item={item} />
                ))}
            </View>

            <View style={styles.listSection}>
                <Text style={styles.sectionTitle}>Beat Plans</Text>
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
            SpiceCraft ERP v3.0 • Logged in as Jaydev (Marketing Head) • 25
        </Text>
    );

    return (
        <View style={styles.root}>
            <FinanceHeader
                title="Best Plans"
                profileInitial="M"
                onProfilePress={navigation.openDrawer}
            />
            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={filteredPlans}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <BeatPlanCard item={item} />}
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
                        <View style={styles.emptyList}>
                            <Text style={styles.emptyListText}>No beat plans yet</Text>
                        </View>
                    }
                />
            </SafeAreaView>
        </View>
    );
};

export default MarketingBestPlansScreen;

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
    pageHeader: {
        paddingTop: 14,
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
    summaryStack: {
        paddingBottom: 14,
    },
    summaryCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        marginBottom: 10,
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
    summaryIcon: {
        fontSize: 14,
    },
    summaryValue: {
        fontFamily: UBUNTUBOLD,
        fontSize: 28,
        color: TEXT_DARK,
        marginBottom: 4,
    },
    summaryFooter: {
        fontFamily: FIRASANS,
        fontSize: 11,
        color: TEXT_LIGHT,
    },
    listSection: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        padding: 14,
        marginBottom: 10,
    },
    sectionTitle: {
        fontFamily: UBUNTUBOLD,
        fontSize: 16,
        color: TEXT_DARK,
        marginBottom: 10,
    },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        paddingHorizontal: 12,
    },
    searchIcon: {
        fontSize: 14,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 11,
        fontFamily: FIRASANS,
        fontSize: 14,
        color: TEXT_DARK,
    },
    planCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    planCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    fieldLabel: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 9,
        color: TEXT_MUTED,
        letterSpacing: 0.4,
        marginBottom: 4,
    },
    beatCode: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 13,
        color: TEXT_DARK,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ECFDF5",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    statusInactive: {
        backgroundColor: "#F3F4F6",
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: GREEN,
    },
    statusDotInactive: {
        backgroundColor: TEXT_MUTED,
    },
    statusText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 11,
        color: GREEN,
    },
    statusTextInactive: {
        color: TEXT_MUTED,
    },
    planField: {
        marginBottom: 12,
    },
    planName: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 15,
        color: TEXT_DARK,
    },
    planRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
    },
    planCol: {
        flex: 1,
    },
    fieldValue: {
        fontFamily: FIRASANS,
        fontSize: 13,
        color: TEXT_DARK,
    },
    outletValue: {
        fontFamily: UBUNTUBOLD,
        fontSize: 15,
        color: TEXT_DARK,
    },
    emptyList: {
        minHeight: 120,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 32,
    },
    emptyListText: {
        fontFamily: FIRASANS,
        fontSize: 13,
        color: TEXT_LIGHT,
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
