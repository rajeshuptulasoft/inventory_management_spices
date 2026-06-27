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
    PUTNETWORK,
    DELETENETWORK,
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

const ROLE_FOOTER = {
    finance: "Priya Sharma (Finance Department)",
    marketing: "Anita Verma (Marketing Department)",
    shift: "Shift Supervisor (Shift Supervisor)",
};

const mapSchemeToUi = (row) => ({
    id: String(row.id),
    code: row.code || `SCHEME-${row.id}`,
    name: row.name || "",
    type: row.scheme_type || "discount",
    description: row.description || "",
    startDate: row.start_date?.slice?.(0, 10) || row.start_date || "",
    endDate: row.end_date?.slice?.(0, 10) || row.end_date || "",
    budget: String(row.discount_amount ?? row.budget ?? 0),
    budgetDisplay: fmtInr(row.discount_amount ?? row.budget),
    status: capitalizeStatus(row.status),
    _raw: row,
});

const formatBudget = (value) => {
    const trimmed = String(value).trim();
    if (!trimmed || trimmed === "0") return "₹0";
    if (trimmed.startsWith("₹")) return trimmed;
    return `₹${trimmed}L`;
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

const SchemeFormModal = ({ visible, editingItem, onClose, onSave }) => {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [type, setType] = useState("discount");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [budget, setBudget] = useState("0");
    const [status, setStatus] = useState("Active");

    useEffect(() => {
        if (visible) {
            setCode(editingItem?.code ?? "");
            setName(editingItem?.name ?? "");
            setType(editingItem?.type ?? "discount");
            setDescription(editingItem?.description ?? "");
            setStartDate(editingItem?.startDate ?? "");
            setEndDate(editingItem?.endDate ?? "");
            setBudget(editingItem?.budget ?? "0");
            setStatus(editingItem?.status ?? "Active");
        }
    }, [visible, editingItem]);

    const resetForm = () => {
        setCode("");
        setName("");
        setType("discount");
        setDescription("");
        setStartDate("");
        setEndDate("");
        setBudget("0");
        setStatus("Active");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSave = () => {
        if (!code.trim() || !name.trim()) {
            Alert.alert("Required Fields", "Please enter Code and Name.");
            return;
        }
        onSave({
            id: editingItem?.id,
            code: code.trim().toUpperCase(),
            name: name.trim(),
            type: type.trim(),
            description: description.trim(),
            startDate: startDate.trim(),
            endDate: endDate.trim(),
            budget: budget.trim() || "0",
            status,
        });
        resetForm();
    };

    const cycleStatus = () => {
        setStatus((prev) => (prev === "Active" ? "Inactive" : "Active"));
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
                                {editingItem ? "Edit Scheme" : "Create Scheme"}
                            </Text>
                            <TouchableOpacity onPress={handleClose} style={styles.closeButton} activeOpacity={0.85}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <FormField label="CODE" required>
                                <TextInput
                                    style={styles.formInput}
                                    value={code}
                                    onChangeText={setCode}
                                    placeholderTextColor={TEXT_LIGHT}
                                    autoCapitalize="characters"
                                />
                            </FormField>
                            <FormField label="NAME" required>
                                <TextInput
                                    style={styles.formInput}
                                    value={name}
                                    onChangeText={setName}
                                    placeholderTextColor={TEXT_LIGHT}
                                />
                            </FormField>
                            <FormField label="TYPE">
                                <TextInput
                                    style={styles.formInput}
                                    value={type}
                                    onChangeText={setType}
                                    placeholderTextColor={TEXT_LIGHT}
                                />
                            </FormField>
                            <FormField label="DESCRIPTION">
                                <TextInput
                                    style={[styles.formInput, styles.textArea]}
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholderTextColor={TEXT_LIGHT}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </FormField>
                            <FormField label="START DATE">
                                <View style={styles.dateInputRow}>
                                    <TextInput
                                        style={[styles.formInput, styles.dateInput]}
                                        value={startDate}
                                        onChangeText={setStartDate}
                                        placeholder="dd-mm-yyyy"
                                        placeholderTextColor={TEXT_LIGHT}
                                    />
                                    <Text style={styles.calendarIcon}>📅</Text>
                                </View>
                            </FormField>
                            <FormField label="END DATE">
                                <View style={styles.dateInputRow}>
                                    <TextInput
                                        style={[styles.formInput, styles.dateInput]}
                                        value={endDate}
                                        onChangeText={setEndDate}
                                        placeholder="dd-mm-yyyy"
                                        placeholderTextColor={TEXT_LIGHT}
                                    />
                                    <Text style={styles.calendarIcon}>📅</Text>
                                </View>
                            </FormField>
                            <FormField label="BUDGET">
                                <TextInput
                                    style={styles.formInput}
                                    value={budget}
                                    onChangeText={setBudget}
                                    keyboardType="decimal-pad"
                                    placeholderTextColor={TEXT_LIGHT}
                                />
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

const SchemeCard = ({ item, onEdit, onDelete }) => (
    <View style={styles.schemeCard}>
        <View style={styles.schemeCardTop}>
            <View style={styles.schemeInfo}>
                <Text style={styles.fieldLabel}>CODE</Text>
                <Text style={styles.codeText}>{item.code}</Text>
                <Text style={[styles.fieldLabel, styles.fieldGap]}>SCHEME</Text>
                <Text style={styles.schemeName}>{item.name}</Text>
            </View>
            <View style={[styles.statusBadge, item.status === "Inactive" && styles.statusInactive]}>
                <View style={[styles.statusDot, item.status === "Inactive" && styles.statusDotInactive]} />
                <Text style={[styles.statusText, item.status === "Inactive" && styles.statusTextInactive]}>
                    {item.status}
                </Text>
            </View>
        </View>
        <View style={styles.budgetRow}>
            <Text style={styles.fieldLabel}>BUDGET</Text>
            <Text style={styles.budgetValue}>{item.budgetDisplay}</Text>
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

const SharedTradePromotionScreen = () => {
    const navigation = useFinanceNavigation();
    const [schemes, setSchemes] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [footerRole, setFooterRole] = useState(ROLE_FOOTER.shift);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await GETNETWORK(buildUrl("fmcg/schemes"), true);
            if (!isApiSuccess(res)) {
                Alert.alert("Error", getApiMessage(res, "Failed to load schemes"));
                setSchemes([]);
                return;
            }
            setSchemes(extractApiList(res).map(mapSchemeToUi));
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

    const filteredSchemes = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return schemes;
        return schemes.filter(
            (item) =>
                item.code.toLowerCase().includes(query) ||
                item.name.toLowerCase().includes(query) ||
                item.type.toLowerCase().includes(query) ||
                item.status.toLowerCase().includes(query)
        );
    }, [search, schemes]);

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

    const handleSaveScheme = async (form) => {
        const payload = {
            name: form.name,
            scheme_type: form.type || "discount",
            description: form.description || "",
            buy_qty: 0,
            free_qty: 0,
            discount_percent: 0,
            discount_amount: Number(form.budget) || 0,
            start_date: form.startDate || null,
            end_date: form.endDate || null,
            status: form.status.toLowerCase(),
            products: [],
            distributors: [],
        };
        const res = form.id
            ? await PUTNETWORK(buildUrl(`fmcg/schemes/${form.id}`), payload, true)
            : await POSTNETWORK(buildUrl("fmcg/schemes"), payload, true);
        if (!isApiSuccess(res)) {
            Alert.alert("Error", getApiMessage(res, "Save failed"));
            return;
        }
        closeModal();
        loadData();
    };

    const handleDelete = (item) => {
        Alert.alert("Delete Scheme", `Delete "${item.name}"?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    const res = await DELETENETWORK(buildUrl(`fmcg/schemes/${item.id}`), true);
                    if (!isApiSuccess(res)) {
                        Alert.alert("Error", getApiMessage(res, "Delete failed"));
                        return;
                    }
                    loadData();
                },
            },
        ]);
    };

    const listHeader = (
        <View>
            <View style={styles.subAdminBanner}>
                <Text style={styles.subAdminBannerText}>Sub Admin Access</Text>
            </View>

            <View style={styles.pageHeader}>
                <Text style={styles.pageTitle}>Trade Promotions & Schemes</Text>
                <Text style={styles.pageSubtitle}>
                    Buy X Get Y, slab schemes & festival offers
                </Text>
            </View>

            <View style={styles.summaryCard}>
                <View style={styles.summaryTop}>
                    <Text style={styles.summaryLabel}>TOTAL RECORDS</Text>
                    <View style={styles.summaryIconWrap}>
                        <Text style={styles.summaryIcon}>📊</Text>
                    </View>
                </View>
                <Text style={styles.summaryValue}>{schemes.length}</Text>
                <Text style={styles.summaryFooter}>→ From database</Text>
            </View>

            <View style={styles.listSection}>
                <Text style={styles.sectionTitle}>Trade Promotions & Schemes</Text>
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
                title="Trade Promotion"
                backgroundColor={WHITE}
                onBackPress={handleBack}
            />

            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={filteredSchemes}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <SchemeCard item={item} onEdit={openEditModal} onDelete={handleDelete} />
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
                            <Text style={styles.emptyText}>No schemes found</Text>
                        </View>
                    }
                />

                <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={openAddModal}>
                    <Text style={styles.fabIcon}>+</Text>
                </TouchableOpacity>

                <SchemeFormModal
                    visible={showModal}
                    editingItem={editingItem}
                    onClose={closeModal}
                    onSave={handleSaveScheme}
                />
            </SafeAreaView>
        </View>
    );
};

export default SharedTradePromotionScreen;

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
    schemeCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    schemeCardTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
        gap: 8,
    },
    schemeInfo: { flex: 1 },
    fieldLabel: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 9,
        color: TEXT_MUTED,
        letterSpacing: 0.4,
        marginBottom: 4,
    },
    fieldGap: { marginTop: 8 },
    codeText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 13, color: PRIMARY_BLUE },
    schemeName: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: TEXT_DARK, lineHeight: 20 },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ECFDF5",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    statusInactive: { backgroundColor: "#F3F4F6" },
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN },
    statusDotInactive: { backgroundColor: TEXT_MUTED },
    statusText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 11, color: GREEN },
    statusTextInactive: { color: TEXT_MUTED },
    budgetRow: { marginBottom: 14 },
    budgetValue: { fontFamily: UBUNTUBOLD, fontSize: 16, color: TEXT_DARK },
    actionRow: { flexDirection: "row", gap: 10 },
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
