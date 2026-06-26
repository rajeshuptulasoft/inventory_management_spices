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

const PAYMENT_MODES = ["Cash", "Neft", "UPI", "Cheque", "RTGS"];
const COLLECTION_STATUSES = ["Received", "Cleared", "Pending"];

const INITIAL_COLLECTIONS = [
    {
        id: "1",
        receiptId: "COL-2024-001",
        partyId: "0",
        amount: "₹1.0K",
        mode: "Neft",
        reference: "",
        date: "",
        invoiceId: "0",
        status: "Cleared",
    },
];

const formatAmount = (value) => {
    const trimmed = String(value).trim();
    if (!trimmed || trimmed === "0") return "₹0";
    if (trimmed.startsWith("₹")) return trimmed;
    const num = Number(trimmed);
    if (!Number.isNaN(num) && num >= 1000) {
        return `₹${(num / 1000).toFixed(1)}K`;
    }
    return `₹${trimmed}`;
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

const RecordCollectionModal = ({ visible, onClose, onSave }) => {
    const [receiptNo, setReceiptNo] = useState("");
    const [partyId, setPartyId] = useState("0");
    const [amount, setAmount] = useState("0");
    const [mode, setMode] = useState("Cash");
    const [reference, setReference] = useState("");
    const [date, setDate] = useState("");
    const [invoiceId, setInvoiceId] = useState("0");
    const [status, setStatus] = useState("Received");

    const resetForm = () => {
        setReceiptNo("");
        setPartyId("0");
        setAmount("0");
        setMode("Cash");
        setReference("");
        setDate("");
        setInvoiceId("0");
        setStatus("Received");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSave = () => {
        if (!receiptNo.trim() || !partyId.trim() || !amount.trim()) {
            Alert.alert("Required Fields", "Please enter Receipt No, Party ID, and Amount.");
            return;
        }
        onSave({
            receiptNo: receiptNo.trim(),
            partyId: partyId.trim(),
            amount: amount.trim(),
            mode,
            reference: reference.trim(),
            date: date.trim(),
            invoiceId: invoiceId.trim() || "0",
            status,
        });
        resetForm();
    };

    const cycleMode = () => {
        setMode((prev) => {
            const index = PAYMENT_MODES.indexOf(prev);
            return PAYMENT_MODES[(index + 1) % PAYMENT_MODES.length];
        });
    };

    const cycleStatus = () => {
        setStatus((prev) => {
            const index = COLLECTION_STATUSES.indexOf(prev);
            return COLLECTION_STATUSES[(index + 1) % COLLECTION_STATUSES.length];
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
                            <Text style={styles.modalTitle}>Record Collection</Text>
                            <TouchableOpacity
                                onPress={handleClose}
                                style={styles.closeButton}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <FormField label="RECEIPT NO" required>
                                <TextInput
                                    style={styles.formInput}
                                    value={receiptNo}
                                    onChangeText={setReceiptNo}
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

                            <FormField label="AMOUNT" required>
                                <TextInput
                                    style={styles.formInput}
                                    value={amount}
                                    onChangeText={setAmount}
                                    keyboardType="numeric"
                                    placeholderTextColor={TEXT_LIGHT}
                                />
                            </FormField>

                            <FormField label="MODE">
                                <TouchableOpacity
                                    style={styles.pickerField}
                                    onPress={cycleMode}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.pickerText}>{mode}</Text>
                                    <Text style={styles.pickerChevron}>▾</Text>
                                </TouchableOpacity>
                            </FormField>

                            <FormField label="REFERENCE">
                                <TextInput
                                    style={styles.formInput}
                                    value={reference}
                                    onChangeText={setReference}
                                    placeholderTextColor={TEXT_LIGHT}
                                />
                            </FormField>

                            <FormField label="DATE">
                                <View style={styles.dateInputRow}>
                                    <TextInput
                                        style={[styles.formInput, styles.dateInput]}
                                        value={date}
                                        onChangeText={setDate}
                                        placeholder="dd-mm-yyyy"
                                        placeholderTextColor={TEXT_LIGHT}
                                    />
                                    <Text style={styles.calendarIcon}>📅</Text>
                                </View>
                            </FormField>

                            <FormField label="INVOICE ID">
                                <TextInput
                                    style={styles.formInput}
                                    value={invoiceId}
                                    onChangeText={setInvoiceId}
                                    keyboardType="numeric"
                                    placeholderTextColor={TEXT_LIGHT}
                                />
                            </FormField>

                            <FormField label="STATUS">
                                <TouchableOpacity
                                    style={styles.pickerField}
                                    onPress={cycleStatus}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.pickerText}>{status}</Text>
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

const CollectionCard = ({ item, onEdit, onDelete }) => (
    <View style={styles.collectionCard}>
        <View style={styles.collectionCardTop}>
            <View style={styles.collectionInfo}>
                <Text style={styles.receiptId}>{item.receiptId}</Text>
                <Text style={styles.amountValue}>{item.amount}</Text>
            </View>
            <View
                style={[
                    styles.statusBadge,
                    item.status === "Pending" && styles.statusPending,
                    item.status === "Received" && styles.statusReceived,
                ]}
            >
                <View style={styles.statusDot} />
                <Text
                    style={[
                        styles.statusText,
                        item.status === "Pending" && styles.statusTextPending,
                        item.status === "Received" && styles.statusTextReceived,
                    ]}
                >
                    {item.status}
                </Text>
            </View>
        </View>

        <View style={styles.collectionMetaRow}>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>MODE</Text>
                <Text style={styles.metaValue}>{item.mode}</Text>
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

const CollectionScreen = () => {
    const navigation = useFinanceNavigation();
    const [collections, setCollections] = useState(INITIAL_COLLECTIONS);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

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
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const filteredCollections = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return collections;
        return collections.filter(
            (item) =>
                item.receiptId.toLowerCase().includes(query) ||
                item.mode.toLowerCase().includes(query) ||
                item.status.toLowerCase().includes(query)
        );
    }, [search, collections]);

    const handleSaveCollection = (form) => {
        const newCollection = {
            id: String(Date.now()),
            receiptId: form.receiptNo,
            partyId: form.partyId,
            amount: formatAmount(form.amount),
            mode: form.mode,
            reference: form.reference,
            date: form.date,
            invoiceId: form.invoiceId,
            status: form.status,
        };
        setCollections((prev) => [...prev, newCollection]);
        setShowAddModal(false);
    };

    const handleEdit = (item) => {
        Alert.alert("Edit Collection", `Edit ${item.receiptId}`);
    };

    const handleDelete = (item) => {
        Alert.alert("Delete Collection", `Delete ${item.receiptId}?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => setCollections((prev) => prev.filter((c) => c.id !== item.id)),
            },
        ]);
    };

    const listHeader = (
        <View>
            <View style={styles.pageHeader}>
                <View style={styles.titleBlock}>
                    <Text style={styles.pageTitle}>Collection Management</Text>
                    <Text style={styles.pageSubtitle}>
                        Due, overdue & advance payment tracking
                    </Text>
                </View>
            </View>

            <View style={styles.summaryCard}>
                <View style={styles.summaryTop}>
                    <Text style={styles.summaryLabel}>TOTAL RECORDS</Text>
                    <View style={styles.summaryIconWrap}>
                        <Text style={styles.summaryIcon}>📊</Text>
                    </View>
                </View>
                <Text style={styles.summaryValue}>{collections.length}</Text>
                <Text style={styles.summaryFooter}>→ From database</Text>
            </View>

            <View style={styles.listSection}>
                <View style={styles.listSectionHeader}>
                    <Text style={styles.sectionTitle}>Collection Management</Text>
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

                <View style={styles.tableHeaderRow}>
                    <Text style={[styles.tableHeaderText, styles.colReceipt]}>RECEIPT</Text>
                    <Text style={[styles.tableHeaderText, styles.colAmount]}>AMOUNT</Text>
                    <Text style={[styles.tableHeaderText, styles.colMode]}>MODE</Text>
                    <Text style={[styles.tableHeaderText, styles.colStatus]}>STATUS</Text>
                </View>
            </View>
        </View>
    );

    const listFooter = (
        <Text style={styles.footerText}>
            SpiceCraft ERP v3.0 • Logged in as Rajesh Sahoo (Finance Head) • 24
        </Text>
    );

    return (
        <View style={styles.root}>
            <MyHeader
                showBack
                showCenterTitle
                title="Collection"
                backgroundColor={WHITE}
                onBackPress={handleBack}
            />

            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={filteredCollections}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <CollectionCard item={item} onEdit={handleEdit} onDelete={handleDelete} />
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
                            <Text style={styles.emptyText}>No collections found</Text>
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

                <RecordCollectionModal
                    visible={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSave={handleSaveCollection}
                />
            </SafeAreaView>
        </View>
    );
};

export default CollectionScreen;

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
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingTop: 14,
        paddingBottom: 14,
    },
    titleBlock: {
        flex: 1,
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
        maxWidth: 200,
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
        color: TEXT_MUTED,
    },
    listSection: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        padding: 14,
        marginBottom: 10,
    },
    listSectionHeader: {
        marginBottom: 12,
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
    tableHeaderRow: {
        flexDirection: "row",
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    tableHeaderText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 8,
        color: TEXT_MUTED,
        letterSpacing: 0.3,
    },
    colReceipt: { width: "28%" },
    colAmount: { width: "22%" },
    colMode: { flex: 1 },
    colStatus: { width: "20%" },
    collectionCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    collectionCardTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
        gap: 8,
    },
    collectionInfo: {
        flex: 1,
    },
    receiptId: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 13,
        color: PRIMARY_BLUE,
        marginBottom: 4,
    },
    amountValue: {
        fontFamily: UBUNTUBOLD,
        fontSize: 18,
        color: GREEN,
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
    statusPending: {
        backgroundColor: "#FEF3C7",
    },
    statusReceived: {
        backgroundColor: "#DBEAFE",
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: GREEN,
    },
    statusText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 11,
        color: GREEN,
    },
    statusTextPending: {
        color: AMBER,
    },
    statusTextReceived: {
        color: PRIMARY_BLUE,
    },
    collectionMetaRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 14,
    },
    metaCol: {
        flex: 1,
    },
    fieldLabel: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 9,
        color: TEXT_MUTED,
        letterSpacing: 0.4,
        marginBottom: 4,
    },
    metaValue: {
        fontFamily: FIRASANS,
        fontSize: 13,
        color: TEXT_DARK,
    },
    actionRow: {
        flexDirection: "row",
        gap: 10,
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
    deleteButton: {
        flex: 1,
        backgroundColor: "#7F1D1D",
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: "center",
    },
    deleteButtonText: {
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
