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
const PRIMARY_BLUE = "#2563EB";
const GREEN = "#16A34A";
const RED = "#DC2626";

const TYPE_OPTIONS = ["Main", "Secondary", "Transit"];

const ROLE_FOOTER = {
    finance: "Priya Sharma (Finance Department)",
    marketing: "Anita Verma (Marketing Department)",
    shift: "Shift Supervisor (Shift Supervisor)",
};

const formatCapacity = (value) => {
    const digits = String(value).replace(/[^\d]/g, "");
    if (!digits) return "0";
    return Number(digits).toLocaleString("en-IN");
};

const mapRackToUi = (row) => ({
    id: String(row.id),
    code: row.rack_code || `R-${row.id}`,
    name: row.rack_name || "",
    location: row.warehouse?.name || row.warehouse_name || "",
    type: "Main",
    capacity: formatCapacity(row.capacity ?? 0),
    capacityRaw: String(row.capacity ?? 0),
    manager: "",
    status: capitalizeStatus(row.status),
    warehouseId: String(row.warehouse_id ?? ""),
    _raw: row,
});

const FormField = ({ label, required, children }) => (
    <View style={styles.formField}>
        <Text style={styles.formLabel}>
            {label}
            {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
        {children}
    </View>
);

const AddWarehouseModal = ({ visible, editingItem, onClose, onSave }) => {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [type, setType] = useState("Main");
    const [capacity, setCapacity] = useState("0");
    const [manager, setManager] = useState("");
    const [status, setStatus] = useState("Active");

    useEffect(() => {
        if (visible) {
            setCode(editingItem?.code ?? "");
            setName(editingItem?.name ?? "");
            setLocation(editingItem?.location ?? "");
            setType(editingItem?.type ?? "Main");
            setCapacity(editingItem?.capacityRaw ?? editingItem?.capacity?.replace(/,/g, "") ?? "0");
            setManager(editingItem?.manager ?? "");
            setStatus(editingItem?.status ?? "Active");
        }
    }, [visible, editingItem]);

    const resetForm = () => {
        setCode("");
        setName("");
        setLocation("");
        setType("Main");
        setCapacity("0");
        setManager("");
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
            location: location.trim(),
            type,
            capacity: capacity.trim() || "0",
            manager: manager.trim(),
            status,
            warehouseId: editingItem?.warehouseId,
        });
        resetForm();
    };

    const cycleType = () => {
        setType((prev) => {
            const idx = TYPE_OPTIONS.indexOf(prev);
            return TYPE_OPTIONS[(idx + 1) % TYPE_OPTIONS.length];
        });
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
                                {editingItem ? "Edit Warehouse" : "Add Warehouse"}
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

                            <FormField label="LOCATION">
                                <TextInput
                                    style={styles.formInput}
                                    value={location}
                                    onChangeText={setLocation}
                                    placeholderTextColor={TEXT_LIGHT}
                                />
                            </FormField>

                            <FormField label="TYPE">
                                <TouchableOpacity style={styles.pickerField} onPress={cycleType} activeOpacity={0.85}>
                                    <Text style={styles.pickerText}>{type}</Text>
                                    <Text style={styles.pickerChevron}>▾</Text>
                                </TouchableOpacity>
                            </FormField>

                            <FormField label="CAPACITY">
                                <TextInput
                                    style={styles.formInput}
                                    value={capacity}
                                    onChangeText={setCapacity}
                                    keyboardType="numeric"
                                    placeholderTextColor={TEXT_LIGHT}
                                />
                            </FormField>

                            <FormField label="MANAGER">
                                <TextInput
                                    style={styles.formInput}
                                    value={manager}
                                    onChangeText={setManager}
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

const WarehouseCard = ({ item, onEdit, onDelete }) => (
    <View style={styles.warehouseCard}>
        <View style={styles.cardGrid}>
            <View style={styles.gridColCode}>
                <Text style={styles.fieldLabel}>CODE</Text>
                <Text style={styles.codeText}>{item.code}</Text>
            </View>
            <View style={styles.gridColWarehouse}>
                <Text style={styles.fieldLabel}>WAREHOUSE</Text>
                <Text style={styles.warehouseName}>{item.name}</Text>
                {item.location ? <Text style={styles.locationText}>{item.location}</Text> : null}
            </View>
        </View>

        <View style={styles.cardGrid}>
            <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>CAPACITY</Text>
                <Text style={styles.capacityValue}>{item.capacity}</Text>
            </View>
            <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>STATUS</Text>
                <View style={[styles.statusBadge, item.status === "Inactive" && styles.statusInactive]}>
                    <View
                        style={[
                            styles.statusDot,
                            item.status === "Inactive" && styles.statusDotInactive,
                        ]}
                    />
                    <Text
                        style={[
                            styles.statusText,
                            item.status === "Inactive" && styles.statusTextInactive,
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

const SharedWarehouseScreen = () => {
    const navigation = useFinanceNavigation();
    const [warehouses, setWarehouses] = useState([]);
    const [warehouseOptions, setWarehouseOptions] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [footerRole, setFooterRole] = useState(ROLE_FOOTER.shift);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [racksRes, whRes] = await Promise.all([
                GETNETWORK(buildUrl("racks"), true),
                GETNETWORK(buildUrl("racks/warehouses/list"), true),
            ]);
            if (!isApiSuccess(racksRes)) {
                Alert.alert("Error", getApiMessage(racksRes, "Failed to load racks"));
                setWarehouses([]);
            } else {
                setWarehouses(extractApiList(racksRes).map(mapRackToUi));
            }
            if (isApiSuccess(whRes)) {
                setWarehouseOptions(extractApiList(whRes));
            }
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

    const filteredWarehouses = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return warehouses;
        return warehouses.filter(
            (item) =>
                item.code.toLowerCase().includes(query) ||
                item.name.toLowerCase().includes(query) ||
                item.location.toLowerCase().includes(query) ||
                item.manager.toLowerCase().includes(query)
        );
    }, [search, warehouses]);

    const openAddModal = () => {
        setEditingItem(null);
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem({
            ...item,
            capacityRaw: item.capacity.replace(/,/g, ""),
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
    };

    const handleSave = async (form) => {
        const warehouseId =
            form.warehouseId ||
            editingItem?.warehouseId ||
            String(warehouseOptions[0]?.id ?? "");
        if (!form.name.trim() || !warehouseId) {
            Alert.alert("Required Fields", "Please enter Name and ensure a warehouse is available.");
            return;
        }
        const payload = {
            rack_name: form.name.trim(),
            warehouse_id: Number(warehouseId),
            capacity: Number(String(form.capacity).replace(/[^\d]/g, "") || 0),
            status: form.status.toLowerCase(),
        };
        const res = form.id
            ? await PUTNETWORK(buildUrl(`racks/${form.id}`), payload, true)
            : await POSTNETWORK(buildUrl("racks"), payload, true);
        if (!isApiSuccess(res)) {
            Alert.alert("Error", getApiMessage(res, "Save failed"));
            return;
        }
        closeModal();
        loadData();
    };

    const handleDelete = (item) => {
        Alert.alert("Delete Rack", `Delete ${item.name}?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Remove",
                style: "destructive",
                onPress: () => {
                    setWarehouses((prev) => prev.filter((row) => row.id !== item.id));
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
                <Text style={styles.pageTitle}>Warehouse Management</Text>
                <Text style={styles.pageSubtitle}>Multi-warehouse, rack/bin tracking & stock</Text>
            </View>

            <View style={styles.summaryCard}>
                <View style={styles.summaryTop}>
                    <Text style={styles.summaryLabel}>TOTAL RECORDS</Text>
                    <View style={styles.summaryIconWrap}>
                        <Text style={styles.summaryIcon}>📊</Text>
                    </View>
                </View>
                <Text style={styles.summaryValue}>{warehouses.length}</Text>
                <Text style={styles.summaryFooter}>
                    {loading ? "→ Loading..." : "→ From database"}
                </Text>
            </View>

            <View style={styles.listSection}>
                <Text style={styles.sectionTitle}>Warehouse Management</Text>
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
                title="Warehouse Management"
                backgroundColor={WHITE}
                onBackPress={handleBack}
            />

            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={filteredWarehouses}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <WarehouseCard item={item} onEdit={openEditModal} onDelete={handleDelete} />
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
                            <Text style={styles.emptyText}>No warehouse records found</Text>
                        </View>
                    }
                />

                <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={openAddModal}>
                    <Text style={styles.fabIcon}>+</Text>
                </TouchableOpacity>

                <AddWarehouseModal
                    visible={showModal}
                    editingItem={editingItem}
                    onClose={closeModal}
                    onSave={handleSave}
                />
            </SafeAreaView>
        </View>
    );
};

export default SharedWarehouseScreen;

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
    warehouseCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    cardGrid: { flexDirection: "row", gap: 10, marginBottom: 12, alignItems: "flex-start" },
    gridColCode: { width: "28%" },
    gridColWarehouse: { flex: 1 },
    gridCol: { flex: 1 },
    fieldLabel: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 9,
        color: TEXT_MUTED,
        letterSpacing: 0.4,
        marginBottom: 4,
    },
    codeText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 13, color: PRIMARY_BLUE },
    warehouseName: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: TEXT_DARK, lineHeight: 20 },
    locationText: { fontFamily: FIRASANS, fontSize: 12, color: TEXT_MUTED, marginTop: 2 },
    capacityValue: { fontFamily: UBUNTUBOLD, fontSize: 16, color: TEXT_DARK },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
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
