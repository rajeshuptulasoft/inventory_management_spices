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

const INITIAL_CLAIMS = [];

const CLAIM_TYPES = ["Scheme", "Damage", "Expiry", "Trade"];
const CLAIM_STATUSES = ["Pending", "Approved", "Rejected"];

const formatAmount = (value) => {
    const trimmed = String(value).trim();
    if (!trimmed || trimmed === "0") return "₹0";
    return trimmed.startsWith("₹") ? trimmed : `₹${trimmed}`;
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

const SubmitClaimModal = ({ visible, onClose, onSave }) => {
    const [claimNo, setClaimNo] = useState("");
    const [partyId, setPartyId] = useState("0");
    const [type, setType] = useState("Scheme");
    const [date, setDate] = useState("");
    const [amount, setAmount] = useState("0");
    const [remarks, setRemarks] = useState("");
    const [status, setStatus] = useState("Pending");

    const resetForm = () => {
        setClaimNo("");
        setPartyId("0");
        setType("Scheme");
        setDate("");
        setAmount("0");
        setRemarks("");
        setStatus("Pending");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSave = () => {
        if (!claimNo.trim() || !partyId.trim() || !amount.trim()) {
            Alert.alert("Required Fields", "Please enter Claim No, Party ID, and Amount.");
            return;
        }
        onSave({
            claimNo: claimNo.trim(),
            partyId: partyId.trim(),
            type,
            date: date.trim(),
            amount: amount.trim(),
            remarks: remarks.trim(),
            status,
        });
        resetForm();
    };

    const cycleType = () => {
        setType((prev) => {
            const index = CLAIM_TYPES.indexOf(prev);
            return CLAIM_TYPES[(index + 1) % CLAIM_TYPES.length];
        });
    };

    const cycleStatus = () => {
        setStatus((prev) => {
            const index = CLAIM_STATUSES.indexOf(prev);
            return CLAIM_STATUSES[(index + 1) % CLAIM_STATUSES.length];
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
                            <Text style={styles.modalTitle}>Submit Claim</Text>
                            <TouchableOpacity
                                onPress={handleClose}
                                style={styles.closeButton}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <FormField label="CLAIM NO" required>
                                <TextInput
                                    style={styles.formInput}
                                    value={claimNo}
                                    onChangeText={setClaimNo}
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

                            <FormField label="AMOUNT" required>
                                <TextInput
                                    style={styles.formInput}
                                    value={amount}
                                    onChangeText={setAmount}
                                    keyboardType="numeric"
                                    placeholderTextColor={TEXT_LIGHT}
                                />
                            </FormField>

                            <FormField label="REMARKS">
                                <TextInput
                                    style={[styles.formInput, styles.remarksInput]}
                                    value={remarks}
                                    onChangeText={setRemarks}
                                    placeholderTextColor={TEXT_LIGHT}
                                    multiline
                                    textAlignVertical="top"
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

const ClaimCard = ({ item, onView, onEdit }) => (
    <View style={styles.claimCard}>
        <View style={styles.claimCardTop}>
            <View style={styles.claimInfo}>
                <Text style={styles.claimId}>{item.claimId}</Text>
                <Text style={styles.claimType}>{item.type}</Text>
            </View>
            <View
                style={[
                    styles.statusBadge,
                    item.status === "Pending" && styles.statusPending,
                    item.status === "Rejected" && styles.statusRejected,
                ]}
            >
                <Text
                    style={[
                        styles.statusText,
                        item.status === "Pending" && styles.statusTextPending,
                        item.status === "Rejected" && styles.statusTextRejected,
                    ]}
                >
                    {item.status}
                </Text>
            </View>
        </View>

        <View style={styles.claimMetaRow}>
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

const ClaimScreen = () => {
    const navigation = useFinanceNavigation();
    const [claims, setClaims] = useState(INITIAL_CLAIMS);
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

    const filteredClaims = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return claims;
        return claims.filter(
            (item) =>
                item.claimId.toLowerCase().includes(query) ||
                item.type.toLowerCase().includes(query) ||
                item.status.toLowerCase().includes(query)
        );
    }, [search, claims]);

    const handleSaveClaim = (form) => {
        const newClaim = {
            id: String(Date.now()),
            claimId: form.claimNo,
            partyId: form.partyId,
            type: form.type,
            date: form.date,
            amount: formatAmount(form.amount),
            remarks: form.remarks,
            status: form.status,
        };
        setClaims((prev) => [...prev, newClaim]);
        setShowAddModal(false);
    };

    const handleView = (item) => {
        Alert.alert("View Claim", `Claim ${item.claimId}`);
    };

    const handleEdit = (item) => {
        Alert.alert("Edit Claim", `Edit ${item.claimId}`);
    };

    const listHeader = (
        <View>
            <View style={styles.pageHeader}>
                <View style={styles.titleBlock}>
                    <Text style={styles.pageTitle}>Claims Management</Text>
                    <Text style={styles.pageSubtitle}>
                        Scheme, damage, expiry & trade claims
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
                <Text style={styles.summaryValue}>{claims.length}</Text>
                <Text style={styles.summaryFooter}>→ From database</Text>
            </View>

            <View style={styles.listSection}>
                <View style={styles.listSectionHeader}>
                    <Text style={styles.sectionTitle}>Claims Management</Text>
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
                    <Text style={[styles.tableHeaderText, styles.colClaim]}>CLAIM</Text>
                    <Text style={[styles.tableHeaderText, styles.colType]}>TYPE</Text>
                    <Text style={[styles.tableHeaderText, styles.colAmount]}>AMOUNT</Text>
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
                title="Claim"
                backgroundColor={WHITE}
                onBackPress={handleBack}
            />

            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={filteredClaims}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ClaimCard item={item} onView={handleView} onEdit={handleEdit} />
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
                            <Text style={styles.emptyText}>No claims found</Text>
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

                <SubmitClaimModal
                    visible={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSave={handleSaveClaim}
                />
            </SafeAreaView>
        </View>
    );
};

export default ClaimScreen;

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
    colClaim: { width: "24%" },
    colType: { flex: 1 },
    colAmount: { width: "22%" },
    colStatus: { width: "18%" },
    claimCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    claimCardTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
        gap: 8,
    },
    claimInfo: {
        flex: 1,
    },
    claimId: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 13,
        color: PRIMARY_BLUE,
        marginBottom: 4,
    },
    claimType: {
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
    statusRejected: {
        backgroundColor: "#FEE2E2",
    },
    statusText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 11,
        color: GREEN,
    },
    statusTextPending: {
        color: AMBER,
    },
    statusTextRejected: {
        color: RED,
    },
    claimMetaRow: {
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
    remarksInput: {
        minHeight: 88,
        paddingTop: 12,
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
