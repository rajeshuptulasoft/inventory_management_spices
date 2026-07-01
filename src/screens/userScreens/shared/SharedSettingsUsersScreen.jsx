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
    PUTNETWORK,
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
const PURPLE = "#7C3AED";

const TABS = [
    { id: "users", label: "User Management" },
    { id: "audit", label: "Role Audit" },
];

const USER_ROLES = [
    { label: "Finance Head (finance_head)", value: "finance_head" },
    { label: "Marketing Head (marketing_head)", value: "marketing_head" },
    { label: "Shift Supervisor (shift_supervisor)", value: "shift_supervisor" },
    { label: "Production Manager (production_manager)", value: "production_manager" },
    { label: "Machine Operator (machine_operator)", value: "machine_operator" },
];

const SUMMARY_KPIS = [
    { id: "total", label: "TOTAL USERS", value: "0", footer: "→ Managed accounts", icon: "👥", iconBg: "#DBEAFE" },
    { id: "pending", label: "PENDING APPROVAL", value: "0", footer: "→ Awaiting your approval", icon: "⏳", iconBg: "#FEF3C7" },
    { id: "subadmin", label: "SUB ADMINS", value: "0", footer: "→ Delegated module access", icon: "🛡️", iconBg: "#EDE9FE" },
];

const mapUserToUi = (row) => {
    const initials = String(row.name || "")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    return {
        id: String(row.id),
        name: row.name || "",
        email: row.email || "",
        userId: String(row.id),
        department: row.department || row.phone || "General",
        activeRole: row.role?.role_name || row.role_name || "—",
        roleSlug: row.role?.role_name || "",
        roleId: String(row.role_id ?? row.role?.id ?? ""),
        requestedRole: "—",
        status: capitalizeStatus(row.status),
        access: "Standard",
        lastLogin: row.last_login || "Joined —",
        initials: initials || "??",
        protected: false,
    };
};

const mapUserToAudit = (row) => ({
    id: String(row.id),
    user: row.name || "",
    role: row.role?.role_name || row.role_name || "—",
    menus: "—",
    permissions: "0",
    status: capitalizeStatus(row.status),
});

const HOW_IT_WORKS = [
    "Create a user with email, password, department, and role. New users start in Pending until you approve.",
    "Users cannot log in until their role is approved by an administrator.",
    "Sub-Admin access grants additional drawer modules beyond the user's base role.",
    "Example logins: finance@test.com, marketing@test.com, shift@test.com, machine@test.com (password: Admin@123).",
];

const ROLE_FOOTER = {
    finance: "Priya Sharma (Finance Department)",
    marketing: "Anita Verma (Marketing Department)",
    shift: "Shift Supervisor (Shift Supervisor)",
};

const FormField = ({ label, children }) => (
    <View style={styles.formField}>
        <Text style={styles.formLabel}>{label}</Text>
        {children}
    </View>
);

const CreateUserModal = ({ visible, onClose, onSave, roles = USER_ROLES }) => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [department, setDepartment] = useState("");
    const [roleIndex, setRoleIndex] = useState(0);
    const [approveImmediately, setApproveImmediately] = useState(false);

    const resetForm = () => {
        setFullName("");
        setEmail("");
        setPassword("");
        setDepartment("");
        setRoleIndex(0);
        setApproveImmediately(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSave = () => {
        if (!fullName.trim() || !email.trim() || !password.trim()) {
            Alert.alert("Required Fields", "Please enter full name, email, and password.");
            return;
        }
        const role = roles[roleIndex] || roles[0];
        onSave({
            name: fullName.trim(),
            email: email.trim(),
            password: password.trim(),
            phone: department.trim() || "",
            role_id: role?.id ?? role?.value,
            department: department.trim() || "General",
            activeRole: role?.role_name || role?.label?.split(" (")[0] || "",
            roleSlug: role?.role_name || role?.value || "",
            approveImmediately,
        });
        resetForm();
    };

    const cycleRole = () => {
        setRoleIndex((prev) => (prev + 1) % Math.max(roles.length, 1));
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <View style={styles.modalOverlay}>
                <Pressable style={styles.modalBackdrop} onPress={handleClose} />
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalKeyboard}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create User</Text>
                            <TouchableOpacity onPress={handleClose} style={styles.closeButton} activeOpacity={0.85}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <FormField label="Full name">
                                <TextInput
                                    style={styles.formInput}
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholder="Full name"
                                    placeholderTextColor={TEXT_LIGHT}
                                />
                            </FormField>
                            <FormField label="Email">
                                <TextInput
                                    style={styles.formInput}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Email"
                                    placeholderTextColor={TEXT_LIGHT}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </FormField>
                            <FormField label="Password">
                                <TextInput
                                    style={styles.formInput}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Password"
                                    placeholderTextColor={TEXT_LIGHT}
                                    secureTextEntry
                                />
                            </FormField>
                            <FormField label="Department">
                                <TextInput
                                    style={styles.formInput}
                                    value={department}
                                    onChangeText={setDepartment}
                                    placeholder="Department"
                                    placeholderTextColor={TEXT_LIGHT}
                                />
                            </FormField>
                            <FormField label="Role">
                                <TouchableOpacity style={styles.pickerField} onPress={cycleRole} activeOpacity={0.85}>
                                    <Text style={styles.pickerText}>
                                        {roles[roleIndex]?.role_name ||
                                            roles[roleIndex]?.label ||
                                            "Select role"}
                                    </Text>
                                    <Text style={styles.pickerChevron}>▾</Text>
                                </TouchableOpacity>
                            </FormField>
                            <TouchableOpacity
                                style={styles.checkboxRow}
                                onPress={() => setApproveImmediately((v) => !v)}
                                activeOpacity={0.85}
                            >
                                <View style={[styles.checkbox, approveImmediately && styles.checkboxChecked]}>
                                    {approveImmediately ? <Text style={styles.checkmark}>✓</Text> : null}
                                </View>
                                <Text style={styles.checkboxLabel}>Approve immediately (skip pending state)</Text>
                            </TouchableOpacity>
                        </ScrollView>
                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={handleClose} activeOpacity={0.85} style={styles.cancelButton}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} activeOpacity={0.9} style={styles.saveButton}>
                                <Text style={styles.saveButtonText}>Create User</Text>
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
        <Text style={[styles.kpiValue, item.smallValue && styles.kpiValueSmall]} numberOfLines={1}>
            {item.value}
        </Text>
        <Text style={styles.kpiFooter}>{item.footer}</Text>
    </View>
);

const UserCard = ({ item, onDeactivate, onDelete }) => (
    <View style={styles.dataCard}>
        <View style={styles.userTopRow}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.initials}</Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <Text style={styles.userIdText}>ID #{item.userId}</Text>
            </View>
            <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{item.status}</Text>
            </View>
        </View>
        <View style={styles.metaRow}>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>DEPARTMENT</Text>
                <Text style={styles.metaValue}>{item.department}</Text>
            </View>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>ACCESS</Text>
                <View style={[styles.accessBadge, item.access === "Sub-Admin" && styles.accessSubAdmin]}>
                    <Text style={[styles.accessText, item.access === "Sub-Admin" && styles.accessSubAdminText]}>
                        {item.access}
                    </Text>
                </View>
            </View>
        </View>
        <View style={styles.metaRow}>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>ACTIVE ROLE</Text>
                <Text style={styles.roleLink}>{item.activeRole}</Text>
                <Text style={styles.roleSlug}>{item.roleSlug}</Text>
            </View>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>LAST LOGIN</Text>
                <Text style={styles.metaValue}>{item.lastLogin}</Text>
            </View>
        </View>
        {item.protected ? (
            <Text style={styles.protectedText}>Protected account</Text>
        ) : (
            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.deactivateButton} activeOpacity={0.85} onPress={() => onDeactivate(item)}>
                    <Text style={styles.deactivateText}>Deactivate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} activeOpacity={0.85} onPress={() => onDelete(item)}>
                    <Text style={styles.deleteButtonText}>Delete Permanently</Text>
                </TouchableOpacity>
            </View>
        )}
    </View>
);

const AuditCard = ({ item }) => (
    <View style={styles.dataCard}>
        <View style={styles.dataCardTop}>
            <Text style={styles.userName}>{item.user}</Text>
            <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{item.status}</Text>
            </View>
        </View>
        <View style={styles.metaRow}>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>ROLE</Text>
                <Text style={styles.roleLink}>{item.role}</Text>
            </View>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>MENUS</Text>
                <Text style={styles.metaValue}>{item.menus}</Text>
            </View>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>PERMISSIONS</Text>
                <Text style={styles.metaValue}>{item.permissions}</Text>
            </View>
        </View>
    </View>
);

const SharedSettingsUsersScreen = () => {
    const navigation = useFinanceNavigation();
    const { width } = useWindowDimensions();
    const kpiWidth = (width - 48) / 2;

    const [activeTab, setActiveTab] = useState("users");
    const [users, setUsers] = useState([]);
    const [auditRows, setAuditRows] = useState([]);
    const [apiRoles, setApiRoles] = useState(USER_ROLES);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [footerRole, setFooterRole] = useState(ROLE_FOOTER.shift);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [usersRes, rolesRes, settingsRes] = await Promise.all([
                GETNETWORK(buildUrl("users", "limit=200"), true),
                GETNETWORK(buildUrl("users/roles/list"), true),
                GETNETWORK(buildUrl("settings"), true),
            ]);
            logScreenApi("SharedSettingsUsersScreen", "users", usersRes, buildUrl("users", "limit=200"));
            logScreenApi("SharedSettingsUsersScreen", "users/roles/list", rolesRes, buildUrl("users/roles/list"));
            logScreenApi("SharedSettingsUsersScreen", "settings", settingsRes, buildUrl("settings"));
            if (isApiSuccess(rolesRes)) {
                const roles = extractApiList(rolesRes);
                if (roles.length) setApiRoles(roles);
            }
            if (!isApiSuccess(usersRes)) {
                Alert.alert("Error", getApiMessage(usersRes, "Failed to load users"));
                setUsers([]);
                setAuditRows([]);
                return;
            }
            const mapped = extractApiList(usersRes).map(mapUserToUi);
            setUsers(mapped);
            setAuditRows(extractApiList(usersRes).map(mapUserToAudit));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const summaryKpis = useMemo(
        () => [
            { ...SUMMARY_KPIS[0], value: String(users.length) },
            {
                ...SUMMARY_KPIS[1],
                value: String(users.filter((u) => u.status === "Pending").length),
            },
            {
                ...SUMMARY_KPIS[2],
                value: String(users.filter((u) => u.access === "Sub-Admin").length),
            },
        ],
        [users]
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
        if (showModal) {
            setShowModal(false);
            return;
        }
        navigation.goBack();
    }, [navigation, showModal]);

    useEffect(() => {
        if (Platform.OS !== "android") return undefined;
        const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
            if (showModal) {
                setShowModal(false);
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

    const filteredUsers = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return users;
        return users.filter(
            (item) =>
                item.name.toLowerCase().includes(q) ||
                item.email.toLowerCase().includes(q) ||
                item.department.toLowerCase().includes(q) ||
                item.activeRole.toLowerCase().includes(q)
        );
    }, [users, search]);

    const filteredAudit = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return auditRows;
        return auditRows.filter(
            (item) => item.user.toLowerCase().includes(q) || item.role.toLowerCase().includes(q)
        );
    }, [auditRows, search]);

    const handleCreateUser = async (form) => {
        const res = await POSTNETWORK(
            buildUrl("auth/register"),
            {
                name: form.name,
                email: form.email,
                password: form.password,
                phone: form.phone || form.department || "",
                role_id: Number(form.role_id),
            },
            true
        );
        logScreenApi("SharedSettingsUsersScreen", "auth/register", res, buildUrl("auth/register"));
        if (!isApiSuccess(res)) {
            Alert.alert("Error", getApiMessage(res, "Create user failed"));
            return;
        }
        if (form.approveImmediately) {
            const userId = res?.data?.id || res?.id;
            if (userId) {
                const _logRes19883 = await PUTNETWORK(
                    buildUrl(`users/${userId}`),
                    { status: "active", role_id: Number(form.role_id) },
                    true
                );
                logScreenApi("SharedSettingsUsersScreen", "users/${userId}", _logRes19883, buildUrl(`users/${userId}`));
            }
        }
        setShowModal(false);
        loadData();
    };

    const handleDeactivate = (item) => {
        Alert.alert("Deactivate User", `Deactivate "${item.name}"?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Deactivate",
                onPress: async () => {
                    const res = await DELETENETWORK(buildUrl(`users/${item.id}`), true);
                    logScreenApi("SharedSettingsUsersScreen", "users/${item.id}", res, buildUrl(`users/${item.id}`));
                    if (!isApiSuccess(res)) {
                        Alert.alert("Error", getApiMessage(res, "Deactivate failed"));
                        return;
                    }
                    loadData();
                },
            },
        ]);
    };

    const handleDelete = (item) => {
        Alert.alert("Delete User", `Permanently delete "${item.name}"?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    const res = await DELETENETWORK(buildUrl(`users/${item.id}`), true);
                    logScreenApi("SharedSettingsUsersScreen", "users/${item.id}", res, buildUrl(`users/${item.id}`));
                    if (!isApiSuccess(res)) {
                        Alert.alert("Error", getApiMessage(res, "Delete failed"));
                        return;
                    }
                    loadData();
                },
            },
        ]);
    };

    const listData = activeTab === "users" ? filteredUsers : filteredAudit;

    const listHeader = (
        <View>
            <View style={styles.subAdminBanner}>
                <Text style={styles.subAdminBannerText}>Sub Admin Access</Text>
            </View>

            <View style={styles.pageHeader}>
                <Text style={styles.pageTitle}>Settings & User Management</Text>
                <Text style={styles.pageSubtitle}>Create users, approve roles, delegate Sub-Admin access</Text>
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
                {activeTab === "users" ? (
                    <TouchableOpacity style={styles.createUserButton} activeOpacity={0.9} onPress={() => setShowModal(true)}>
                        <Text style={styles.createUserButtonText}>+ Create User</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            {activeTab === "users" ? (
                <View style={styles.kpiGrid}>
                    {summaryKpis.map((item) => (
                        <KpiCard key={item.id} item={item} width={kpiWidth} />
                    ))}
                </View>
            ) : null}

            <View style={styles.listSection}>
                <Text style={styles.sectionTitle}>
                    {activeTab === "users" ? `User Accounts (${users.length})` : "Role & Permission Audit"}
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
        <View>
            {activeTab === "users" ? (
                <View style={styles.howItWorksCard}>
                    <Text style={styles.howItWorksTitle}>How it works</Text>
                    {HOW_IT_WORKS.map((line) => (
                        <Text key={line} style={styles.howItWorksItem}>
                            • {line}
                        </Text>
                    ))}
                </View>
            ) : null}
            <Text style={styles.footerText}>SpiceCraft ERP v3.0 • Logged in as {footerRole} • 23</Text>
        </View>
    );

    return (
        <View style={styles.root}>
            <MyHeader
                showBack
                showCenterTitle
                title="Settings & Users"
                backgroundColor={WHITE}
                onBackPress={handleBack}
            />

            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={listData}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) =>
                        activeTab === "users" ? (
                            <UserCard item={item} onDeactivate={handleDeactivate} onDelete={handleDelete} />
                        ) : (
                            <AuditCard item={item} />
                        )
                    }
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
                            <Text style={styles.emptyText}>No records found</Text>
                        </View>
                    }
                />

                {activeTab === "users" ? (
                    <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={() => setShowModal(true)}>
                        <Text style={styles.fabIcon}>+</Text>
                    </TouchableOpacity>
                ) : null}

                <CreateUserModal
                    visible={showModal}
                    onClose={() => setShowModal(false)}
                    onSave={handleCreateUser}
                    roles={apiRoles}
                />
            </SafeAreaView>
        </View>
    );
};

export default SharedSettingsUsersScreen;

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
    tabPill: {
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 20,
        backgroundColor: CARD_BG,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    tabPillActive: { backgroundColor: PRIMARY_BLUE, borderColor: PRIMARY_BLUE },
    tabPillText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 12, color: TEXT_MUTED },
    tabPillTextActive: { color: WHITE },
    createUserButton: {
        backgroundColor: GREEN,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 9,
    },
    createUserButtonText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 11, color: WHITE },
    kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 14 },
    kpiCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    kpiTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
    kpiLabel: { fontFamily: FIRASANSSEMIBOLD, fontSize: 9, color: TEXT_MUTED, letterSpacing: 0.3, flex: 1, paddingRight: 8 },
    kpiIconWrap: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
    kpiIcon: { fontSize: 16 },
    kpiValue: { fontFamily: UBUNTUBOLD, fontSize: 24, color: TEXT_DARK, marginBottom: 4 },
    kpiValueSmall: { fontSize: 14 },
    kpiFooter: { fontFamily: FIRASANS, fontSize: 11, color: TEXT_MUTED },
    listSection: { marginBottom: 10 },
    sectionTitle: { fontFamily: UBUNTUBOLD, fontSize: 16, color: TEXT_DARK, marginBottom: 10 },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: CARD_BG,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        paddingHorizontal: 12,
    },
    searchIcon: { fontSize: 14, marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 11, fontFamily: FIRASANS, fontSize: 14, color: TEXT_DARK },
    dataCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    dataCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
    userTopRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12, gap: 10 },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#DBEAFE",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 14, color: PRIMARY_BLUE },
    userInfo: { flex: 1 },
    userName: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: TEXT_DARK, marginBottom: 2 },
    userEmail: { fontFamily: FIRASANS, fontSize: 12, color: TEXT_MUTED, marginBottom: 2 },
    userIdText: { fontFamily: FIRASANS, fontSize: 11, color: TEXT_LIGHT },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ECFDF5",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN },
    statusText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 11, color: GREEN },
    metaRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
    metaCol: { flex: 1 },
    fieldLabel: { fontFamily: FIRASANSSEMIBOLD, fontSize: 9, color: TEXT_MUTED, letterSpacing: 0.4, marginBottom: 4 },
    metaValue: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_DARK },
    roleLink: { fontFamily: FIRASANSSEMIBOLD, fontSize: 13, color: PRIMARY_BLUE },
    roleSlug: { fontFamily: FIRASANS, fontSize: 11, color: TEXT_LIGHT, marginTop: 2 },
    accessBadge: {
        alignSelf: "flex-start",
        backgroundColor: "#F3F4F6",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    accessSubAdmin: { backgroundColor: "#EDE9FE" },
    accessText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 11, color: TEXT_MUTED },
    accessSubAdminText: { color: PURPLE },
    protectedText: { fontFamily: FIRASANS, fontSize: 12, color: TEXT_MUTED, fontStyle: "italic", marginTop: 4 },
    actionRow: { flexDirection: "row", gap: 10, marginTop: 4 },
    deactivateButton: {
        flex: 1,
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        backgroundColor: CARD_BG,
    },
    deactivateText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 12, color: TEXT_DARK },
    deleteButton: {
        flex: 1,
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#FECACA",
        backgroundColor: "#FEF2F2",
    },
    deleteButtonText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 12, color: RED },
    howItWorksCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        padding: 14,
        marginTop: 8,
        marginBottom: 8,
    },
    howItWorksTitle: { fontFamily: UBUNTUBOLD, fontSize: 15, color: TEXT_DARK, marginBottom: 10 },
    howItWorksItem: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_MUTED, lineHeight: 20, marginBottom: 6 },
    emptyWrap: { paddingVertical: 32, alignItems: "center" },
    emptyText: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_LIGHT },
    footerText: {
        fontFamily: FIRASANS,
        fontSize: 11,
        color: TEXT_LIGHT,
        textAlign: "center",
        marginTop: 8,
        lineHeight: 16,
        paddingBottom: 24,
    },
    fab: {
        position: "absolute",
        right: 20,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: GREEN,
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
    pickerText: { fontFamily: FIRASANS, fontSize: 14, color: TEXT_DARK, flex: 1, paddingRight: 8 },
    pickerChevron: { fontSize: 12, color: TEXT_MUTED },
    checkboxRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        backgroundColor: CARD_BG,
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxChecked: { backgroundColor: PRIMARY_BLUE, borderColor: PRIMARY_BLUE },
    checkmark: { color: WHITE, fontSize: 12, fontFamily: FIRASANSSEMIBOLD },
    checkboxLabel: { fontFamily: FIRASANS, fontSize: 13, color: TEXT_DARK, flex: 1 },
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
