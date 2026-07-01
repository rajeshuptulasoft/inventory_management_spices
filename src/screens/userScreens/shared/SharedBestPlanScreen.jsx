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
    DELETENETWORK,
    extractApiList,
    getApiMessage,
    isApiSuccess,
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

const DAY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const STATUS_OPTIONS = ["Active", "Inactive"];

const mapSchemeToBeatPlan = (row) => ({
    id: String(row.id),
    beat: row.code || `BEAT-${row.id}`,
    name: row.name || "",
    day: row.day || row.description || "Monday",
    assignedSo: row.assigned_so || "Unassigned",
    outlets: String(row.outlets ?? row.buy_qty ?? 0),
    status: capitalizeStatus(row.status),
    _raw: row,
});

const isBeatPlan = (row) => {
    const t = String(row.scheme_type || row.type || "").toLowerCase();
    return !t || t.includes("beat");
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

const AddBeatPlanModal = ({ visible, editingItem, onClose, onSave }) => {
    const [beat, setBeat] = useState("");
    const [name, setName] = useState("");
    const [day, setDay] = useState("Monday");
    const [assignedSo, setAssignedSo] = useState("Unassigned");
    const [outlets, setOutlets] = useState("0");
    const [status, setStatus] = useState("Active");

    useEffect(() => {
        if (visible) {
            setBeat(editingItem?.beat ?? "");
            setName(editingItem?.name ?? "");
            setDay(editingItem?.day ?? "Monday");
            setAssignedSo(editingItem?.assignedSo ?? "Unassigned");
            setOutlets(editingItem?.outlets ?? "0");
            setStatus(editingItem?.status ?? "Active");
        }
    }, [visible, editingItem]);

    const resetForm = () => {
        setBeat("");
        setName("");
        setDay("Monday");
        setAssignedSo("Unassigned");
        setOutlets("0");
        setStatus("Active");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSave = () => {
        if (!beat.trim() || !name.trim()) {
            Alert.alert("Required Fields", "Please enter Beat Code and Name.");
            return;
        }
        onSave({
            id: editingItem?.id,
            beat: beat.trim().toUpperCase(),
            name: name.trim(),
            day,
            assignedSo: assignedSo.trim() || "Unassigned",
            outlets: outlets.trim() || "0",
            status,
        });
        resetForm();
    };

    const cycleDay = () => {
        setDay((prev) => DAY_OPTIONS[(DAY_OPTIONS.indexOf(prev) + 1) % DAY_OPTIONS.length]);
    };

    const cycleStatus = () => {
        setStatus((prev) => STATUS_OPTIONS[(STATUS_OPTIONS.indexOf(prev) + 1) % STATUS_OPTIONS.length]);
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
                                {editingItem ? "Edit Beat Plan" : "Add Beat Plan"}
                            </Text>
                            <TouchableOpacity onPress={handleClose} style={styles.closeButton} activeOpacity={0.85}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <FormField label="BEAT CODE" required>
                                <TextInput
                                    style={styles.formInput}
                                    value={beat}
                                    onChangeText={setBeat}
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

                            <FormField label="DAY">
                                <TouchableOpacity style={styles.pickerField} onPress={cycleDay} activeOpacity={0.85}>
                                    <Text style={styles.pickerText}>{day}</Text>
                                    <Text style={styles.pickerChevron}>▾</Text>
                                </TouchableOpacity>
                            </FormField>

                            <FormField label="ASSIGNED SO">
                                <TextInput
                                    style={styles.formInput}
                                    value={assignedSo}
                                    onChangeText={setAssignedSo}
                                    placeholder="Unassigned"
                                    placeholderTextColor={TEXT_LIGHT}
                                />
                            </FormField>

                            <FormField label="OUTLETS">
                                <TextInput
                                    style={styles.formInput}
                                    value={outlets}
                                    onChangeText={setOutlets}
                                    keyboardType="numeric"
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

const SummaryCard = ({ label, value, footer, icon, iconBg }) => (
    <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
            <Text style={styles.summaryLabel}>{label}</Text>
            <View style={[styles.summaryIconWrap, { backgroundColor: iconBg }]}>
                <Text style={styles.summaryIcon}>{icon}</Text>
            </View>
        </View>
        <Text style={styles.summaryValue}>{value}</Text>
        <Text style={styles.summaryFooter}>{footer}</Text>
    </View>
);

const BeatPlanCard = ({ item, onEdit, onDelete }) => {
    const isActive = item.status === "Active";

    return (
        <View style={styles.planCard}>
            <View style={styles.planCardHeader}>
                <View>
                    <Text style={styles.fieldLabel}>BEAT</Text>
                    <Text style={styles.beatCode}>{item.beat}</Text>
                </View>
                <View style={[styles.statusBadge, !isActive && styles.statusInactive]}>
                    <View style={[styles.statusDot, isActive && styles.statusDotActive]} />
                    <Text style={[styles.statusText, !isActive && styles.statusTextInactive]}>{item.status}</Text>
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

const SharedBestPlanScreen = () => {
    const navigation = useFinanceNavigation();
    const [beatPlans, setBeatPlans] = useState([]);
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
            logScreenApi("SharedBestPlanScreen", "fmcg/schemes", res, buildUrl("fmcg/schemes"));
            if (!isApiSuccess(res)) {
                Alert.alert("Error", getApiMessage(res, "Failed to load beat plans"));
                setBeatPlans([]);
                return;
            }
            setBeatPlans(extractApiList(res).filter(isBeatPlan).map(mapSchemeToBeatPlan));
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

    const activeBeats = useMemo(
        () => beatPlans.filter((plan) => plan.status === "Active").length,
        [beatPlans]
    );

    const totalOutlets = useMemo(
        () => beatPlans.reduce((sum, plan) => sum + Number(plan.outlets || 0), 0),
        [beatPlans]
    );

    const filteredPlans = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return beatPlans;
        return beatPlans.filter(
            (row) =>
                row.beat.toLowerCase().includes(query) ||
                row.name.toLowerCase().includes(query) ||
                row.day.toLowerCase().includes(query) ||
                row.assignedSo.toLowerCase().includes(query) ||
                row.status.toLowerCase().includes(query)
        );
    }, [search, beatPlans]);

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

    const handleSavePlan = async (form) => {
        const payload = {
            name: form.name,
            code: form.beat,
            scheme_type: "beat",
            description: `${form.day} · ${form.assignedSo}`,
            buy_qty: Number(form.outlets) || 0,
            free_qty: 0,
            discount_percent: 0,
            discount_amount: 0,
            start_date: null,
            end_date: null,
            status: form.status.toLowerCase(),
            products: [],
            distributors: [],
        };
        const res = await POSTNETWORK(buildUrl("fmcg/schemes"), payload, true);
        logScreenApi("SharedBestPlanScreen", "fmcg/schemes", res, buildUrl("fmcg/schemes"));
        if (!isApiSuccess(res)) {
            Alert.alert("Error", getApiMessage(res, "Save failed"));
            return;
        }
        closeModal();
        loadData();
    };

    const handleDelete = (item) => {
        Alert.alert("Delete Beat Plan", `Delete ${item.name} (${item.beat})?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    const res = await DELETENETWORK(buildUrl(`fmcg/schemes/${item.id}`), true);
                    logScreenApi("SharedBestPlanScreen", "fmcg/schemes/${item.id}", res, buildUrl(`fmcg/schemes/${item.id}`));
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
                <Text style={styles.pageTitle}>Beat Plan Management</Text>
                <Text style={styles.pageSubtitle}>
                    Territory beats, outlet mapping & sales officer routes
                </Text>
            </View>

            <View style={styles.summaryStack}>
                <SummaryCard
                    label="ACTIVE BEATS"
                    value={String(activeBeats)}
                    footer="→ From database"
                    icon="🗺️"
                    iconBg="#DBEAFE"
                />
                <SummaryCard
                    label="TOTAL OUTLETS"
                    value={String(totalOutlets)}
                    footer="→ Mapped retailers/dealers"
                    icon="🏪"
                    iconBg="#EDE9FE"
                />
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
            SpiceCraft ERP v3.0 • Logged in as {footerRole} • 29
        </Text>
    );

    return (
        <View style={styles.root}>
            <MyHeader
                showBack
                showCenterTitle
                title="Best Plan"
                backgroundColor={WHITE}
                onBackPress={handleBack}
            />

            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={filteredPlans}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <BeatPlanCard item={item} onEdit={openEditModal} onDelete={handleDelete} />
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
                            <Text style={styles.emptyText}>No beat plans found</Text>
                        </View>
                    }
                />

                <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={openAddModal}>
                    <Text style={styles.fabIcon}>+</Text>
                </TouchableOpacity>

                <AddBeatPlanModal
                    visible={showModal}
                    editingItem={editingItem}
                    onClose={closeModal}
                    onSave={handleSavePlan}
                />
            </SafeAreaView>
        </View>
    );
};

export default SharedBestPlanScreen;

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
    summaryStack: { paddingBottom: 12 },
    summaryCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        marginBottom: 10,
        maxWidth: 220,
    },
    summaryTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
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
    beatCode: { fontFamily: FIRASANSSEMIBOLD, fontSize: 13, color: PRIMARY_BLUE },
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
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: TEXT_MUTED },
    statusDotActive: { backgroundColor: GREEN },
    statusText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 11, color: GREEN },
    statusTextInactive: { color: TEXT_MUTED },
    planField: { marginBottom: 12 },
    planName: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: TEXT_DARK },
    planRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
    planCol: { flex: 1 },
    fieldValue: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_DARK },
    outletValue: { fontFamily: UBUNTUBOLD, fontSize: 15, color: TEXT_DARK },
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
