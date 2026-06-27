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
import { getObjByKey } from "../../../utils/Storage";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR, WHITE } from "../../../constant/color";
import {
    buildUrl,
    GETNETWORK,
    POSTNETWORK,
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
const AMBER = "#D97706";
const TEAL = "#0D9488";

const ROLE_FOOTER = {
    finance: "Priya Sharma (Finance Department)",
    marketing: "Anita Verma (Marketing Department)",
    shift: "Shift Supervisor (Shift Supervisor)",
};

const mapInvoiceToUi = (row) => {
    const total = Number(row.grand_total ?? 0);
    const paid = Number(row.paid_amount ?? row.amount_paid ?? 0);
    const gst = Number(row.gst_total ?? 0);
    return {
        id: String(row.id),
        invoiceId: row.invoice_number || `INV-${row.id}`,
        party: row.customer?.name || "Walk-in",
        partyId: String(row.customer_id ?? ""),
        date: row.invoice_date || row.created_at?.slice?.(0, 10) || "",
        gst: gst ? `CGST ₹${Math.round(gst / 2)} · SGST ₹${Math.round(gst / 2)}` : "—",
        total: fmtInr(total),
        paid: fmtInr(paid),
        status: capitalizeStatus(row.payment_status || row.status || "draft"),
        rawTotal: total,
        rawPaid: paid,
        _raw: row,
    };
};

const mapCustomerToAccount = (row, index) => ({
    id: String(row.id),
    code: String(1000 + index * 100),
    account: row.name || "",
    type: "Asset",
    opening: fmtInr(row.opening_balance ?? 0),
    status: capitalizeStatus(row.status),
});

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

const getInvoiceStatusStyle = (status) => {
    switch (status) {
        case "Draft":
            return { badge: styles.statusDraft, text: styles.statusDraftText };
        case "Partially Paid":
            return { badge: styles.statusPartial, text: styles.statusPartialText };
        case "Overdue":
            return { badge: styles.statusOverdue, text: styles.statusOverdueText };
        default:
            return { badge: styles.statusBadge, text: styles.statusText };
    }
};

const ReceivableAgingChart = ({ chartData = [], chartMax = 1 }) => (
    <View style={styles.chartWrap}>
        <View style={styles.chartYAxis}>
            {["₹26K", "₹20K", "₹13K", "₹7K", "₹0K"].map((label) => (
                <Text key={label} style={styles.chartYLabel}>
                    {label}
                </Text>
            ))}
        </View>
        <View style={styles.chartBody}>
            <View style={styles.chartGrid}>
                {[0, 1, 2, 3, 4].map((i) => (
                    <View key={i} style={styles.chartGridLine} />
                ))}
            </View>
            <View style={styles.chartBars}>
                {chartData.map((item) => {
                    return (
                        <View key={item.label} style={styles.chartBarCol}>
                            <View style={styles.chartBarTrack}>
                                <View
                                    style={[
                                        styles.chartBar,
                                        {
                                            height: Math.max((item.value / chartMax) * 140, item.value > 0 ? 6 : 0),
                                            backgroundColor: item.color,
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={styles.chartXLabel}>{item.label}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    </View>
);

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
                <View style={styles.statusDot} />
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

const InvoiceCard = ({ item }) => {
    const statusStyle = getInvoiceStatusStyle(item.status);
    return (
        <View style={styles.dataCard}>
            <View style={styles.dataCardTop}>
                <Text style={styles.codeText}>{item.invoiceId}</Text>
                <View style={[styles.statusBadge, statusStyle.badge]}>
                    <Text style={[styles.statusText, statusStyle.text]}>{item.status}</Text>
                </View>
            </View>
            <Text style={styles.cardTitle}>{item.party}</Text>
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
                    <Text style={styles.amountGreen}>{item.total}</Text>
                </View>
                <View style={styles.metaCol}>
                    <Text style={styles.fieldLabel}>PAID</Text>
                    <Text style={styles.metaValue}>{item.paid}</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.submitDocsButton} activeOpacity={0.85}>
                <Text style={styles.submitDocsText}>Submit + Docs</Text>
            </TouchableOpacity>
        </View>
    );
};

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

const ReportRowCard = ({ item, variant }) => (
    <View style={styles.dataCard}>
        <Text style={styles.codeText}>{item.code || item.invoice}</Text>
        <Text style={styles.cardTitle}>{item.account || item.party}</Text>
        <View style={styles.metaRow}>
            {variant === "trial" ? (
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
                        <Text style={[styles.metaValue, item.balance?.startsWith("₹-") && styles.negativeBalance]}>
                            {item.balance}
                        </Text>
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
                        <Text style={[styles.metaValue, item.highlight && styles.highlightValue]}>{item.daysPast}</Text>
                    </View>
                    <View style={styles.metaCol}>
                        <Text style={styles.fieldLabel}>OUTSTANDING</Text>
                        <Text style={[styles.amountGreen, item.highlight && styles.highlightAmount]}>{item.outstanding}</Text>
                    </View>
                </>
            )}
        </View>
        {item.bucket ? <Text style={styles.bucketText}>Bucket: {item.bucket}</Text> : null}
    </View>
);

const SharedFinanceAccountsScreen = () => {
    const navigation = useFinanceNavigation();
    const { width } = useWindowDimensions();
    const kpiWidth = (width - 48) / 2;

    const [activeTab, setActiveTab] = useState("dashboard");
    const [accounts, setAccounts] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [journals, setJournals] = useState([]);
    const [trialBalance, setTrialBalance] = useState([]);
    const [arAging, setArAging] = useState([]);
    const [search, setSearch] = useState("");
    const [trialSearch, setTrialSearch] = useState("");
    const [arSearch, setArSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [footerRole, setFooterRole] = useState(ROLE_FOOTER.shift);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [invRes, custRes] = await Promise.all([
                GETNETWORK(buildUrl("invoices"), true),
                GETNETWORK(buildUrl("customers"), true),
            ]);
            const invRows = isApiSuccess(invRes) ? extractApiList(invRes).map(mapInvoiceToUi) : [];
            const custRows = isApiSuccess(custRes) ? extractApiList(custRes) : [];
            if (!isApiSuccess(invRes)) {
                Alert.alert("Error", getApiMessage(invRes, "Failed to load invoices"));
            }
            setInvoices(invRows);
            setCustomers(custRows);
            setAccounts(custRows.map(mapCustomerToAccount));
            setJournals(
                invRows.map((inv) => ({
                    id: inv.id,
                    entry: `JE-${inv.invoiceId}`,
                    date: inv.date,
                    narration: `Sales invoice ${inv.invoiceId}`,
                    debit: inv.total,
                    credit: inv.total,
                    lines: "2",
                }))
            );
            const outstandingTotal = invRows.reduce((s, inv) => s + Math.max(inv.rawTotal - inv.rawPaid, 0), 0);
            const collectionsTotal = invRows.reduce((s, inv) => s + inv.rawPaid, 0);
            const revenueTotal = invRows.reduce((s, inv) => s + inv.rawTotal, 0);
            setTrialBalance([
                {
                    id: "1",
                    code: "1100",
                    account: "Accounts Receivable",
                    debit: fmtInr(outstandingTotal + collectionsTotal),
                    credit: fmtInr(collectionsTotal),
                    balance: fmtInr(outstandingTotal),
                },
            ]);
            setArAging(
                invRows
                    .filter((inv) => inv.rawTotal > inv.rawPaid)
                    .map((inv) => ({
                        id: inv.id,
                        invoice: inv.invoiceId,
                        party: inv.party,
                        due: inv.date,
                        daysPast: "0",
                        outstanding: fmtInr(inv.rawTotal - inv.rawPaid),
                        bucket: "0-30 days",
                        highlight: false,
                    }))
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const dashboardKpis = useMemo(() => {
        const openReceivables = invoices.reduce((s, inv) => s + Math.max(inv.rawTotal - inv.rawPaid, 0), 0);
        const collections = invoices.reduce((s, inv) => s + inv.rawPaid, 0);
        return [
            { ...DASHBOARD_KPIS[0], value: fmtInr(openReceivables) },
            { ...DASHBOARD_KPIS[1], value: fmtInr(collections) },
            { ...DASHBOARD_KPIS[2], value: String(invoices.length) },
            { ...DASHBOARD_KPIS[3], value: fmtInr(openReceivables) },
        ];
    }, [invoices]);

    const reportsKpis = useMemo(() => {
        const revenue = invoices.reduce((s, inv) => s + inv.rawTotal, 0);
        return [
            { ...REPORTS_KPIS[0], value: fmtInr(revenue) },
            { ...REPORTS_KPIS[1], value: fmtInr(0) },
            { ...REPORTS_KPIS[2], value: fmtInr(revenue) },
        ];
    }, [invoices]);

    const agingChartData = useMemo(() => {
        const buckets = { "0-30 days": 0, "31-60 days": 0, "61-90 days": 0, "90+ days": 0 };
        arAging.forEach((row) => {
            const key = row.bucket in buckets ? row.bucket : "0-30 days";
            buckets[key] += parseFloat(String(row.outstanding).replace(/[₹,]/g, "")) || 0;
        });
        return [
            { label: "0-30 days", value: buckets["0-30 days"], color: PRIMARY_BLUE },
            { label: "31-60 days", value: buckets["31-60 days"], color: AMBER },
            { label: "61-90 days", value: buckets["61-90 days"], color: TEXT_LIGHT },
            { label: "90+ days", value: buckets["90+ days"], color: TEXT_LIGHT },
        ];
    }, [arAging]);

    const agingChartMax = useMemo(
        () => Math.max(...agingChartData.map((d) => d.value), 1),
        [agingChartData]
    );

    useEffect(() => {
        getObjByKey("loginResponse").then((session) => {
            const role = session?.role;
            if (role && ROLE_FOOTER[role]) {
                setFooterRole(ROLE_FOOTER[role]);
            }
        });
    }, []);

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
        loadData();
    }, [loadData]);

    const filteredAccounts = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return accounts;
        return accounts.filter(
            (i) =>
                i.code.toLowerCase().includes(q) ||
                i.account.toLowerCase().includes(q) ||
                i.type.toLowerCase().includes(q)
        );
    }, [accounts, search]);

    const filteredInvoices = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return invoices;
        return invoices.filter(
            (i) =>
                i.invoiceId.toLowerCase().includes(q) ||
                (i.party || "").toLowerCase().includes(q) ||
                i.status.toLowerCase().includes(q)
        );
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

    const handleSaveInvoice = async (form) => {
        const res = await POSTNETWORK(
            buildUrl("invoices"),
            {
                customer_id: form.partyId ? Number(form.partyId) : null,
                items: [
                    {
                        variant_id: Number(form.variantId),
                        quantity: Number(form.quantity),
                    },
                ],
            },
            true
        );
        if (!isApiSuccess(res)) {
            Alert.alert("Error", getApiMessage(res, "Failed to create invoice"));
            return;
        }
        setShowInvoiceModal(false);
        loadData();
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "dashboard":
                return (
                    <>
                        <View style={styles.kpiGrid}>
                            {dashboardKpis.map((item) => (
                                <KpiCard key={item.id} item={item} width={kpiWidth} />
                            ))}
                        </View>
                        <View style={styles.sectionCard}>
                            <Text style={styles.sectionTitle}>Receivable Aging</Text>
                            <ReceivableAgingChart chartData={agingChartData} chartMax={agingChartMax} />
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
                            filteredInvoices.map((item) => <InvoiceCard key={item.id} item={item} />)
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
                            {reportsKpis.map((item) => (
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
                                filteredTrial.map((item) => <ReportRowCard key={item.id} item={item} variant="trial" />)
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
                                filteredAr.map((item) => <ReportRowCard key={item.id} item={item} variant="ar" />)
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
            <View style={styles.subAdminBanner}>
                <Text style={styles.subAdminBannerText}>Sub Admin Access</Text>
            </View>

            <View style={styles.pageHeader}>
                <Text style={styles.pageTitle}>Finance & Accounting</Text>
                <Text style={styles.pageSubtitle}>GST billing, GL reports, receivable aging & journal vouchers</Text>
            </View>
            <View style={styles.tabRowWrap}>
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
                {activeTab === "invoices" ? (
                    <TouchableOpacity style={styles.gstInvoiceButton} activeOpacity={0.9} onPress={() => setShowInvoiceModal(true)}>
                        <Text style={styles.gstInvoiceButtonText}>+ GST Invoice</Text>
                    </TouchableOpacity>
                ) : null}
            </View>
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
                        <Text style={styles.footerText}>SpiceCraft ERP v3.0 • Logged in as {footerRole} • 29</Text>
                    }
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[BRANDCOLOR]} tintColor={BRANDCOLOR} />}
                />
                <CreateGstInvoiceModal visible={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} onSave={handleSaveInvoice} />
            </SafeAreaView>
        </View>
    );
};

export default SharedFinanceAccountsScreen;

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
    pageHeader: { paddingTop: 12, paddingBottom: 12 },
    pageTitle: { fontFamily: UBUNTUBOLD, fontSize: 22, color: TEXT_DARK, marginBottom: 6 },
    pageSubtitle: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_MUTED, lineHeight: 18 },
    tabRowWrap: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 8 },
    tabScroll: { flex: 1 },
    tabRow: { gap: 8, paddingRight: 8 },
    gstInvoiceButton: {
        backgroundColor: GREEN,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 9,
    },
    gstInvoiceButtonText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 11, color: WHITE },
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
    chartWrap: { flexDirection: "row", height: 180, marginTop: 8 },
    chartYAxis: { width: 36, justifyContent: "space-between", paddingBottom: 24 },
    chartYLabel: { fontFamily: FIRASANS, fontSize: 9, color: TEXT_LIGHT, textAlign: "right" },
    chartBody: { flex: 1, position: "relative" },
    chartGrid: { ...StyleSheet.absoluteFillObject, justifyContent: "space-between", paddingBottom: 24 },
    chartGridLine: { borderTopWidth: 1, borderStyle: "dashed", borderColor: BORDER_COLOR },
    chartBars: { flex: 1, flexDirection: "row", alignItems: "flex-end", gap: 8, paddingBottom: 24 },
    chartBarCol: { flex: 1, alignItems: "center" },
    chartBarTrack: { width: "70%", height: 140, justifyContent: "flex-end" },
    chartBar: { width: "100%", borderRadius: 4, minHeight: 0 },
    chartXLabel: { fontFamily: FIRASANS, fontSize: 9, color: TEXT_MUTED, marginTop: 6, textAlign: "center" },
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
    statusBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#ECFDF5", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, gap: 4 },
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN },
    statusText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 11, color: GREEN },
    statusDraft: { backgroundColor: "#ECFDF5" },
    statusDraftText: { color: GREEN },
    statusPartial: { backgroundColor: "#CCFBF1" },
    statusPartialText: { color: TEAL },
    statusOverdue: { backgroundColor: "#FEE2E2" },
    statusOverdueText: { color: RED },
    metaRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
    metaCol: { flex: 1 },
    fieldLabel: { fontFamily: FIRASANSSEMIBOLD, fontSize: 9, color: TEXT_MUTED, letterSpacing: 0.4, marginBottom: 4 },
    metaValue: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_DARK },
    amountValue: { fontFamily: UBUNTUBOLD, fontSize: 15, color: TEXT_DARK },
    amountGreen: { fontFamily: UBUNTUBOLD, fontSize: 15, color: GREEN },
    highlightValue: { color: AMBER, fontFamily: FIRASANSSEMIBOLD },
    highlightAmount: { color: AMBER },
    negativeBalance: { color: RED },
    bucketText: { fontFamily: FIRASANS, fontSize: 12, color: TEXT_MUTED, marginTop: 4 },
    submitDocsButton: {
        backgroundColor: "#FEF3C7",
        borderRadius: 8,
        paddingVertical: 9,
        alignItems: "center",
        marginTop: 4,
        borderWidth: 1,
        borderColor: "#FDE68A",
    },
    submitDocsText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 13, color: AMBER },
    emptyBox: { paddingVertical: 36, alignItems: "center" },
    emptyText: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_LIGHT },
    footerText: { fontFamily: FIRASANS, fontSize: 11, color: TEXT_LIGHT, textAlign: "center", marginTop: 8, lineHeight: 16, paddingBottom: 24 },
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
