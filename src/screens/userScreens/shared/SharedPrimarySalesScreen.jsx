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
    mapSalesOrderRow,
    capitalizeStatus,
    logScreenApi,
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
const AMBER = "#D97706";

const TYPE_OPTIONS = ["Primary", "Secondary"];
const PAYMENT_OPTIONS = ["Credit", "Cash"];

const ROLE_FOOTER = {
    finance: "Priya Sharma (Finance Department)",
    marketing: "Anita Verma (Marketing Department)",
    shift: "Shift Supervisor (Shift Supervisor)",
};

const SALES_TYPE = "primary";

const mapOrderToSalesUi = (row) => {
    const base = mapSalesOrderRow(row);
    const rawType = row.order_type || row.type || row.sales_type || "primary";
    return {
        id: base.id,
        orderId: base.orderId,
        customer: row.customer_name || row.retailer_name || base.distributor,
        type: capitalizeStatus(rawType),
        amount: base.amount,
        status: base.status,
        partyId: String(row.party_id ?? row.distributor_id ?? row.retailer_id ?? ""),
        channel: row.channel || "",
        orderDate: row.order_date || base.date,
        payment: capitalizeStatus(row.payment_mode || row.payment || "credit"),
        _raw: row,
    };
};

const matchesSalesType = (row) => {
    const t = String(row._raw?.order_type || row._raw?.type || row._raw?.sales_type || "").toLowerCase();
    if (!t) return true;
    return t.includes(SALES_TYPE);
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

const NewOrderModal = ({ visible, editingItem, onClose, onSave }) => {
    const [orderNo, setOrderNo] = useState("");
    const [partyId, setPartyId] = useState("0");
    const [type, setType] = useState("Primary");
    const [channel, setChannel] = useState("");
    const [orderDate, setOrderDate] = useState("");
    const [payment, setPayment] = useState("Credit");

    useEffect(() => {
        if (visible) {
            setOrderNo(editingItem?.orderId ?? "");
            setPartyId(editingItem?.partyId ?? "0");
            setType(editingItem?.type ?? "Primary");
            setChannel(editingItem?.channel ?? "");
            setOrderDate(editingItem?.orderDate ?? "");
            setPayment(editingItem?.payment ?? "Credit");
        }
    }, [visible, editingItem]);

    const resetForm = () => {
        setOrderNo("");
        setPartyId("0");
        setType("Primary");
        setChannel("");
        setOrderDate("");
        setPayment("Credit");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSave = () => {
        if (!orderNo.trim() || !partyId.trim() || !orderDate.trim()) {
            Alert.alert("Required Fields", "Please enter Order No, Party ID, and Order Date.");
            return;
        }
        onSave({
            id: editingItem?.id,
            orderNo: orderNo.trim(),
            partyId: partyId.trim(),
            type,
            channel: channel.trim(),
            orderDate: orderDate.trim(),
            payment,
            customer: editingItem?.customer,
            amount: editingItem?.amount,
            status: editingItem?.status,
        });
        resetForm();
    };

    const cycleType = () => {
        setType((prev) => TYPE_OPTIONS[(TYPE_OPTIONS.indexOf(prev) + 1) % TYPE_OPTIONS.length]);
    };

    const cyclePayment = () => {
        setPayment((prev) => PAYMENT_OPTIONS[(PAYMENT_OPTIONS.indexOf(prev) + 1) % PAYMENT_OPTIONS.length]);
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
                            <Text style={styles.modalTitle}>
                                {editingItem ? "Edit Order" : "New Order"}
                            </Text>
                            <TouchableOpacity onPress={handleClose} style={styles.closeButton} activeOpacity={0.85}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <FormField label="ORDER NO" required>
                                <TextInput
                                    style={styles.formInput}
                                    value={orderNo}
                                    onChangeText={setOrderNo}
                                    placeholderTextColor={TEXT_LIGHT}
                                    autoCapitalize="characters"
                                />
                            </FormField>

                            <FormField label="PARTY ID" required>
                                <TextInput
                                    style={styles.formInput}
                                    value={partyId}
                                    onChangeText={setPartyId}
                                    keyboardType="numeric"
                                    placeholderTextColor={TEXT_LIGHT}
                                />
                            </FormField>

                            <FormField label="TYPE">
                                <TouchableOpacity style={styles.pickerField} onPress={cycleType} activeOpacity={0.85}>
                                    <Text style={styles.pickerText}>{type}</Text>
                                    <Text style={styles.pickerChevron}>▾</Text>
                                </TouchableOpacity>
                            </FormField>

                            <FormField label="CHANNEL">
                                <TextInput
                                    style={styles.formInput}
                                    value={channel}
                                    onChangeText={setChannel}
                                    placeholderTextColor={TEXT_LIGHT}
                                />
                            </FormField>

                            <FormField label="ORDER DATE" required>
                                <View style={styles.dateField}>
                                    <TextInput
                                        style={styles.dateInput}
                                        value={orderDate}
                                        onChangeText={setOrderDate}
                                        placeholder="dd-mm-yyyy"
                                        placeholderTextColor={TEXT_LIGHT}
                                    />
                                    <Text style={styles.dateIcon}>📅</Text>
                                </View>
                            </FormField>

                            <FormField label="PAYMENT">
                                <TouchableOpacity style={styles.pickerField} onPress={cyclePayment} activeOpacity={0.85}>
                                    <Text style={styles.pickerText}>{payment}</Text>
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

const SalesCard = ({ item, onEdit, onDelete }) => {
    const isApproved = item.status === "Approved";
    const isPending = item.status === "Pending";

    return (
        <View style={styles.salesCard}>
            <View style={styles.cardGrid}>
                <View style={styles.gridColOrder}>
                    <Text style={styles.fieldLabel}>ORDER</Text>
                    <Text style={styles.orderIdText}>{item.orderId}</Text>
                </View>
                <View style={styles.gridColCustomer}>
                    <Text style={styles.fieldLabel}>CUSTOMER</Text>
                    <Text style={styles.customerText}>{item.customer}</Text>
                </View>
            </View>

            <View style={styles.cardGrid}>
                <View style={styles.gridCol}>
                    <Text style={styles.fieldLabel}>TYPE</Text>
                    <Text style={styles.metaValue}>{item.type}</Text>
                </View>
                <View style={styles.gridCol}>
                    <Text style={styles.fieldLabel}>AMOUNT</Text>
                    <Text style={styles.amountValue}>{item.amount}</Text>
                </View>
            </View>

            <View style={styles.cardGrid}>
                <View style={styles.gridCol}>
                    <Text style={styles.fieldLabel}>STATUS</Text>
                    <View
                        style={[
                            styles.statusBadge,
                            isApproved && styles.statusApproved,
                            isPending && styles.statusPending,
                        ]}
                    >
                        <View
                            style={[
                                styles.statusDot,
                                isApproved && styles.statusDotApproved,
                                isPending && styles.statusDotPending,
                            ]}
                        />
                        <Text
                            style={[
                                styles.statusText,
                                isApproved && styles.statusTextApproved,
                                isPending && styles.statusTextPending,
                            ]}
                        >
                            {item.status}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.actionSection}>
                <Text style={styles.fieldLabel}>ACTIONS</Text>
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.editButton} activeOpacity={0.85} onPress={() => onEdit(item)}>
                        <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} activeOpacity={0.85} onPress={() => onDelete(item)}>
                        <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const SharedPrimarySalesScreen = () => {
    const navigation = useFinanceNavigation();
    const [sales, setSales] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [footerRole, setFooterRole] = useState(ROLE_FOOTER.shift);

    useEffect(() => {
        getObjByKey("loginResponse").then((session) => {
            const role = session?.role;
            if (role && ROLE_FOOTER[role]) {
                setFooterRole(ROLE_FOOTER[role]);
            }
        });
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await GETNETWORK(buildUrl("fmcg/sales-orders", "limit=100"), true);
            logScreenApi("SharedPrimarySalesScreen", "fmcg/sales-orders", res, buildUrl("fmcg/sales-orders", "limit=100"));
            if (!isApiSuccess(res)) {
                Alert.alert("Error", getApiMessage(res, "Failed to load sales orders"));
                setSales([]);
                return;
            }
            setSales(extractApiList(res).map(mapOrderToSalesUi).filter(matchesSalesType));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

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
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            if (showModal) {
                setShowModal(false);
                setEditingItem(null);
                return true;
            }
            navigation.goBack();
            return true;
        });
        return () => sub.remove();
    }, [navigation, showModal]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    const filteredSales = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return sales;
        return sales.filter(
            (item) =>
                item.orderId.toLowerCase().includes(query) ||
                item.customer.toLowerCase().includes(query) ||
                item.type.toLowerCase().includes(query) ||
                item.status.toLowerCase().includes(query)
        );
    }, [search, sales]);

    const openAddModal = () => {
        setEditingItem(null);
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
    };

    const handleSaveOrder = (form) => {
        const payload = {
            orderId: form.orderNo,
            customer: form.customer ?? `Party #${form.partyId}`,
            type: form.type,
            amount: form.amount ?? "₹0",
            status: form.status ?? "Pending",
            partyId: form.partyId,
            channel: form.channel,
            orderDate: form.orderDate,
            payment: form.payment,
        };
        if (form.id) {
            setSales((prev) =>
                prev.map((item) => (item.id === form.id ? { ...item, ...payload } : item))
            );
        } else {
            setSales((prev) => [...prev, { id: String(Date.now()), ...payload }]);
        }
        closeModal();
    };

    const handleDelete = (item) => {
        Alert.alert("Delete Order", `Delete ${item.orderId}?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => setSales((prev) => prev.filter((row) => row.id !== item.id)),
            },
        ]);
    };

    const listHeader = (
        <View>
            <View style={styles.subAdminBanner}>
                <Text style={styles.subAdminBannerText}>Sub Admin Access</Text>
            </View>

            <View style={styles.pageHeader}>
                <Text style={styles.pageTitle}>Primary Sales</Text>
                <Text style={styles.pageSubtitle}>Manufacturer → Distributor sales orders</Text>
            </View>

            <View style={styles.summaryCard}>
                <View style={styles.summaryTop}>
                    <Text style={styles.summaryLabel}>TOTAL RECORDS</Text>
                    <View style={styles.summaryIconWrap}>
                        <Text style={styles.summaryIcon}>📊</Text>
                    </View>
                </View>
                <Text style={styles.summaryValue}>{sales.length}</Text>
                <Text style={styles.summaryFooter}>
                    {loading ? "→ Loading..." : sales.length ? "→ From database" : "→ No records"}
                </Text>
            </View>

            <View style={styles.listSection}>
                <Text style={styles.sectionTitle}>Primary Sales</Text>
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
                title="Primary Sales"
                backgroundColor={WHITE}
                onBackPress={handleBack}
            />

            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={filteredSales}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <SalesCard item={item} onEdit={openEditModal} onDelete={handleDelete} />
                    )}
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
                        !loading ? (
                            <View style={styles.emptyWrap}>
                                <Text style={styles.emptyText}>No sales records found</Text>
                            </View>
                        ) : null
                    }
                />

                <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={openAddModal}>
                    <Text style={styles.fabIcon}>+</Text>
                </TouchableOpacity>

                <NewOrderModal
                    visible={showModal}
                    editingItem={editingItem}
                    onClose={closeModal}
                    onSave={handleSaveOrder}
                />
            </SafeAreaView>
        </View>
    );
};

export default SharedPrimarySalesScreen;

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
    pageHeader: { paddingTop: 12, paddingBottom: 14 },
    pageTitle: { fontFamily: UBUNTUBOLD, fontSize: 22, color: TEXT_DARK, marginBottom: 6 },
    pageSubtitle: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_MUTED, lineHeight: 18 },
    summaryCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        marginBottom: 12,
        maxWidth: 220,
    },
    summaryTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    summaryLabel: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 10,
        color: TEXT_MUTED,
        letterSpacing: 0.3,
    },
    summaryIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: "#DBEAFE",
        justifyContent: "center",
        alignItems: "center",
    },
    summaryIcon: { fontSize: 16 },
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
    salesCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    cardGrid: { flexDirection: "row", gap: 10, marginBottom: 12, alignItems: "flex-start" },
    gridColOrder: { width: "38%" },
    gridColCustomer: { flex: 1 },
    gridCol: { flex: 1 },
    fieldLabel: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 9,
        color: TEXT_MUTED,
        letterSpacing: 0.4,
        marginBottom: 4,
    },
    orderIdText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 13, color: PRIMARY_BLUE },
    customerText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: TEXT_DARK, lineHeight: 20 },
    metaValue: { fontFamily: FIRASANSSEMIBOLD, fontSize: 14, color: TEXT_DARK },
    amountValue: { fontFamily: UBUNTUBOLD, fontSize: 16, color: TEXT_DARK },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: "#F3F4F6",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    statusApproved: { backgroundColor: "#DBEAFE" },
    statusPending: { backgroundColor: "#FEF3C7" },
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: TEXT_MUTED },
    statusDotApproved: { backgroundColor: PRIMARY_BLUE },
    statusDotPending: { backgroundColor: AMBER },
    statusText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 11, color: TEXT_MUTED },
    statusTextApproved: { color: PRIMARY_BLUE },
    statusTextPending: { color: AMBER },
    actionSection: { borderTopWidth: 1, borderTopColor: "#F3F4F6", paddingTop: 12 },
    actionRow: { flexDirection: "row", gap: 10, marginTop: 8 },
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
    dateField: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        borderRadius: 10,
        paddingHorizontal: 14,
    },
    dateInput: {
        flex: 1,
        paddingVertical: 12,
        fontFamily: FIRASANS,
        fontSize: 15,
        color: TEXT_DARK,
    },
    dateIcon: { fontSize: 16, marginLeft: 8 },
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
