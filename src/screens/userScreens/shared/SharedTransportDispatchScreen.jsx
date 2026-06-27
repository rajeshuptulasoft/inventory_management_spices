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
    POSTNETWORK,
    extractApiList,
    getApiMessage,
    isApiSuccess,
    mapSalesOrderRow,
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
    { id: "dispatch", label: "Dispatch" },
    { id: "trips", label: "Trips" },
    { id: "vehicles", label: "Vehicles" },
];

const DISPATCH_STATUSES = ["Pending", "Dispatched", "Delivered", "Cancelled"];

const mapOrderToDispatch = (row) => {
    const base = mapSalesOrderRow(row);
    return {
        id: base.id,
        dispatchId: row.dispatch_number || base.orderId,
        orderId: base.id,
        vehicleId: String(row.vehicle_id ?? "0"),
        date: row.order_date || row.dispatch_date || base.date,
        status: base.status,
        _raw: row,
    };
};

const ROLE_FOOTER = {
    finance: "Priya Sharma (Finance Department)",
    marketing: "Anita Verma (Marketing Department)",
    shift: "Shift Supervisor (Shift Supervisor)",
};

const FormField = ({ label, required, children }) => (
    <View style={styles.formField}>
        <Text style={styles.formLabel}>
            {label}
            {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
        {children}
    </View>
);

const DispatchNoteModal = ({ visible, editingItem, onClose, onSave }) => {
    const [dispatchNo, setDispatchNo] = useState("");
    const [orderId, setOrderId] = useState("0");
    const [vehicleId, setVehicleId] = useState("0");
    const [dispatchDate, setDispatchDate] = useState("");
    const [status, setStatus] = useState("Pending");

    useEffect(() => {
        if (visible) {
            setDispatchNo(editingItem?.dispatchId ?? "");
            setOrderId(editingItem?.orderId ?? "0");
            setVehicleId(editingItem?.vehicleId ?? "0");
            setDispatchDate(editingItem?.date ?? "");
            setStatus(editingItem?.status ?? "Pending");
        }
    }, [visible, editingItem]);

    const resetForm = () => {
        setDispatchNo("");
        setOrderId("0");
        setVehicleId("0");
        setDispatchDate("");
        setStatus("Pending");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSave = () => {
        if (!dispatchNo.trim()) {
            Alert.alert("Required Fields", "Please enter Dispatch No.");
            return;
        }
        onSave({
            id: editingItem?.id,
            dispatchId: dispatchNo.trim(),
            orderId: orderId.trim(),
            vehicleId: vehicleId.trim(),
            date: dispatchDate.trim(),
            status,
        });
        resetForm();
    };

    const cycleStatus = () => {
        setStatus((prev) => {
            const index = DISPATCH_STATUSES.indexOf(prev);
            return DISPATCH_STATUSES[(index + 1) % DISPATCH_STATUSES.length];
        });
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <View style={styles.modalOverlay}>
                <Pressable style={styles.modalBackdrop} onPress={handleClose} />
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalKeyboard}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Dispatch Note</Text>
                            <TouchableOpacity onPress={handleClose} style={styles.closeButton} activeOpacity={0.85}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <FormField label="DISPATCH NO" required>
                                <TextInput
                                    style={styles.formInput}
                                    value={dispatchNo}
                                    onChangeText={setDispatchNo}
                                    placeholderTextColor={TEXT_LIGHT}
                                    autoCapitalize="characters"
                                />
                            </FormField>
                            <FormField label="ORDER ID">
                                <TextInput
                                    style={styles.formInput}
                                    value={orderId}
                                    onChangeText={setOrderId}
                                    keyboardType="numeric"
                                    placeholderTextColor={TEXT_LIGHT}
                                />
                            </FormField>
                            <FormField label="VEHICLE ID">
                                <TextInput
                                    style={styles.formInput}
                                    value={vehicleId}
                                    onChangeText={setVehicleId}
                                    keyboardType="numeric"
                                    placeholderTextColor={TEXT_LIGHT}
                                />
                            </FormField>
                            <FormField label="DISPATCH DATE">
                                <View style={styles.dateInputRow}>
                                    <TextInput
                                        style={[styles.formInput, styles.dateInput]}
                                        value={dispatchDate}
                                        onChangeText={setDispatchDate}
                                        placeholder="dd-mm-yyyy"
                                        placeholderTextColor={TEXT_LIGHT}
                                    />
                                    <Text style={styles.calendarIcon}>📅</Text>
                                </View>
                            </FormField>
                            <FormField label="STATUS">
                                <TouchableOpacity style={styles.pickerField} onPress={cycleStatus} activeOpacity={0.85}>
                                    <Text style={styles.pickerText}>{status}</Text>
                                    <Text style={styles.pickerChevron}>▾</Text>
                                </TouchableOpacity>
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

const DispatchCard = ({ item, onEdit, onDelete }) => (
    <View style={styles.dataCard}>
        <View style={styles.dataCardTop}>
            <View style={styles.dataCol}>
                <Text style={styles.fieldLabel}>DISPATCH</Text>
                <Text style={styles.linkText}>{item.dispatchId}</Text>
            </View>
            <View style={[styles.statusBadge, item.status === "Pending" && styles.statusPending]}>
                {item.status === "Pending" ? <View style={styles.statusDot} /> : null}
                <Text style={[styles.statusText, item.status === "Pending" && styles.statusPendingText]}>{item.status}</Text>
            </View>
        </View>
        <View style={styles.metaRow}>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>DATE</Text>
                <Text style={styles.metaValue}>{item.date || "—"}</Text>
            </View>
        </View>
        <View style={styles.actionRow}>
            <TouchableOpacity style={styles.editButton} activeOpacity={0.85} onPress={() => onEdit(item)}>
                <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} activeOpacity={0.85} onPress={() => onDelete(item)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
        </View>
    </View>
);

const TripCard = ({ item }) => (
    <View style={styles.dataCard}>
        <View style={styles.dataCardTop}>
            <View style={styles.dataCol}>
                <Text style={styles.fieldLabel}>TRIP</Text>
                <Text style={styles.linkText}>{item.tripId}</Text>
            </View>
            <View style={styles.statusBadgeBlue}>
                <View style={styles.statusDotBlue} />
                <Text style={styles.statusTextBlue}>{item.status}</Text>
            </View>
        </View>
        <View style={styles.metaRow}>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>VEHICLE</Text>
                <Text style={styles.metaValue}>{item.vehicle}</Text>
            </View>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>DISTANCE</Text>
                <Text style={styles.metaValue}>{item.distance}</Text>
            </View>
        </View>
        <View style={styles.metaRow}>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>FUEL</Text>
                <Text style={styles.metaValue}>{item.fuel}</Text>
            </View>
        </View>
    </View>
);

const VehicleCard = ({ item }) => (
    <View style={styles.dataCard}>
        <View style={styles.dataCardTop}>
            <View style={styles.dataCol}>
                <Text style={styles.fieldLabel}>VEHICLE NO</Text>
                <Text style={styles.linkText}>{item.vehicleNo}</Text>
            </View>
            <View style={styles.statusBadgeBlue}>
                <View style={styles.statusDotBlue} />
                <Text style={styles.statusTextBlue}>{item.status}</Text>
            </View>
        </View>
        <View style={styles.metaRow}>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>TYPE</Text>
                <Text style={styles.metaValue}>{item.type}</Text>
            </View>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>DRIVER</Text>
                <Text style={styles.metaValue}>{item.driver}</Text>
            </View>
        </View>
        <View style={styles.metaRow}>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>CAPACITY</Text>
                <Text style={styles.metaValue}>{item.capacity}</Text>
            </View>
        </View>
    </View>
);

const SharedTransportDispatchScreen = () => {
    const navigation = useFinanceNavigation();
    const [activeTab, setActiveTab] = useState("dispatch");
    const [dispatches, setDispatches] = useState([]);
    const [trips] = useState([]);
    const [vehicles] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [footerRole, setFooterRole] = useState(ROLE_FOOTER.shift);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await GETNETWORK(buildUrl("fmcg/sales-orders", "limit=100"), true);
            if (!isApiSuccess(res)) {
                Alert.alert("Error", getApiMessage(res, "Failed to load dispatches"));
                setDispatches([]);
                return;
            }
            setDispatches(extractApiList(res).map(mapOrderToDispatch));
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
            setEditingItem(null);
            return;
        }
        navigation.goBack();
    }, [navigation, showModal]);

    useEffect(() => {
        if (Platform.OS !== "android") return undefined;
        const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
            if (showModal) {
                setShowModal(false);
                setEditingItem(null);
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

    const filteredDispatches = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return dispatches;
        return dispatches.filter(
            (item) =>
                item.dispatchId.toLowerCase().includes(q) ||
                item.status.toLowerCase().includes(q) ||
                (item.date || "").toLowerCase().includes(q)
        );
    }, [dispatches, search]);

    const filteredTrips = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return trips;
        return trips.filter(
            (item) =>
                item.tripId.toLowerCase().includes(q) ||
                item.vehicle.toLowerCase().includes(q) ||
                item.status.toLowerCase().includes(q)
        );
    }, [trips, search]);

    const filteredVehicles = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return vehicles;
        return vehicles.filter(
            (item) =>
                item.vehicleNo.toLowerCase().includes(q) ||
                item.driver.toLowerCase().includes(q) ||
                item.type.toLowerCase().includes(q)
        );
    }, [vehicles, search]);

    const openAddModal = () => {
        setEditingItem(null);
        setShowModal(true);
    };

    const handleDeliver = (item) => {
        Alert.alert("Mark Delivered", `Deliver order ${item.dispatchId}?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Deliver",
                onPress: async () => {
                    const res = await POSTNETWORK(buildUrl(`fmcg/sales-orders/${item.id}/deliver`), {}, true);
                    if (!isApiSuccess(res)) {
                        Alert.alert("Error", getApiMessage(res, "Deliver failed"));
                        return;
                    }
                    loadData();
                },
            },
        ]);
    };

    const openEditModal = (item) => {
        const status = String(item.status || "").toLowerCase();
        if (["approved", "partial", "dispatched", "pending"].includes(status)) {
            handleDeliver(item);
            return;
        }
        setEditingItem(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
    };

    const handleSaveDispatch = () => {
        closeModal();
    };

    const handleDelete = (item) => {
        Alert.alert("Remove", `Remove ${item.dispatchId} from list?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Remove",
                style: "destructive",
                onPress: () => setDispatches((prev) => prev.filter((row) => row.id !== item.id)),
            },
        ]);
    };

    const listData =
        activeTab === "dispatch" ? filteredDispatches : activeTab === "trips" ? filteredTrips : filteredVehicles;

    const renderItem = ({ item }) => {
        if (activeTab === "dispatch") {
            return <DispatchCard item={item} onEdit={openEditModal} onDelete={handleDelete} />;
        }
        if (activeTab === "trips") {
            return <TripCard item={item} />;
        }
        return <VehicleCard item={item} />;
    };

    const summaryLabel =
        activeTab === "dispatch" ? "TOTAL RECORDS" : activeTab === "trips" ? "TRIPS" : "VEHICLES";
    const summaryValue =
        activeTab === "dispatch" ? dispatches.length : activeTab === "trips" ? trips.length : vehicles.length;
    const summaryFooter =
        activeTab === "dispatch"
            ? "→ From database"
            : activeTab === "trips"
              ? "→ Vehicle trips"
              : "→ Fleet registry";

    const sectionTitle =
        activeTab === "dispatch"
            ? "Transport & Dispatch"
            : activeTab === "trips"
              ? "Vehicle Trips"
              : "Fleet Registry";

    const listHeader = (
        <View>
            <View style={styles.subAdminBanner}>
                <Text style={styles.subAdminBannerText}>Sub Admin Access</Text>
            </View>

            <View style={styles.pageHeader}>
                <Text style={styles.pageTitle}>Transport & Dispatch</Text>
                <Text style={styles.pageSubtitle}>Dispatch notes, vehicle trips, fuel cost & POD</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabRow}>
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
                        <Text style={[styles.tabPillText, activeTab === tab.id && styles.tabPillTextActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {activeTab === "dispatch" ? (
                <View style={styles.sectionIntro}>
                    <View style={styles.sectionIntroText}>
                        <Text style={styles.sectionIntroTitle}>Transport & Dispatch</Text>
                        <Text style={styles.sectionIntroSubtitle}>Vehicle allocation, dispatch notes & POD</Text>
                    </View>
                    <TouchableOpacity style={styles.dispatchNoteButton} activeOpacity={0.9} onPress={openAddModal}>
                        <Text style={styles.dispatchNoteButtonText}>+ Dispatch Note</Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            <View style={styles.summaryCard}>
                <View style={styles.summaryTop}>
                    <Text style={styles.summaryLabel}>{summaryLabel}</Text>
                    <View style={styles.summaryIconWrap}>
                        <Text style={styles.summaryIcon}>📊</Text>
                    </View>
                </View>
                <Text style={styles.summaryValue}>{summaryValue}</Text>
                <Text style={styles.summaryFooter}>{summaryFooter}</Text>
            </View>

            <View style={styles.listSection}>
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
        <Text style={styles.footerText}>SpiceCraft ERP v3.0 • Logged in as {footerRole} • 29</Text>
    );

    return (
        <View style={styles.root}>
            <MyHeader
                showBack
                showCenterTitle
                title="Transport & Dispatch"
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
                            <Text style={styles.emptyText}>
                                {activeTab === "dispatch"
                                    ? "No dispatch notes found"
                                    : activeTab === "trips"
                                      ? "No trips found"
                                      : "No vehicles found"}
                            </Text>
                        </View>
                    }
                />

                {activeTab === "dispatch" ? (
                    <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={openAddModal}>
                        <Text style={styles.fabIcon}>+</Text>
                    </TouchableOpacity>
                ) : null}

                <DispatchNoteModal
                    visible={showModal}
                    editingItem={editingItem}
                    onClose={closeModal}
                    onSave={handleSaveDispatch}
                />
            </SafeAreaView>
        </View>
    );
};

export default SharedTransportDispatchScreen;

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
    },
    tabPillActive: { backgroundColor: PRIMARY_BLUE, borderColor: PRIMARY_BLUE },
    tabPillText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 12, color: TEXT_MUTED },
    tabPillTextActive: { color: WHITE },
    sectionIntro: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
        gap: 12,
    },
    sectionIntroText: { flex: 1 },
    sectionIntroTitle: { fontFamily: UBUNTUBOLD, fontSize: 16, color: TEXT_DARK, marginBottom: 4 },
    sectionIntroSubtitle: { fontFamily: FIRASANS, fontSize: 12, color: TEXT_MUTED, lineHeight: 16 },
    dispatchNoteButton: {
        backgroundColor: PRIMARY_BLUE,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    dispatchNoteButtonText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 12, color: WHITE },
    summaryCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        marginBottom: 12,
        maxWidth: 200,
    },
    summaryTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
    summaryLabel: { fontFamily: FIRASANSSEMIBOLD, fontSize: 10, color: TEXT_MUTED, letterSpacing: 0.4 },
    summaryIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: "#DBEAFE",
        justifyContent: "center",
        alignItems: "center",
    },
    summaryIcon: { fontSize: 14 },
    summaryValue: { fontFamily: UBUNTUBOLD, fontSize: 28, color: TEXT_DARK, marginBottom: 4 },
    summaryFooter: { fontFamily: FIRASANS, fontSize: 11, color: TEXT_MUTED },
    listSection: { marginBottom: 10 },
    sectionTitle: { fontFamily: UBUNTUBOLD, fontSize: 16, color: TEXT_DARK, marginBottom: 10 },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: CARD_BG,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        paddingHorizontal: 12,
    },
    searchIcon: { fontSize: 14, marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 11, fontFamily: FIRASANS, fontSize: 14, color: TEXT_DARK },
    dataCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    dataCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 8 },
    dataCol: { flex: 1 },
    fieldLabel: { fontFamily: FIRASANSSEMIBOLD, fontSize: 9, color: TEXT_MUTED, letterSpacing: 0.4, marginBottom: 4 },
    linkText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 14, color: PRIMARY_BLUE },
    metaRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
    metaCol: { flex: 1 },
    metaValue: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_DARK },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ECFDF5",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    statusPending: { backgroundColor: "#FEF3C7" },
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN },
    statusText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 11, color: GREEN },
    statusPendingText: { color: "#D97706" },
    statusBadgeBlue: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#DBEAFE",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    statusDotBlue: { width: 6, height: 6, borderRadius: 3, backgroundColor: PRIMARY_BLUE },
    statusTextBlue: { fontFamily: FIRASANSSEMIBOLD, fontSize: 11, color: PRIMARY_BLUE },
    actionRow: { flexDirection: "row", gap: 10, marginTop: 4 },
    editButton: {
        flex: 1,
        backgroundColor: PRIMARY_BLUE,
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: "center",
    },
    editButtonText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 13, color: WHITE },
    deleteButton: {
        flex: 1,
        backgroundColor: "#FEE2E2",
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#FECACA",
    },
    deleteButtonText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 13, color: RED },
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
        backgroundColor: PRIMARY_BLUE,
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
