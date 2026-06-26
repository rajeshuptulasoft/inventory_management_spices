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
    useWindowDimensions,
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

const TABS = [
    { id: "dashboard", label: "Dashboard" },
    { id: "chart", label: "Chart Of Accounts" },
    { id: "invoices", label: "Invoices" },
    { id: "journals", label: "Journals" },
    { id: "reports", label: "Reports" },
];

const DASHBOARD_KPIS = [
    { id: "1", label: "OPEN RECEIVABLES", value: "₹0", footer: "→ Unpaid invoices", icon: "📁", iconBg: "#FEE2E2" },
    { id: "2", label: "COLLECTIONS", value: "₹0", footer: "↑ Total received", icon: "💰", iconBg: "#DCFCE7", footerGreen: true },
    { id: "3", label: "INVOICES", value: "0", footer: "→ All invoices", icon: "📄", iconBg: "#DBEAFE" },
    { id: "4", label: "OUTSTANDING", value: "₹0", footer: "→ AR aging total", icon: "⏳", iconBg: "#EDE9FE" },
];

const REPORTS_KPIS = [
    { id: "1", label: "REVENUE", value: "₹0", footer: "↑ P&L", icon: "📈", iconBg: "#CCFBF1", footerGreen: true },
    { id: "2", label: "EXPENSES", value: "₹0", footer: "→ P&L", icon: "📉", iconBg: "#FEE2E2" },
    { id: "3", label: "NET PROFIT", value: "₹0", footer: "↑ YTD", icon: "📊", iconBg: "#DBEAFE", footerGreen: true },
];

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

const CreateGstInvoiceModal = ({ visible, onClose, onSave }) => {
    const [invoiceNo, setInvoiceNo] = useState("");
    const [partyId, setPartyId] = useState("0");
    const [invoiceDate, setInvoiceDate] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [variantId, setVariantId] = useState("0");
    const [quantity, setQuantity] = useState("1");
    const [rate, setRate] = useState("0");
    const [gstPercent, setGstPercent] = useState("5");

    const resetForm = () => {
        setInvoiceNo("");
        setPartyId("0");
        setInvoiceDate("");
        setDueDate("");
        setVariantId("0");
        setQuantity("1");
        setRate("0");
        setGstPercent("5");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSave = () => {
        if (!invoiceNo.trim() || !partyId.trim() || !invoiceDate.trim() || !variantId.trim() || !quantity.trim() || !rate.trim()) {
            Alert.alert("Required Fields", "Please fill all required fields.");
            return;
        }
        const qty = Number(quantity) || 0;
        const rateVal = Number(rate) || 0;
        const gst = Number(gstPercent) || 0;
        const subtotal = qty * rateVal;
        const gstAmount = (subtotal * gst) / 100;
        const total = subtotal + gstAmount;

        onSave({
            invoiceNo: invoiceNo.trim(),
            partyId: partyId.trim(),
            invoiceDate: invoiceDate.trim(),
            dueDate: dueDate.trim(),
            variantId: variantId.trim(),
            quantity: quantity.trim(),
            rate: rate.trim(),
            gstPercent: gstPercent.trim(),
            gstAmount,
            total,
        });
        resetForm();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <View style={styles.modalOverlay}>
                <Pressable style={styles.modalBackdrop} onPress={handleClose} />
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalKeyboard}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create GST Invoice</Text>
                            <TouchableOpacity onPress={handleClose} style={styles.closeButton} activeOpacity={0.85}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <FormField label="INVOICE NO" required>
                                <TextInput style={styles.formInput} value={invoiceNo} onChangeText={setInvoiceNo} placeholderTextColor={TEXT_LIGHT} autoCapitalize="characters" />
                            </FormField>
                            <FormField label="PARTY ID" required>
                                <TextInput style={styles.formInput} value={partyId} onChangeText={setPartyId} keyboardType="numeric" placeholderTextColor={TEXT_LIGHT} />
                            </FormField>
                            <FormField label="INVOICE DATE" required>
                                <View style={styles.dateInputRow}>
                                    <TextInput style={[styles.formInput, styles.dateInput]} value={invoiceDate} onChangeText={setInvoiceDate} placeholder="dd-mm-yyyy" placeholderTextColor={TEXT_LIGHT} />
                                    <Text style={styles.calendarIcon}>📅</Text>
                                </View>
                            </FormField>
                            <FormField label="DUE DATE">
                                <View style={styles.dateInputRow}>
                                    <TextInput style={[styles.formInput, styles.dateInput]} value={dueDate} onChangeText={setDueDate} placeholder="dd-mm-yyyy" placeholderTextColor={TEXT_LIGHT} />
                                    <Text style={styles.calendarIcon}>📅</Text>
                                </View>
                            </FormField>
                            <FormField label="VARIANT ID" required>
                                <TextInput style={styles.formInput} value={variantId} onChangeText={setVariantId} keyboardType="numeric" placeholderTextColor={TEXT_LIGHT} />
                            </FormField>
                            <FormField label="QUANTITY" required>
                                <TextInput style={styles.formInput} value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholderTextColor={TEXT_LIGHT} />
                            </FormField>
                            <FormField label="RATE" required>
                                <TextInput style={styles.formInput} value={rate} onChangeText={setRate} keyboardType="numeric" placeholderTextColor={TEXT_LIGHT} />
                            </FormField>
                            <FormField label="GST %">
                                <TextInput style={styles.formInput} value={gstPercent} onChangeText={setGstPercent} keyboardType="numeric" placeholderTextColor={TEXT_LIGHT} />
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

const KpiCard = ({ item, width }) => (
    <View style={[styles.kpiCard, { width }]}>
        <View style={styles.kpiTop}>
            <Text style={styles.kpiLabel}>{item.label}</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: item.iconBg }]}>
                <Text style={styles.kpiIcon}>{item.icon}</Text>
            </View>
        </View>
        <Text style={styles.kpiValue}>{item.value}</Text>
        <Text style={[styles.kpiFooter, item.footerGreen && styles.kpiFooterGreen]}>{item.footer}</Text>
    </View>
);

const AccountCard = ({ item }) => (
    <View style={styles.dataCard}>
        <View style={styles.dataCardTop}>
            <Text style={styles.codeText}>{item.code}</Text>
            <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{item.status}</Text>
            </View>
        </View>
        <Text style={styles.cardTitle}>{item.account}</Text>
        <View style={styles.metaRow}>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>TYPE</Text>
                <Text style={styles.metaValue}>{item.type}</Text>
            </View>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>OPENING</Text>
                <Text style={styles.metaValue}>{item.opening}</Text>
            </View>
        </View>
    </View>
);

const InvoiceCard = ({ item, onEdit }) => (
    <View style={styles.dataCard}>
        <View style={styles.dataCardTop}>
            <Text style={styles.codeText}>{item.invoiceId}</Text>
            <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{item.status}</Text>
            </View>
        </View>
        <Text style={styles.cardTitle}>Party #{item.partyId}</Text>
        <View style={styles.metaRow}>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>DATE</Text>
                <Text style={styles.metaValue}>{item.date || "—"}</Text>
            </View>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>GST</Text>
                <Text style={styles.metaValue}>{item.gst}</Text>
            </View>
        </View>
        <View style={styles.metaRow}>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>TOTAL</Text>
                <Text style={styles.amountValue}>{item.total}</Text>
            </View>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>PAID</Text>
                <Text style={styles.metaValue}>{item.paid}</Text>
            </View>
        </View>
        <TouchableOpacity style={styles.editButton} activeOpacity={0.85} onPress={() => onEdit(item)}>
            <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
    </View>
);

const JournalCard = ({ item }) => (
    <View style={styles.dataCard}>
        <View style={styles.dataCardTop}>
            <Text style={styles.codeText}>{item.entry}</Text>
            <Text style={styles.dateText}>{item.date || "—"}</Text>
        </View>
        <Text style={styles.cardSubtitle}>{item.narration || "—"}</Text>
        <View style={styles.metaRow}>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>DEBIT</Text>
                <Text style={styles.metaValue}>{item.debit}</Text>
            </View>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>CREDIT</Text>
                <Text style={styles.metaValue}>{item.credit}</Text>
            </View>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>LINES</Text>
                <Text style={styles.metaValue}>{item.lines}</Text>
            </View>
        </View>
    </View>
);

const ReportRowCard = ({ item }) => (
    <View style={styles.dataCard}>
        <Text style={styles.codeText}>{item.code || item.invoice}</Text>
        <Text style={styles.cardTitle}>{item.account || item.party}</Text>
        <View style={styles.metaRow}>
            {item.debit !== undefined ? (
                <>
                    <View style={styles.metaCol}>
                        <Text style={styles.fieldLabel}>DEBIT</Text>
                        <Text style={styles.metaValue}>{item.debit}</Text>
                    </View>
                    <View style={styles.metaCol}>
                        <Text style={styles.fieldLabel}>CREDIT</Text>
                        <Text style={styles.metaValue}>{item.credit}</Text>
                    </View>
                    <View style={styles.metaCol}>
                        <Text style={styles.fieldLabel}>BALANCE</Text>
                        <Text style={styles.metaValue}>{item.balance}</Text>
                    </View>
                </>
            ) : (
                <>
                    <View style={styles.metaCol}>
                        <Text style={styles.fieldLabel}>DUE</Text>
                        <Text style={styles.metaValue}>{item.due}</Text>
                    </View>
                    <View style={styles.metaCol}>
                        <Text style={styles.fieldLabel}>DAYS PAST</Text>
                        <Text style={styles.metaValue}>{item.daysPast}</Text>
                    </View>
                    <View style={styles.metaCol}>
                        <Text style={styles.fieldLabel}>OUTSTANDING</Text>
                        <Text style={styles.amountValue}>{item.outstanding}</Text>
                    </View>
                </>
            )}
        </View>
        {item.bucket ? (
            <Text style={styles.bucketText}>Bucket: {item.bucket}</Text>
        ) : null}
    </View>
);

const FinanceAccountsScreen = () => {
    const navigation = useFinanceNavigation();
    const { width } = useWindowDimensions();
    const kpiWidth = (width - 48) / 2;

    const [activeTab, setActiveTab] = useState("dashboard");
    const [accounts, setAccounts] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [journals, setJournals] = useState([]);
    const [trialBalance, setTrialBalance] = useState([]);
    const [arAging, setArAging] = useState([]);
    const [search, setSearch] = useState("");
    const [trialSearch, setTrialSearch] = useState("");
    const [arSearch, setArSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);

    const handleBack = useCallback(() => {
        if (showInvoiceModal) {
            setShowInvoiceModal(false);
            return;
        }
        navigation.goBack();
    }, [navigation, showInvoiceModal]);

    useEffect(() => {
        if (Platform.OS !== "android") return undefined;
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            if (showInvoiceModal) {
                setShowInvoiceModal(false);
                return true;
            }
            navigation.goBack();
            return true;
        });
        return () => sub.remove();
    }, [navigation, showInvoiceModal]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const filteredAccounts = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return accounts;
        return accounts.filter((i) => i.code.toLowerCase().includes(q) || i.account.toLowerCase().includes(q));
    }, [accounts, search]);

    const filteredInvoices = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return invoices;
        return invoices.filter((i) => i.invoiceId.toLowerCase().includes(q) || i.partyId.includes(q));
    }, [invoices, search]);

    const filteredJournals = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return journals;
        return journals.filter((i) => i.entry.toLowerCase().includes(q) || (i.narration || "").toLowerCase().includes(q));
    }, [journals, search]);

    const filteredTrial = useMemo(() => {
        const q = trialSearch.trim().toLowerCase();
        if (!q) return trialBalance;
        return trialBalance.filter((i) => i.code.toLowerCase().includes(q) || i.account.toLowerCase().includes(q));
    }, [trialBalance, trialSearch]);

    const filteredAr = useMemo(() => {
        const q = arSearch.trim().toLowerCase();
        if (!q) return arAging;
        return arAging.filter((i) => (i.invoice || "").toLowerCase().includes(q) || (i.party || "").toLowerCase().includes(q));
    }, [arAging, arSearch]);

    const handleSaveInvoice = (form) => {
        setInvoices((prev) => [
            ...prev,
            {
                id: String(Date.now()),
                invoiceId: form.invoiceNo,
                partyId: form.partyId,
                date: form.invoiceDate,
                dueDate: form.dueDate,
                gst: formatAmount(form.gstAmount),
                total: formatAmount(form.total),
                paid: "₹0",
                status: "Pending",
            },
        ]);
        setShowInvoiceModal(false);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "dashboard":
                return (
                    <>
                        <View style={styles.kpiGrid}>
                            {DASHBOARD_KPIS.map((item) => (
                                <KpiCard key={item.id} item={item} width={kpiWidth} />
                            ))}
                        </View>
                        <View style={styles.sectionCard}>
                            <Text style={styles.sectionTitle}>Receivable Aging</Text>
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>No aging data</Text>
                            </View>
                        </View>
                    </>
                );
            case "chart":
                return (
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>Chart of Accounts ({accounts.length})</Text>
                        </View>
                        <View style={styles.searchBox}>
                            <Text style={styles.searchIcon}>🔍</Text>
                            <TextInput style={styles.searchInput} placeholder="Search..." placeholderTextColor={TEXT_LIGHT} value={search} onChangeText={setSearch} />
                        </View>
                        <View style={styles.tableHeaderRow}>
                            <Text style={[styles.tableHeaderText, { flex: 1 }]}>CODE</Text>
                            <Text style={[styles.tableHeaderText, { flex: 2 }]}>ACCOUNT</Text>
                            <Text style={[styles.tableHeaderText, { width: 50 }]}>TYPE</Text>
                        </View>
                        {filteredAccounts.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>No accounts found</Text>
                            </View>
                        ) : (
                            filteredAccounts.map((item) => <AccountCard key={item.id} item={item} />)
                        )}
                    </View>
                );
            case "invoices":
                return (
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>GST Invoices</Text>
                        <View style={styles.searchBox}>
                            <Text style={styles.searchIcon}>🔍</Text>
                            <TextInput style={styles.searchInput} placeholder="Search..." placeholderTextColor={TEXT_LIGHT} value={search} onChangeText={setSearch} />
                        </View>
                        <View style={styles.tableHeaderRow}>
                            <Text style={[styles.tableHeaderText, { width: "22%" }]}>INVOICE</Text>
                            <Text style={[styles.tableHeaderText, { flex: 1 }]}>PARTY</Text>
                            <Text style={[styles.tableHeaderText, { width: "18%" }]}>TOTAL</Text>
                            <Text style={[styles.tableHeaderText, { width: "18%" }]}>STATUS</Text>
                        </View>
                        {filteredInvoices.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>No invoices found</Text>
                            </View>
                        ) : (
                            filteredInvoices.map((item) => (
                                <InvoiceCard key={item.id} item={item} onEdit={(i) => Alert.alert("Edit", i.invoiceId)} />
                            ))
                        )}
                    </View>
                );
            case "journals":
                return (
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Journal Vouchers</Text>
                        <View style={styles.searchBox}>
                            <Text style={styles.searchIcon}>🔍</Text>
                            <TextInput style={styles.searchInput} placeholder="Search..." placeholderTextColor={TEXT_LIGHT} value={search} onChangeText={setSearch} />
                        </View>
                        <View style={styles.tableHeaderRow}>
                            <Text style={[styles.tableHeaderText, { width: "20%" }]}>ENTRY</Text>
                            <Text style={[styles.tableHeaderText, { width: "18%" }]}>DATE</Text>
                            <Text style={[styles.tableHeaderText, { flex: 1 }]}>NARRATION</Text>
                        </View>
                        {filteredJournals.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>No journal vouchers found</Text>
                            </View>
                        ) : (
                            filteredJournals.map((item) => <JournalCard key={item.id} item={item} />)
                        )}
                    </View>
                );
            case "reports":
                return (
                    <>
                        <View style={styles.kpiGrid}>
                            {REPORTS_KPIS.map((item) => (
                                <KpiCard key={item.id} item={item} width={kpiWidth} />
                            ))}
                        </View>
                        <View style={styles.sectionCard}>
                            <Text style={styles.sectionTitle}>Trial Balance</Text>
                            <View style={styles.searchBox}>
                                <Text style={styles.searchIcon}>🔍</Text>
                                <TextInput style={styles.searchInput} placeholder="Search..." placeholderTextColor={TEXT_LIGHT} value={trialSearch} onChangeText={setTrialSearch} />
                            </View>
                            {filteredTrial.length === 0 ? (
                                <View style={styles.emptyBox}>
                                    <Text style={styles.emptyText}>No trial balance data</Text>
                                </View>
                            ) : (
                                filteredTrial.map((item) => <ReportRowCard key={item.id} item={item} />)
                            )}
                        </View>
                        <View style={styles.sectionCard}>
                            <Text style={styles.sectionTitle}>AR Aging Detail</Text>
                            <View style={styles.searchBox}>
                                <Text style={styles.searchIcon}>🔍</Text>
                                <TextInput style={styles.searchInput} placeholder="Search..." placeholderTextColor={TEXT_LIGHT} value={arSearch} onChangeText={setArSearch} />
                            </View>
                            {filteredAr.length === 0 ? (
                                <View style={styles.emptyBox}>
                                    <Text style={styles.emptyText}>No AR aging data</Text>
                                </View>
                            ) : (
                                filteredAr.map((item) => <ReportRowCard key={item.id} item={item} />)
                            )}
                        </View>
                    </>
                );
            default:
                return null;
        }
    };

    const listHeader = (
        <View>
            <View style={styles.pageHeader}>
                <Text style={styles.pageTitle}>Finance & Accounting</Text>
                <Text style={styles.pageSubtitle}>GST billing, GL reports, receivable aging & journal vouchers</Text>
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
            {renderTabContent()}
        </View>
    );

    return (
        <View style={styles.root}>
            <MyHeader showBack showCenterTitle title="Finance & Accounts" backgroundColor={WHITE} onBackPress={handleBack} />
            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={[]}
                    keyExtractor={(_, i) => String(i)}
                    renderItem={null}
                    ListHeaderComponent={listHeader}
                    ListFooterComponent={
                        <Text style={styles.footerText}>SpiceCraft ERP v3.0 • Logged in as Rajesh Sahoo (Finance Head) • 24</Text>
                    }
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[BRANDCOLOR]} tintColor={BRANDCOLOR} />}
                />
                {activeTab === "invoices" ? (
                    <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={() => setShowInvoiceModal(true)}>
                        <Text style={styles.fabIcon}>+</Text>
                    </TouchableOpacity>
                ) : null}
                <CreateGstInvoiceModal visible={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} onSave={handleSaveInvoice} />
            </SafeAreaView>
        </View>
    );
};

export default FinanceAccountsScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: SCREEN_BG },
    safeArea: { flex: 1 },
    listContent: { paddingHorizontal: 16, paddingBottom: 88 },
    pageHeader: { paddingTop: 14, paddingBottom: 12 },
    pageTitle: { fontFamily: UBUNTUBOLD, fontSize: 22, color: TEXT_DARK, marginBottom: 6 },
    pageSubtitle: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_MUTED, lineHeight: 18 },
    tabScroll: { marginBottom: 14 },
    tabRow: { gap: 8, paddingRight: 8 },
    tabPill: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER_COLOR },
    tabPillActive: { backgroundColor: PRIMARY_BLUE, borderColor: PRIMARY_BLUE },
    tabPillText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 12, color: TEXT_MUTED },
    tabPillTextActive: { color: WHITE },
    kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 14 },
    kpiCard: { backgroundColor: CARD_BG, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: BORDER_COLOR },
    kpiTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
    kpiLabel: { fontFamily: FIRASANSSEMIBOLD, fontSize: 9, color: TEXT_MUTED, letterSpacing: 0.3, flex: 1 },
    kpiIconWrap: { width: 28, height: 28, borderRadius: 8, justifyContent: "center", alignItems: "center" },
    kpiIcon: { fontSize: 14 },
    kpiValue: { fontFamily: UBUNTUBOLD, fontSize: 22, color: TEXT_DARK, marginBottom: 4 },
    kpiFooter: { fontFamily: FIRASANS, fontSize: 11, color: TEXT_MUTED },
    kpiFooterGreen: { color: GREEN },
    sectionCard: { backgroundColor: CARD_BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER_COLOR, padding: 14, marginBottom: 14 },
    sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    sectionTitle: { fontFamily: UBUNTUBOLD, fontSize: 16, color: TEXT_DARK, marginBottom: 10 },
    searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#F9FAFB", borderRadius: 10, borderWidth: 1, borderColor: BORDER_COLOR, paddingHorizontal: 12, marginBottom: 12 },
    searchIcon: { fontSize: 14, marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 11, fontFamily: FIRASANS, fontSize: 14, color: TEXT_DARK },
    tableHeaderRow: { flexDirection: "row", paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#F3F4F6", borderBottomWidth: 1, borderBottomColor: "#F3F4F6", marginBottom: 8 },
    tableHeaderText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 8, color: TEXT_MUTED, letterSpacing: 0.3 },
    dataCard: { backgroundColor: "#F9FAFB", borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: BORDER_COLOR },
    dataCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, gap: 8 },
    codeText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 13, color: PRIMARY_BLUE },
    dateText: { fontFamily: FIRASANS, fontSize: 12, color: TEXT_MUTED },
    cardTitle: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: TEXT_DARK, marginBottom: 10 },
    cardSubtitle: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_DARK, marginBottom: 10, lineHeight: 18 },
    statusBadge: { backgroundColor: "#ECFDF5", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
    statusText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 11, color: GREEN },
    metaRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
    metaCol: { flex: 1 },
    fieldLabel: { fontFamily: FIRASANSSEMIBOLD, fontSize: 9, color: TEXT_MUTED, letterSpacing: 0.4, marginBottom: 4 },
    metaValue: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_DARK },
    amountValue: { fontFamily: UBUNTUBOLD, fontSize: 15, color: TEXT_DARK },
    bucketText: { fontFamily: FIRASANS, fontSize: 12, color: TEXT_MUTED, marginTop: 4 },
    editButton: { backgroundColor: PRIMARY_BLUE, borderRadius: 8, paddingVertical: 9, alignItems: "center", marginTop: 4 },
    editButtonText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 13, color: WHITE },
    emptyBox: { paddingVertical: 36, alignItems: "center" },
    emptyText: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_LIGHT },
    footerText: { fontFamily: FIRASANS, fontSize: 11, color: TEXT_LIGHT, textAlign: "center", marginTop: 8, lineHeight: 16, paddingBottom: 24 },
    fab: { position: "absolute", right: 20, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: PRIMARY_BLUE, justifyContent: "center", alignItems: "center", elevation: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6 },
    fabIcon: { fontFamily: UBUNTUBOLD, fontSize: 28, color: WHITE, lineHeight: 30, marginTop: -2 },
    modalOverlay: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
    modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
    modalKeyboard: { width: "100%", zIndex: 1 },
    modalCard: { backgroundColor: CARD_BG, borderRadius: 16, padding: 20, maxHeight: "88%", borderWidth: 1, borderColor: BORDER_COLOR },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    modalTitle: { fontFamily: UBUNTUBOLD, fontSize: 20, color: TEXT_DARK },
    closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center" },
    closeButtonText: { fontSize: 16, color: TEXT_MUTED },
    formField: { marginBottom: 16 },
    formLabel: { fontFamily: FIRASANSSEMIBOLD, fontSize: 11, color: TEXT_MUTED, letterSpacing: 0.5, marginBottom: 8 },
    required: { color: RED },
    formInput: { backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontFamily: FIRASANS, fontSize: 15, color: TEXT_DARK },
    dateInputRow: { position: "relative", justifyContent: "center" },
    dateInput: { paddingRight: 44 },
    calendarIcon: { position: "absolute", right: 14, fontSize: 18 },
    modalActions: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 16, marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
    cancelButton: { paddingVertical: 10, paddingHorizontal: 8 },
    cancelButtonText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: TEXT_MUTED },
    saveButton: { backgroundColor: PRIMARY_BLUE, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 22 },
    saveButtonText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: WHITE },
});
