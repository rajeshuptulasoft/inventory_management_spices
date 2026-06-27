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

const BATCH_STATUS_OPTIONS = ["Planned", "In Progress", "Completed", "Cancelled"];
const TAB_BATCHES = "batches";
const TAB_BOM = "bom";

const mapProductionBatch = (row) => ({
    id: String(row.id),
    batch: row.batch_code || row.batch_number || `BATCH-${row.id}`,
    planned: String(row.planned_qty ?? 0),
    produced: String(row.produced_qty ?? 0),
    startDate: row.created_at?.slice?.(0, 10) || "",
    endDate: row.expiry_date?.slice?.(0, 10) || "",
    status: capitalizeStatus(row.status),
});

const mapBomRow = (row) => ({
    id: String(row.id),
    code: row.batch_number || row.bom_code || `BOM-${row.id}`,
    outputVariant: row.variant?.product?.product_name
        ? `${row.variant.product.product_name} - ${row.variant?.size || ""}`
        : row.name || "—",
    outputQty: String(row.quantity ?? row.output_qty ?? 0),
    rmLines: String(row.materials?.length ?? row.rm_lines ?? 0),
    status: capitalizeStatus(row.status || "active"),
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

const NewBatchModal = ({ visible, editingItem, onClose, onSave }) => {
    const [batchNo, setBatchNo] = useState("");
    const [plannedQty, setPlannedQty] = useState("0");
    const [producedQty, setProducedQty] = useState("0");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [status, setStatus] = useState("Planned");

    useEffect(() => {
        if (visible) {
            setBatchNo(editingItem?.batch ?? "");
            setPlannedQty(editingItem?.planned ?? "0");
            setProducedQty(editingItem?.produced ?? "0");
            setStartDate(editingItem?.startDate ?? "");
            setEndDate(editingItem?.endDate ?? "");
            setStatus(editingItem?.status ?? "Planned");
        }
    }, [visible, editingItem]);

    const resetForm = () => {
        setBatchNo("");
        setPlannedQty("0");
        setProducedQty("0");
        setStartDate("");
        setEndDate("");
        setStatus("Planned");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSave = () => {
        if (!batchNo.trim()) {
            Alert.alert("Required Fields", "Please enter Batch No.");
            return;
        }
        onSave({
            id: editingItem?.id,
            batch: batchNo.trim().toUpperCase(),
            planned: plannedQty.trim() || "0",
            produced: producedQty.trim() || "0",
            startDate: startDate.trim(),
            endDate: endDate.trim(),
            status,
        });
        resetForm();
    };

    const cycleStatus = () => {
        setStatus((prev) => {
            const idx = BATCH_STATUS_OPTIONS.indexOf(prev);
            return BATCH_STATUS_OPTIONS[(idx + 1) % BATCH_STATUS_OPTIONS.length];
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
                            <Text style={styles.modalTitle}>
                                {editingItem ? "Edit Batch" : "New Batch"}
                            </Text>
                            <TouchableOpacity onPress={handleClose} style={styles.closeButton} activeOpacity={0.85}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <FormField label="BATCH NO" required>
                                <TextInput
                                    style={styles.formInput}
                                    value={batchNo}
                                    onChangeText={setBatchNo}
                                    placeholderTextColor={TEXT_LIGHT}
                                    autoCapitalize="characters"
                                />
                            </FormField>
                            <FormField label="PLANNED QTY">
                                <TextInput
                                    style={styles.formInput}
                                    value={plannedQty}
                                    onChangeText={setPlannedQty}
                                    keyboardType="numeric"
                                    placeholderTextColor={TEXT_LIGHT}
                                />
                            </FormField>
                            <FormField label="PRODUCED QTY">
                                <TextInput
                                    style={styles.formInput}
                                    value={producedQty}
                                    onChangeText={setProducedQty}
                                    keyboardType="numeric"
                                    placeholderTextColor={TEXT_LIGHT}
                                />
                            </FormField>
                            <FormField label="START DATE">
                                <View style={styles.dateField}>
                                    <TextInput
                                        style={styles.dateInput}
                                        value={startDate}
                                        onChangeText={setStartDate}
                                        placeholder="dd-mm-yyyy"
                                        placeholderTextColor={TEXT_LIGHT}
                                    />
                                    <Text style={styles.dateIcon}>📅</Text>
                                </View>
                            </FormField>
                            <FormField label="END DATE">
                                <View style={styles.dateField}>
                                    <TextInput
                                        style={styles.dateInput}
                                        value={endDate}
                                        onChangeText={setEndDate}
                                        placeholder="dd-mm-yyyy"
                                        placeholderTextColor={TEXT_LIGHT}
                                    />
                                    <Text style={styles.dateIcon}>📅</Text>
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

const BatchCard = ({ item, onEdit, onDelete }) => (
    <View style={styles.dataCard}>
        <View style={styles.dataGrid}>
            <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>BATCH</Text>
                <Text style={styles.codeText}>{item.batch}</Text>
            </View>
            <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>PLANNED</Text>
                <Text style={styles.valueText}>{item.planned}</Text>
            </View>
        </View>
        <View style={styles.dataGrid}>
            <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>PRODUCED</Text>
                <Text style={styles.valueText}>{item.produced}</Text>
            </View>
            <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>STATUS</Text>
                <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>{item.status}</Text>
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

const BomCard = ({ item }) => (
    <View style={styles.dataCard}>
        <View style={styles.dataGrid}>
            <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>BOM CODE</Text>
                <Text style={styles.codeText}>{item.code}</Text>
            </View>
            <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>OUTPUT VARIANT</Text>
                <Text style={styles.valueText}>{item.outputVariant}</Text>
            </View>
        </View>
        <View style={styles.dataGrid}>
            <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>OUTPUT QTY</Text>
                <Text style={styles.valueText}>{item.outputQty}</Text>
            </View>
            <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>RM LINES</Text>
                <Text style={styles.valueText}>{item.rmLines}</Text>
            </View>
        </View>
        <View style={styles.dataGrid}>
            <View style={styles.gridCol}>
                <Text style={styles.fieldLabel}>STATUS</Text>
                <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>
        </View>
    </View>
);

const TabSwitcher = ({ activeTab, onChange }) => (
    <View style={styles.tabRow}>
        <TouchableOpacity
            style={[styles.tabButton, styles.tabButtonLeft, activeTab === TAB_BATCHES && styles.tabButtonActive]}
            onPress={() => onChange(TAB_BATCHES)}
            activeOpacity={0.85}
        >
            <Text
                style={[styles.tabText, activeTab === TAB_BATCHES && styles.tabTextActive]}
                numberOfLines={2}
            >
                Production Batches
            </Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.tabButton, styles.tabButtonRight, activeTab === TAB_BOM && styles.tabButtonActive]}
            onPress={() => onChange(TAB_BOM)}
            activeOpacity={0.85}
        >
            <Text
                style={[styles.tabText, activeTab === TAB_BOM && styles.tabTextActive]}
                numberOfLines={2}
            >
                Bill of Materials
            </Text>
        </TouchableOpacity>
    </View>
);

const ProductionRunsScreen = () => {
    const navigation = useFinanceNavigation();
    const [activeTab, setActiveTab] = useState(TAB_BATCHES);
    const [batches, setBatches] = useState([]);
    const [bomRows, setBomRows] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [editingBatch, setEditingBatch] = useState(null);

    const fetchProductionData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const [productionRes, batchesRes] = await Promise.all([
                GETNETWORK(buildUrl("production"), true),
                GETNETWORK(buildUrl("batches"), true),
            ]);
            if (!isApiSuccess(productionRes)) {
                setLoadError(getApiMessage(productionRes, "Failed to load production"));
                setBatches([]);
            } else {
                setBatches(extractApiList(productionRes).map(mapProductionBatch));
                setLoadError("");
            }
            if (isApiSuccess(batchesRes)) {
                setBomRows(extractApiList(batchesRes).map(mapBomRow));
            } else {
                setBomRows([]);
            }
        } catch {
            setLoadError("Failed to load production");
            setBatches([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchProductionData();
    }, [fetchProductionData]);

    const handleBack = useCallback(() => {
        if (showBatchModal) {
            setShowBatchModal(false);
            setEditingBatch(null);
            return;
        }
        navigation.goBack();
    }, [navigation, showBatchModal]);

    useEffect(() => {
        if (Platform.OS !== "android") return undefined;
        const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
            if (showBatchModal) {
                setShowBatchModal(false);
                setEditingBatch(null);
                return true;
            }
            navigation.goBack();
            return true;
        });
        return () => subscription.remove();
    }, [navigation, showBatchModal]);

    const onRefresh = useCallback(() => {
        fetchProductionData(true);
    }, [fetchProductionData]);

    const filteredBatches = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return batches;
        return batches.filter(
            (item) =>
                item.batch.toLowerCase().includes(query) ||
                item.status.toLowerCase().includes(query)
        );
    }, [search, batches]);

    const filteredBomRows = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return bomRows;
        return bomRows.filter(
            (item) =>
                item.code.toLowerCase().includes(query) ||
                item.outputVariant.toLowerCase().includes(query) ||
                item.status.toLowerCase().includes(query)
        );
    }, [search, bomRows]);

    const openAddBatchModal = () => {
        setEditingBatch(null);
        setShowBatchModal(true);
    };

    const openEditBatchModal = (item) => {
        setEditingBatch(item);
        setShowBatchModal(true);
    };

    const closeBatchModal = () => {
        setShowBatchModal(false);
        setEditingBatch(null);
    };

    const handleSaveBatch = async (form) => {
        if (form.id) {
            Alert.alert("Edit Batch", "Production batch updates are managed from the web admin.");
            return;
        }
        const res = await POSTNETWORK(
            buildUrl("production"),
            {
                planned_qty: Number(form.planned) || 0,
                produced_qty: Number(form.produced) || 0,
                wastage_qty: 0,
                operator_name: "Shift Supervisor",
            },
            true
        );
        if (!isApiSuccess(res)) {
            Alert.alert("Error", getApiMessage(res, "Production failed"));
            return;
        }
        closeBatchModal();
        fetchProductionData(true);
    };

    const handleDeleteBatch = (item) => {
        Alert.alert("Delete Batch", `Delete "${item.batch}"?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => setBatches((prev) => prev.filter((row) => row.id !== item.id)),
            },
        ]);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearch("");
    };

    const isBatchesTab = activeTab === TAB_BATCHES;
    const listData = isBatchesTab ? filteredBatches : filteredBomRows;

    const listHeader = (
        <View>
            <View style={styles.pageHeader}>
                <Text style={styles.pageTitle}>Production Management</Text>
                <Text style={styles.pageSubtitle}>
                    Manufacturing batches, bill of materials & finished goods stock-in
                </Text>
            </View>

            {isBatchesTab ? (
                <>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionMainTitle}>Production & BOM</Text>
                        <Text style={styles.sectionSubtitle}>Batch management, recipes & yield tracking</Text>
                    </View>

                    <View style={styles.summaryCard}>
                        <View style={styles.summaryTop}>
                            <Text style={styles.summaryLabel}>TOTAL RECORDS</Text>
                            <View style={styles.summaryIconWrap}>
                                <Text style={styles.summaryIcon}>📊</Text>
                            </View>
                        </View>
                        <Text style={styles.summaryValue}>{batches.length}</Text>
                        <Text style={[styles.summaryFooter, loadError && styles.summaryFooterError]}>
                            {loading ? "→ Loading..." : loadError ? `→ ${loadError}` : "→ From database"}
                        </Text>
                    </View>

                    <View style={styles.permissionBanner}>
                        <Text style={styles.permissionText}>You do not have permission for this action</Text>
                    </View>
                </>
            ) : (
                <View style={styles.summaryCard}>
                    <View style={styles.summaryTop}>
                        <Text style={styles.summaryLabel}>ACTIVE BOMS</Text>
                        <View style={styles.summaryIconWrap}>
                            <Text style={styles.summaryIcon}>📋</Text>
                        </View>
                    </View>
                    <Text style={styles.summaryValue}>{bomRows.length}</Text>
                    <Text style={styles.summaryFooter}>→ Recipe definitions</Text>
                </View>
            )}

            <View style={styles.listSection}>
                <Text style={styles.sectionTitle}>
                    {isBatchesTab ? "Production & BOM" : "Bill of Materials"}
                </Text>
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
            SpiceCraft ERP v3.0 • Logged in as Shift Supervisor (Shift Supervisor) • 27
        </Text>
    );

    const renderItem = ({ item }) =>
        isBatchesTab ? (
            <BatchCard item={item} onEdit={openEditBatchModal} onDelete={handleDeleteBatch} />
        ) : (
            <BomCard item={item} />
        );

    const emptyComponent = isBatchesTab ? (
        <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No production batches found</Text>
        </View>
    ) : (
        <View style={styles.emptyWrap}>
            <Text style={styles.emptyInfoText}>
                Create BOMs via API POST /bom or seed data. UI form coming in Phase 3.
            </Text>
        </View>
    );

    return (
        <View style={styles.root}>
            <MyHeader
                showBack
                showCenterTitle
                title="Production Management"
                backgroundColor={WHITE}
                onBackPress={handleBack}
            />

            <View style={styles.tabBar}>
                <TabSwitcher activeTab={activeTab} onChange={handleTabChange} />
            </View>

            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    key={activeTab}
                    extraData={activeTab}
                    data={listData}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListHeaderComponent={listHeader}
                    ListFooterComponent={listFooter}
                    contentContainerStyle={[
                        styles.listContent,
                        !isBatchesTab && styles.listContentNoFab,
                    ]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[BRANDCOLOR]}
                            tintColor={BRANDCOLOR}
                        />
                    }
                    ListEmptyComponent={emptyComponent}
                />

                {isBatchesTab ? (
                    <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={openAddBatchModal}>
                        <Text style={styles.fabIcon}>+</Text>
                    </TouchableOpacity>
                ) : null}

                <NewBatchModal
                    visible={showBatchModal}
                    editingItem={editingBatch}
                    onClose={closeBatchModal}
                    onSave={handleSaveBatch}
                />
            </SafeAreaView>
        </View>
    );
};

export default ProductionRunsScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: SCREEN_BG },
    safeArea: { flex: 1 },
    listContent: { paddingHorizontal: 16, paddingBottom: 88 },
    listContentNoFab: { paddingBottom: 24 },
    tabBar: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 8,
        backgroundColor: SCREEN_BG,
        borderBottomWidth: 1,
        borderBottomColor: BORDER_COLOR,
    },
    pageHeader: { paddingTop: 14, paddingBottom: 10 },
    pageTitle: { fontFamily: UBUNTUBOLD, fontSize: 22, color: TEXT_DARK, marginBottom: 6 },
    pageSubtitle: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_MUTED, lineHeight: 18 },
    tabRow: {
        flexDirection: "row",
        width: "100%",
    },
    tabButton: {
        flex: 1,
        minWidth: 0,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 20,
        backgroundColor: CARD_BG,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        alignItems: "center",
        justifyContent: "center",
    },
    tabButtonLeft: {
        marginRight: 6,
    },
    tabButtonRight: {
        marginLeft: 6,
    },
    tabButtonActive: {
        backgroundColor: PRIMARY_BLUE,
        borderColor: PRIMARY_BLUE,
    },
    tabText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 11,
        color: TEXT_MUTED,
        textAlign: "center",
        lineHeight: 15,
    },
    tabTextActive: { color: WHITE },
    sectionHeader: { marginBottom: 12 },
    sectionMainTitle: { fontFamily: UBUNTUBOLD, fontSize: 18, color: TEXT_DARK, marginBottom: 4 },
    sectionSubtitle: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_MUTED, lineHeight: 18 },
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
    summaryIcon: { fontSize: 16 },
    summaryValue: { fontFamily: UBUNTUBOLD, fontSize: 28, color: TEXT_DARK, marginBottom: 4 },
    summaryFooter: { fontFamily: FIRASANS, fontSize: 11, color: TEXT_LIGHT },
    summaryFooterError: { color: RED },
    permissionBanner: {
        backgroundColor: "#FEE2E2",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#FECACA",
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 12,
    },
    permissionText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 13, color: RED, lineHeight: 18 },
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
    dataCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    dataGrid: { flexDirection: "row", gap: 10, marginBottom: 12, alignItems: "flex-start" },
    gridCol: { flex: 1 },
    fieldLabel: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 9,
        color: TEXT_MUTED,
        letterSpacing: 0.4,
        marginBottom: 4,
    },
    codeText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 13, color: PRIMARY_BLUE },
    valueText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: TEXT_DARK },
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
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN },
    statusText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 11, color: GREEN },
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
    emptyWrap: { paddingVertical: 32, paddingHorizontal: 12, alignItems: "center" },
    emptyText: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_LIGHT },
    emptyInfoText: {
        fontFamily: FIRASANS,
        fontSize: 13,
        color: TEXT_MUTED,
        textAlign: "center",
        lineHeight: 20,
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
