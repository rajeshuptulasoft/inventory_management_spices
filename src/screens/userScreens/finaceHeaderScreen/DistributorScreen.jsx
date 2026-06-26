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

const INITIAL_DISTRIBUTORS = [];

const FormField = ({ label, required, children }) => (
    <View style={styles.formField}>
        <Text style={styles.formLabel}>
            {label}
            {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
        {children}
    </View>
);

const AddDistributorModal = ({ visible, onClose, onSave }) => {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [creditLimit, setCreditLimit] = useState("0");
    const [status, setStatus] = useState("Active");

    const resetForm = () => {
        setCode("");
        setName("");
        setCreditLimit("0");
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
            code: code.trim(),
            name: name.trim(),
            creditLimit: creditLimit.trim() || "0",
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
                            <Text style={styles.modalTitle}>Add Distributor</Text>
                            <TouchableOpacity
                                onPress={handleClose}
                                style={styles.closeButton}
                                activeOpacity={0.85}
                            >
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

                            <FormField label="CREDIT LIMIT">
                                <TextInput
                                    style={styles.formInput}
                                    value={creditLimit}
                                    onChangeText={setCreditLimit}
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

const DistributorCard = ({ item, onView, onEdit }) => (
    <View style={styles.distributorCard}>
        <View style={styles.distributorCardTop}>
            <View style={styles.distributorInfo}>
                <Text style={styles.codeText}>{item.code}</Text>
                <Text style={styles.distributorName}>{item.name}</Text>
            </View>
            <View style={[styles.statusBadge, item.status === "Inactive" && styles.statusInactive]}>
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

        <View style={styles.distributorMetaRow}>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>CREDIT</Text>
                <Text style={styles.metaValue}>{item.credit}</Text>
            </View>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>OUTSTANDING</Text>
                <Text style={styles.outstandingValue}>{item.outstanding}</Text>
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

const DistributorScreen = () => {
    const navigation = useFinanceNavigation();
    const [distributors, setDistributors] = useState(INITIAL_DISTRIBUTORS);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [showPermissionAlert] = useState(true);
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

    const filteredDistributors = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return distributors;
        return distributors.filter(
            (item) =>
                item.code.toLowerCase().includes(query) ||
                item.name.toLowerCase().includes(query) ||
                item.status.toLowerCase().includes(query)
        );
    }, [search, distributors]);

    const handleSaveDistributor = (form) => {
        const creditAmount = form.creditLimit === "0" ? "₹0" : `₹${form.creditLimit}`;
        const newDistributor = {
            id: String(Date.now()),
            code: form.code,
            name: form.name,
            credit: creditAmount,
            outstanding: "₹0",
            status: form.status,
        };
        setDistributors((prev) => [...prev, newDistributor]);
        setShowAddModal(false);
    };

    const handleView = (item) => {
        Alert.alert("View Distributor", `${item.name} (${item.code})`);
    };

    const handleEdit = (item) => {
        Alert.alert("Edit Distributor", `Edit ${item.name}`);
    };

    const listHeader = (
        <View>
            <View style={styles.pageHeader}>
                <View style={styles.titleBlock}>
                    <Text style={styles.pageTitle}>Distributor Management</Text>
                    <Text style={styles.pageSubtitle}>
                        Track stock, outstanding, orders & performance
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
                <Text style={styles.summaryValue}>{distributors.length}</Text>
                <Text style={styles.summaryError}>→ Error loading</Text>
            </View>

            {showPermissionAlert ? (
                <View style={styles.permissionBanner}>
                    <Text style={styles.permissionText}>You do not have permission for this action</Text>
                </View>
            ) : null}

            <View style={styles.listSection}>
                <View style={styles.listSectionHeader}>
                    <Text style={styles.sectionTitle}>Distributor Management</Text>
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
                    <Text style={[styles.tableHeaderText, styles.colCode]}>CODE</Text>
                    <Text style={[styles.tableHeaderText, styles.colName]}>NAME</Text>
                    <Text style={[styles.tableHeaderText, styles.colCredit]}>CREDIT</Text>
                    <Text style={[styles.tableHeaderText, styles.colOutstanding]}>OUTSTANDING</Text>
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
                title="Distributor"
                backgroundColor={WHITE}
                onBackPress={handleBack}
            />

            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={filteredDistributors}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <DistributorCard item={item} onView={handleView} onEdit={handleEdit} />
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
                            <Text style={styles.emptyText}>No distributors found</Text>
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

                <AddDistributorModal
                    visible={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSave={handleSaveDistributor}
                />
            </SafeAreaView>
        </View>
    );
};

export default DistributorScreen;

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
    summaryError: {
        fontFamily: FIRASANS,
        fontSize: 11,
        color: RED,
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
    colCode: { width: "16%" },
    colName: { flex: 1 },
    colCredit: { width: "18%" },
    colOutstanding: { width: "22%" },
    colStatus: { width: "14%" },
    distributorCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    distributorCardTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
        gap: 8,
    },
    distributorInfo: {
        flex: 1,
    },
    codeText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 13,
        color: PRIMARY_BLUE,
        marginBottom: 4,
    },
    distributorName: {
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
    statusInactive: {
        backgroundColor: "#F3F4F6",
    },
    statusText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 11,
        color: GREEN,
    },
    statusTextInactive: {
        color: TEXT_MUTED,
    },
    distributorMetaRow: {
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
    outstandingValue: {
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
