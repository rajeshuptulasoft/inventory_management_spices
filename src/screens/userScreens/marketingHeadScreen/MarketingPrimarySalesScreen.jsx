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

const mapOrderRow = (row) => {
    const mapped = mapSalesOrderRow(row);
    return {
        id: mapped.id,
        orderId: mapped.orderId,
        customer: mapped.distributor,
        type: row.order_type || row.type || "Primary",
        amount: mapped.amount,
        status: mapped.status,
        partyId: mapped.distributorId,
        channel: row.channel || "",
        orderDate: mapped.date,
        payment: row.payment_mode || row.mode || "Credit",
    };
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

const NewOrderModal = ({ visible, onClose, onSave }) => {
    const [orderNo, setOrderNo] = useState("");
    const [partyId, setPartyId] = useState("0");
    const [type, setType] = useState("Primary");
    const [channel, setChannel] = useState("");
    const [orderDate, setOrderDate] = useState("");
    const [payment, setPayment] = useState("Credit");

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
            orderNo: orderNo.trim(),
            partyId: partyId.trim(),
            type,
            channel: channel.trim(),
            orderDate: orderDate.trim(),
            payment,
        });
        resetForm();
    };

    const cycleType = () => {
        setType((prev) => (prev === "Primary" ? "Secondary" : "Primary"));
    };

    const cyclePayment = () => {
        setPayment((prev) => (prev === "Credit" ? "Cash" : "Credit"));
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
                            <Text style={styles.modalTitle}>New Order</Text>
                            <TouchableOpacity
                                onPress={handleClose}
                                style={styles.closeButton}
                                activeOpacity={0.85}
                            >
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
                                <TouchableOpacity
                                    style={styles.pickerField}
                                    onPress={cycleType}
                                    activeOpacity={0.85}
                                >
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
                                <View style={styles.dateInputRow}>
                                    <TextInput
                                        style={[styles.formInput, styles.dateInput]}
                                        value={orderDate}
                                        onChangeText={setOrderDate}
                                        placeholder="dd-mm-yyyy"
                                        placeholderTextColor={TEXT_LIGHT}
                                    />
                                    <Text style={styles.calendarIcon}>📅</Text>
                                </View>
                            </FormField>

                            <FormField label="PAYMENT">
                                <TouchableOpacity
                                    style={styles.pickerField}
                                    onPress={cyclePayment}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.pickerText}>{payment}</Text>
                                    <Text style={styles.pickerChevron}>▾</Text>
                                </TouchableOpacity>
                            </FormField>
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                onPress={handleClose}
                                activeOpacity={0.85}
                                style={styles.cancelButton}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSave}
                                activeOpacity={0.9}
                                style={styles.saveButton}
                            >
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const SalesCard = ({ item, onView, onEdit }) => (
    <View style={styles.salesCard}>
        <View style={styles.salesCardTop}>
            <View style={styles.salesInfo}>
                <Text style={styles.fieldLabel}>ORDER</Text>
                <Text style={styles.orderId}>{item.orderId}</Text>
                <Text style={[styles.fieldLabel, styles.fieldGap]}>CUSTOMER</Text>
                <Text style={styles.customerName}>{item.customer}</Text>
            </View>
            <View style={[styles.statusBadge, item.status === "Pending" && styles.statusPending]}>
                <Text
                    style={[
                        styles.statusText,
                        item.status === "Pending" && styles.statusTextPending,
                    ]}
                >
                    {item.status}
                </Text>
            </View>
        </View>

        <View style={styles.salesMetaRow}>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>TYPE</Text>
                <Text style={styles.metaValue}>{item.type}</Text>
            </View>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>AMOUNT</Text>
                <Text style={styles.amountValue}>{item.amount}</Text>
            </View>
        </View>

        <View style={styles.actionRow}>
            <TouchableOpacity style={styles.viewButton} activeOpacity={0.85} onPress={() => onView(item)}>
                <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editButton} activeOpacity={0.85} onPress={() => onEdit(item)}>
                <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
        </View>
    </View>
);

const MarketingPrimarySalesScreen = () => {
    const navigation = useFinanceNavigation();
    const [sales, setSales] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [showPermissionAlert] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchSales = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const res = await GETNETWORK(buildUrl("fmcg/sales-orders", "limit=100"), true);
            if (!isApiSuccess(res)) {
                setLoadError(getApiMessage(res, "Failed to load sales orders"));
                setSales([]);
                return;
            }
            const rows = extractApiList(res)
                .map(mapOrderRow)
                .filter((item) => String(item.type).toLowerCase().includes("primary"));
            setSales(rows);
            setLoadError("");
        } catch {
            setLoadError("Failed to load sales orders");
            setSales([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchSales();
    }, [fetchSales]);

    const handleBack = useCallback(() => {
        if (showAddModal) {
            setShowAddModal(false);
            return;
        }
        navigation.goBack();
    }, [navigation, showAddModal]);

    useEffect(() => {
        if (Platform.OS !== "android") {
            return undefined;
        }

        const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
            if (showAddModal) {
                setShowAddModal(false);
                return true;
            }
            navigation.goBack();
            return true;
        });

        return () => subscription.remove();
    }, [navigation, showAddModal]);

    const onRefresh = useCallback(() => {
        fetchSales(true);
    }, [fetchSales]);

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

    const handleSaveOrder = async (form) => {
        const res = await POSTNETWORK(
            buildUrl("fmcg/sales-orders"),
            {
                distributorId: Number(form.partyId),
                items: [],
                notes: form.orderNo || undefined,
            },
            true
        );
        if (!isApiSuccess(res)) {
            Alert.alert("Error", getApiMessage(res, "Create failed"));
            return;
        }
        setShowAddModal(false);
        fetchSales(true);
    };

    const handleView = (item) => {
        Alert.alert("View Order", `Order ${item.orderId}`);
    };

    const handleEdit = (item) => {
        Alert.alert("Edit Order", `Edit ${item.orderId}`);
    };

    const listHeader = (
        <View>
            <View style={styles.pageHeader}>
                <Text style={styles.pageTitle}>Primary Sales</Text>
                <Text style={styles.pageSubtitle}>
                    Manufacturer → Distributor sales orders
                </Text>
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
                    {loading ? "→ Loading..." : loadError ? `→ ${loadError}` : "→ From database"}
                </Text>
            </View>

            {showPermissionAlert ? (
                <View style={styles.permissionBanner}>
                    <Text style={styles.permissionText}>You do not have permission for this action</Text>
                </View>
            ) : null}

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
            SpiceCraft ERP v3.0 • Logged in as Jaydev (Marketing Head) • 25
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
                        <SalesCard item={item} onView={handleView} onEdit={handleEdit} />
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
                        <View style={styles.emptyWrap}>
                            <Text style={styles.emptyText}>No sales orders found</Text>
                        </View>
                    }
                />

                <TouchableOpacity
                    style={styles.fab}
                    activeOpacity={0.9}
                    onPress={() => setShowAddModal(true)}
                >
                    <Text style={styles.fabIcon}>+</Text>
                </TouchableOpacity>

                <NewOrderModal
                    visible={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSave={handleSaveOrder}
                />
            </SafeAreaView>
        </View>
    );
};

export default MarketingPrimarySalesScreen;

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
        paddingBottom: 88,
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
    summaryCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        marginBottom: 12,
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
    summaryIcon: {
        fontSize: 16,
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
    permissionBanner: {
        backgroundColor: "#FEE2E2",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#FECACA",
    },
    permissionText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 13,
        color: "#B91C1C",
        lineHeight: 18,
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
    salesCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    salesCardTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
        gap: 8,
    },
    salesInfo: {
        flex: 1,
    },
    fieldLabel: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 9,
        color: TEXT_MUTED,
        letterSpacing: 0.4,
        marginBottom: 4,
    },
    fieldGap: {
        marginTop: 8,
    },
    orderId: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 13,
        color: PRIMARY_BLUE,
    },
    customerName: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 15,
        color: TEXT_DARK,
        lineHeight: 20,
    },
    statusBadge: {
        backgroundColor: "#ECFDF5",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusPending: {
        backgroundColor: "#FEF3C7",
    },
    statusText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 11,
        color: GREEN,
    },
    statusTextPending: {
        color: AMBER,
    },
    salesMetaRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 14,
    },
    metaCol: {
        flex: 1,
    },
    metaValue: {
        fontFamily: FIRASANS,
        fontSize: 13,
        color: TEXT_DARK,
    },
    amountValue: {
        fontFamily: UBUNTUBOLD,
        fontSize: 16,
        color: TEXT_DARK,
    },
    actionRow: {
        flexDirection: "row",
        gap: 10,
    },
    viewButton: {
        flex: 1,
        backgroundColor: "#F3F4F6",
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    viewButtonText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 13,
        color: TEXT_DARK,
    },
    editButton: {
        flex: 1,
        backgroundColor: PRIMARY_BLUE,
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: "center",
    },
    editButtonText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 13,
        color: WHITE,
    },
    emptyWrap: {
        paddingVertical: 32,
        alignItems: "center",
    },
    emptyText: {
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
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.45)",
    },
    modalKeyboard: {
        width: "100%",
        zIndex: 1,
    },
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
    modalTitle: {
        fontFamily: UBUNTUBOLD,
        fontSize: 20,
        color: TEXT_DARK,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
    },
    closeButtonText: {
        fontSize: 16,
        color: TEXT_MUTED,
    },
    formField: {
        marginBottom: 16,
    },
    formLabel: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 11,
        color: TEXT_MUTED,
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    required: {
        color: RED,
    },
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
    pickerText: {
        fontFamily: FIRASANS,
        fontSize: 15,
        color: TEXT_DARK,
    },
    pickerChevron: {
        fontSize: 12,
        color: TEXT_MUTED,
    },
    dateInputRow: {
        position: "relative",
        justifyContent: "center",
    },
    dateInput: {
        paddingRight: 44,
    },
    calendarIcon: {
        position: "absolute",
        right: 14,
        fontSize: 18,
    },
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
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 8,
    },
    cancelButtonText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 15,
        color: TEXT_MUTED,
    },
    saveButton: {
        backgroundColor: PRIMARY_BLUE,
        borderRadius: 10,
        paddingVertical: 11,
        paddingHorizontal: 22,
    },
    saveButtonText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 15,
        color: WHITE,
    },
});
