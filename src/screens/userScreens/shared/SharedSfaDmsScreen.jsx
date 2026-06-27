import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    RefreshControl,
    BackHandler,
    Platform,
    Alert,
    Modal,
    KeyboardAvoidingView,
    ScrollView,
    Pressable,
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
    capitalizeStatus,
} from "../../../utils/Network";

const SCREEN_BG = "#F3F4F6";
const CARD_BG = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const TEXT_LIGHT = "#9CA3AF";
const BORDER_COLOR = "#E5E7EB";
const PRIMARY_BLUE = "#2563EB";
const GREEN = "#16A34A";
const RED = "#DC2626";

const TABS = [
    { id: "visits", label: "Visits" },
    { id: "liveTeam", label: "Live Team" },
    { id: "analytics", label: "Analytics" },
];

const VISIT_TYPES = ["Outlet", "Distributor", "Wholesaler", "Dealer"];

const mapCustomerToVisit = (row) => ({
    id: String(row.id),
    date: row.updated_at?.slice?.(0, 10) || row.created_at?.slice?.(0, 10) || "—",
    productive: row.status === "active" ? "Yes" : "No",
    outlet: row.name || "",
    type: capitalizeStatus(row.customer_type || "outlet"),
    order: fmtInr(row.outstanding ?? 0),
    gps: [row.city, row.state].filter(Boolean).join(", ") || "—",
    _raw: row,
});

const ROLE_FOOTER = {
    finance: "Priya Sharma (Finance Department)",
    marketing: "Anita Verma (Marketing Department)",
    shift: "Shift Supervisor (Shift Supervisor)",
};

const ANALYTICS_KPIS = [
    { id: "visits", label: "TOTAL VISITS", footer: "Period total", icon: "📍", iconBg: "#FEE2E2" },
    { id: "productive", label: "PRODUCTIVE", footer: "0 non-productive", icon: "✓", iconBg: "#DCFCE7", footerGreen: true },
    { id: "orders", label: "ORDERS", footer: "From visits", icon: "🛒", iconBg: "#EDE9FE" },
    { id: "distance", label: "DISTANCE", footer: "Route coverage", icon: "🛣️", iconBg: "#FEF3C7" },
];

const FormField = ({ label, required, children }) => (
    <View style={styles.formField}>
        <Text style={styles.formLabel}>
            {label}
            {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
        {children}
    </View>
);

const ScheduleVisitModal = ({ visible, onClose, onSave }) => {
    const [partyId, setPartyId] = useState("0");
    const [visitDate, setVisitDate] = useState("");
    const [visitType, setVisitType] = useState("Outlet");
    const [notes, setNotes] = useState("");

    const resetForm = () => {
        setPartyId("0");
        setVisitDate("");
        setVisitType("Outlet");
        setNotes("");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSave = () => {
        if (!partyId.trim() || !visitDate.trim()) {
            Alert.alert("Required Fields", "Please enter Party ID and Visit Date.");
            return;
        }
        onSave({
            partyId: partyId.trim(),
            visitDate: visitDate.trim(),
            visitType,
            notes: notes.trim(),
        });
        resetForm();
    };

    const cycleVisitType = () => {
        setVisitType((prev) => {
            const index = VISIT_TYPES.indexOf(prev);
            return VISIT_TYPES[(index + 1) % VISIT_TYPES.length];
        });
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <View style={styles.modalOverlay}>
                <Pressable style={styles.modalBackdrop} onPress={handleClose} />
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={styles.modalKeyboard}
                >
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Schedule Field Visit</Text>
                            <TouchableOpacity onPress={handleClose} style={styles.closeButton} activeOpacity={0.85}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <FormField label="PARTY ID" required>
                                <TextInput
                                    style={styles.formInput}
                                    value={partyId}
                                    onChangeText={setPartyId}
                                    keyboardType="numeric"
                                    placeholderTextColor={TEXT_LIGHT}
                                />
                            </FormField>
                            <FormField label="VISIT DATE" required>
                                <View style={styles.dateInputRow}>
                                    <TextInput
                                        style={[styles.formInput, styles.dateInput]}
                                        value={visitDate}
                                        onChangeText={setVisitDate}
                                        placeholder="dd-mm-yyyy"
                                        placeholderTextColor={TEXT_LIGHT}
                                    />
                                    <Text style={styles.calendarIcon}>📅</Text>
                                </View>
                            </FormField>
                            <FormField label="VISIT TYPE">
                                <TouchableOpacity style={styles.pickerField} onPress={cycleVisitType} activeOpacity={0.85}>
                                    <Text style={styles.pickerText}>{visitType}</Text>
                                    <Text style={styles.pickerChevron}>▾</Text>
                                </TouchableOpacity>
                            </FormField>
                            <FormField label="NOTES">
                                <TextInput
                                    style={[styles.formInput, styles.textArea]}
                                    value={notes}
                                    onChangeText={setNotes}
                                    placeholderTextColor={TEXT_LIGHT}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </FormField>
                        </ScrollView>
                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={handleClose} activeOpacity={0.85} style={styles.cancelButton}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} activeOpacity={0.9} style={styles.saveButton}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const VisitCard = ({ item }) => (
    <View style={styles.dataCard}>
        <View style={styles.dataCardTop}>
            <View>
                <Text style={styles.fieldLabel}>DATE</Text>
                <Text style={styles.dataValue}>{item.date}</Text>
            </View>
            <View style={[styles.badge, item.productive === "Yes" && styles.badgeGreen]}>
                <Text style={styles.fieldLabel}>PRODUCTIVE</Text>
                <Text style={[styles.badgeText, item.productive === "Yes" && styles.badgeTextGreen]}>
                    {item.productive}
                </Text>
            </View>
        </View>
        <View style={styles.dataField}>
            <Text style={styles.fieldLabel}>OUTLET</Text>
            <Text style={styles.dataTitle}>{item.outlet}</Text>
        </View>
        <View style={styles.dataRow}>
            <View style={styles.dataCol}>
                <Text style={styles.fieldLabel}>TYPE</Text>
                <Text style={styles.dataValue}>{item.type}</Text>
            </View>
            <View style={styles.dataCol}>
                <Text style={styles.fieldLabel}>ORDER</Text>
                <Text style={styles.dataHighlight}>{item.order}</Text>
            </View>
        </View>
        <View style={styles.dataField}>
            <Text style={styles.fieldLabel}>GPS</Text>
            <Text style={styles.dataValue}>{item.gps}</Text>
        </View>
    </View>
);

const LiveTeamCard = ({ item }) => (
    <View style={styles.dataCard}>
        <View style={styles.dataField}>
            <Text style={styles.fieldLabel}>SALES OFFICER</Text>
            <Text style={styles.dataTitle}>{item.salesOfficer}</Text>
        </View>
        <View style={styles.dataRow}>
            <View style={styles.dataCol}>
                <Text style={styles.fieldLabel}>ROLE</Text>
                <Text style={styles.dataValue}>{item.role}</Text>
            </View>
            <View style={styles.dataCol}>
                <Text style={styles.fieldLabel}>TODAY VISITS</Text>
                <Text style={styles.dataHighlight}>{item.todayVisits}</Text>
            </View>
        </View>
        <View style={styles.dataField}>
            <Text style={styles.fieldLabel}>LAST LOCATION</Text>
            <Text style={styles.dataValue}>{item.lastLocation}</Text>
        </View>
    </View>
);

const RankingCard = ({ item }) => (
    <View style={styles.dataCard}>
        <View style={styles.rankingTop}>
            <View style={styles.rankCircle}>
                <Text style={styles.rankText}>{item.rank}</Text>
            </View>
            <View style={styles.rankingInfo}>
                <Text style={styles.fieldLabel}>OFFICER</Text>
                <Text style={styles.dataTitle}>{item.officer}</Text>
            </View>
        </View>
        <View style={styles.dataRow}>
            <View style={styles.dataCol}>
                <Text style={styles.fieldLabel}>VISITS</Text>
                <Text style={styles.dataValue}>{item.visits}</Text>
            </View>
            <View style={styles.dataCol}>
                <Text style={styles.fieldLabel}>ORDERS</Text>
                <Text style={styles.dataHighlight}>{item.orders}</Text>
            </View>
        </View>
    </View>
);

const KpiCard = ({ item, value, footer }) => (
    <View style={styles.kpiCard}>
        <View style={styles.kpiTop}>
            <Text style={styles.kpiLabel}>{item.label}</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: item.iconBg }]}>
                <Text style={styles.kpiIcon}>{item.icon}</Text>
            </View>
        </View>
        <Text style={styles.kpiValue}>{value}</Text>
        <Text style={[styles.kpiFooter, item.footerGreen && styles.kpiFooterGreen]}>
            {item.footerGreen ? "↑ " : "→ "}
            {footer}
        </Text>
    </View>
);

const SharedSfaDmsScreen = () => {
    const navigation = useFinanceNavigation();
    const [activeTab, setActiveTab] = useState("visits");
    const [visits, setVisits] = useState([]);
    const [liveTeam] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [footerRole, setFooterRole] = useState(ROLE_FOOTER.shift);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await GETNETWORK(buildUrl("customers"), true);
            if (!isApiSuccess(res)) {
                Alert.alert("Error", getApiMessage(res, "Failed to load visits"));
                setVisits([]);
                return;
            }
            setVisits(extractApiList(res).map(mapCustomerToVisit));
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
        if (showModal) {
            setShowModal(false);
            return;
        }
        navigation.goBack();
    }, [navigation, showModal]);

    useEffect(() => {
        if (Platform.OS !== "android") return undefined;
        const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
            if (showModal) {
                setShowModal(false);
                return true;
            }
            navigation.goBack();
            return true;
        });
        return () => subscription.remove();
    }, [navigation, showModal]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    const analytics = useMemo(() => {
        const productiveCount = visits.filter((v) => v.productive === "Yes").length;
        const nonProductive = visits.length - productiveCount;
        const orderTotal = visits.reduce((sum, v) => {
            const amount = String(v.order).replace(/[₹,]/g, "");
            const num = parseFloat(amount) || 0;
            return sum + num;
        }, 0);
        return {
            totalVisits: visits.length,
            productive: productiveCount,
            nonProductive,
            orders: orderTotal === 0 ? "₹0" : `₹${orderTotal}`,
            distance: "0.0 km",
        };
    }, [visits]);

    const rankings = useMemo(() => {
        const map = {};
        visits.forEach((visit) => {
            const key = visit.outlet;
            if (!map[key]) {
                map[key] = { officer: key, visits: 0, orders: 0 };
            }
            map[key].visits += 1;
            const amount = parseFloat(String(visit.order).replace(/[₹,]/g, "")) || 0;
            map[key].orders += amount;
        });
        return Object.values(map)
            .sort((a, b) => b.visits - a.visits)
            .map((row, index) => ({
                id: String(index + 1),
                rank: String(index + 1),
                officer: row.officer,
                visits: String(row.visits),
                orders: row.orders === 0 ? "₹0" : `₹${row.orders}`,
            }));
    }, [visits]);

    const filteredVisits = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return visits;
        return visits.filter(
            (item) =>
                item.date.toLowerCase().includes(query) ||
                item.outlet.toLowerCase().includes(query) ||
                item.type.toLowerCase().includes(query)
        );
    }, [search, visits]);

    const filteredLiveTeam = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return liveTeam;
        return liveTeam.filter(
            (item) =>
                item.salesOfficer.toLowerCase().includes(query) ||
                item.role.toLowerCase().includes(query) ||
                item.lastLocation.toLowerCase().includes(query)
        );
    }, [search, liveTeam]);

    const filteredRankings = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return rankings;
        return rankings.filter((item) => item.officer.toLowerCase().includes(query));
    }, [search, rankings]);

    const handleSaveVisit = (form) => {
        const newVisit = {
            id: String(Date.now()),
            date: form.visitDate,
            outlet: `Party #${form.partyId}`,
            type: form.visitType,
            productive: "No",
            order: "₹0",
            gps: "—",
            notes: form.notes,
        };
        setVisits((prev) => [newVisit, ...prev]);
        setShowModal(false);
    };

    const listData =
        activeTab === "visits"
            ? filteredVisits
            : activeTab === "liveTeam"
              ? filteredLiveTeam
              : filteredRankings;

    const renderItem = ({ item }) => {
        if (activeTab === "visits") return <VisitCard item={item} />;
        if (activeTab === "liveTeam") return <LiveTeamCard item={item} />;
        return <RankingCard item={item} />;
    };

    const emptyText =
        activeTab === "visits"
            ? "No field visits yet"
            : activeTab === "liveTeam"
              ? "No live team data yet"
              : "No ranking data yet";

    const sectionTitle =
        activeTab === "visits"
            ? "Field Visits"
            : activeTab === "liveTeam"
              ? "Live Team Status"
              : "Sales Officer Ranking";

    const listHeader = (
        <View>
            <View style={styles.subAdminBanner}>
                <Text style={styles.subAdminBannerText}>Sub Admin Access</Text>
            </View>

            <View style={styles.pageHeader}>
                <Text style={styles.pageTitle}>Sales Force Automation</Text>
                <Text style={styles.pageSubtitle}>
                    GPS visits, beat coverage, team tracking & performance
                </Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tabScroll}
                contentContainerStyle={styles.tabRow}
            >
                {TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[styles.tabPill, activeTab === tab.id && styles.tabPillActive]}
                        onPress={() => {
                            setActiveTab(tab.id);
                            setSearch("");
                        }}
                        activeOpacity={0.85}
                    >
                        <Text style={[styles.tabPillText, activeTab === tab.id && styles.tabPillTextActive]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {activeTab === "analytics" ? (
                <View style={styles.kpiGrid}>
                    <KpiCard
                        item={ANALYTICS_KPIS[0]}
                        value={String(analytics.totalVisits)}
                        footer="Period total"
                    />
                    <KpiCard
                        item={ANALYTICS_KPIS[1]}
                        value={String(analytics.productive)}
                        footer={`${analytics.nonProductive} non-productive`}
                    />
                    <KpiCard item={ANALYTICS_KPIS[2]} value={analytics.orders} footer="From visits" />
                    <KpiCard item={ANALYTICS_KPIS[3]} value={analytics.distance} footer="Route coverage" />
                </View>
            ) : null}

            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>{sectionTitle}</Text>
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
                title="SFA/DMS"
                backgroundColor={WHITE}
                onBackPress={handleBack}
            />

            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={listData}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
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
                            <Text style={styles.emptyText}>{emptyText}</Text>
                        </View>
                    }
                />

                <TouchableOpacity
                    style={styles.fab}
                    activeOpacity={0.9}
                    onPress={() => setShowModal(true)}
                >
                    <Text style={styles.fabIcon}>+</Text>
                </TouchableOpacity>

                <ScheduleVisitModal
                    visible={showModal}
                    onClose={() => setShowModal(false)}
                    onSave={handleSaveVisit}
                />
            </SafeAreaView>
        </View>
    );
};

export default SharedSfaDmsScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: SCREEN_BG },
    safeArea: { flex: 1 },
    listContent: { paddingHorizontal: 16, paddingBottom: 88 },
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
    pageHeader: { paddingTop: 12, paddingBottom: 12 },
    pageTitle: { fontFamily: UBUNTUBOLD, fontSize: 22, color: TEXT_DARK, marginBottom: 6 },
    pageSubtitle: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_MUTED, lineHeight: 18 },
    tabScroll: { marginBottom: 14 },
    tabRow: { gap: 8, paddingRight: 8 },
    tabPill: {
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 20,
        backgroundColor: CARD_BG,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        marginRight: 8,
    },
    tabPillActive: { backgroundColor: PRIMARY_BLUE, borderColor: PRIMARY_BLUE },
    tabPillText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 12, color: TEXT_MUTED },
    tabPillTextActive: { color: WHITE },
    kpiGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 14,
        justifyContent: "space-between",
    },
    kpiCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        width: "48%",
    },
    kpiTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    kpiLabel: {
        flex: 1,
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 9,
        color: TEXT_MUTED,
        letterSpacing: 0.3,
    },
    kpiIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    kpiIcon: { fontSize: 14 },
    kpiValue: { fontFamily: UBUNTUBOLD, fontSize: 22, color: TEXT_DARK, marginBottom: 4 },
    kpiFooter: { fontFamily: FIRASANS, fontSize: 11, color: TEXT_MUTED },
    kpiFooterGreen: { color: GREEN },
    sectionCard: {
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
    dataCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    dataCardTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    dataField: { marginBottom: 12 },
    dataRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
    dataCol: { flex: 1 },
    fieldLabel: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 9,
        color: TEXT_MUTED,
        letterSpacing: 0.4,
        marginBottom: 4,
    },
    dataTitle: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: TEXT_DARK, lineHeight: 20 },
    dataValue: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_DARK },
    dataHighlight: { fontFamily: UBUNTUBOLD, fontSize: 15, color: TEXT_DARK },
    badge: {
        backgroundColor: "#F3F4F6",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignItems: "flex-end",
    },
    badgeGreen: { backgroundColor: "#ECFDF5" },
    badgeText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 11, color: TEXT_MUTED },
    badgeTextGreen: { color: GREEN },
    rankingTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
    rankCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#DBEAFE",
        justifyContent: "center",
        alignItems: "center",
    },
    rankText: { fontFamily: UBUNTUBOLD, fontSize: 14, color: PRIMARY_BLUE },
    rankingInfo: { flex: 1 },
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
    fab: {
        position: "absolute",
        right: 20,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: GREEN,
        justifyContent: "center",
        alignItems: "center",
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
    },
    fabIcon: {
        fontFamily: UBUNTUBOLD,
        fontSize: 28,
        color: WHITE,
        lineHeight: 30,
        marginTop: -2,
    },
    modalOverlay: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
    modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
    modalKeyboard: { width: "100%", zIndex: 1 },
    modalCard: {
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: 20,
        maxHeight: "88%",
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: { fontFamily: UBUNTUBOLD, fontSize: 20, color: TEXT_DARK },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
    },
    closeButtonText: { fontSize: 16, color: TEXT_MUTED },
    formField: { marginBottom: 16 },
    formLabel: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 11,
        color: TEXT_MUTED,
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    required: { color: RED },
    formInput: {
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontFamily: FIRASANS,
        fontSize: 15,
        color: TEXT_DARK,
    },
    textArea: { minHeight: 96, paddingTop: 12 },
    pickerField: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    pickerText: { fontFamily: FIRASANS, fontSize: 15, color: TEXT_DARK },
    pickerChevron: { fontSize: 12, color: TEXT_MUTED },
    dateInputRow: { position: "relative", justifyContent: "center" },
    dateInput: { paddingRight: 44 },
    calendarIcon: { position: "absolute", right: 14, fontSize: 18 },
    modalActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 16,
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
    },
    cancelButton: { paddingVertical: 10, paddingHorizontal: 8 },
    cancelButtonText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: TEXT_MUTED },
    saveButton: {
        backgroundColor: PRIMARY_BLUE,
        borderRadius: 10,
        paddingVertical: 11,
        paddingHorizontal: 22,
    },
    saveButtonText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: WHITE },
});
