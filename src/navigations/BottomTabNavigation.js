import React, { useCallback, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    Dimensions,
} from "react-native";
import { useDispatch } from "react-redux";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LOGOUT, LOGO } from "../constant/imagePath";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../constant/fontPath";
import { WHITE } from "../constant/color";
import { AppNavigationProvider } from "./AdminNavigationContext";
import { logoutUser } from "../redux/actions/auth";

import AdminDashboardScreen from "../screens/userScreens/adminScreen/AdminDashboardScreen";
import AdminAttendanceScreen from "../screens/userScreens/adminScreen/AdminAttendanceScreen";
import AdminProfileScreen from "../screens/userScreens/adminScreen/AdminProfileScreen";
import AdminNotificationScreen from "../screens/userScreens/adminScreen/AdminNotificationScreen";

import FinanceDashboardScreen from "../screens/userScreens/finaceHeaderScreen/FinanceDashboardScreen";
import FinanceTeamActivityLogScreen from "../screens/userScreens/finaceHeaderScreen/FinanceTeamActivityLogScreen";
import FinanceAttendanceScreen from "../screens/userScreens/finaceHeaderScreen/FinanceAttendanceScreen";
import FinanceProfileScreen from "../screens/userScreens/finaceHeaderScreen/FinanceProfileScreen";
import FinanceNotificationScreen from "../screens/userScreens/finaceHeaderScreen/FinanceNotificationScreen";
import RawMaterialScreen from "../screens/userScreens/finaceHeaderScreen/RawMaterialScreen";
import OrderManagementScreen from "../screens/userScreens/finaceHeaderScreen/OrderManagementScreen";
import PrimarySalesScreen from "../screens/userScreens/finaceHeaderScreen/PrimarySalesScreen";
import DistributorScreen from "../screens/userScreens/finaceHeaderScreen/DistributorScreen";
import SuperStockListScreen from "../screens/userScreens/finaceHeaderScreen/SuperStockListScreen";
import ClaimScreen from "../screens/userScreens/finaceHeaderScreen/ClaimScreen";
import CollectionScreen from "../screens/userScreens/finaceHeaderScreen/CollectionScreen";
import FinanceAccountsScreen from "../screens/userScreens/finaceHeaderScreen/FinanceAccountsScreen";
import AIAnalyticsScreen from "../screens/userScreens/finaceHeaderScreen/AIAnalyticsScreen";

const ACTIVE_TAB_BG = "#E8F8EF";
const ACTIVE_TAB_COLOR = "#05A845";
const INACTIVE_COLOR = "#9CA3AF";
const DRAWER_WIDTH = Math.min(Dimensions.get("window").width * 0.82, 320);

const ADMIN_TABS = [
    { key: "Dashboard", label: "Dashboard", icon: DashboardIcon },
    { key: "Attendance", label: "Attendance", icon: AttendanceIcon },
    { key: "Profile", label: "Profile", icon: ProfileIcon },
];

const FINANCE_TABS = [
    { key: "Dashboard", label: "Dashboard", icon: DashboardIcon },
    { key: "TeamActivityLog", label: "Team Activity Log", icon: ActivityIcon },
    { key: "Attendance", label: "Attendance", icon: AttendanceIcon },
    { key: "Profile", label: "Profile", icon: ProfileIcon },
];

const ADMIN_SCREEN_MAP = {
    Dashboard: AdminDashboardScreen,
    Attendance: AdminAttendanceScreen,
    Profile: AdminProfileScreen,
};

const FINANCE_SCREEN_MAP = {
    Dashboard: FinanceDashboardScreen,
    TeamActivityLog: FinanceTeamActivityLogScreen,
    Attendance: FinanceAttendanceScreen,
    Profile: FinanceProfileScreen,
};

const FINANCE_STACK_SCREEN_MAP = {
    Notification: FinanceNotificationScreen,
    RawMaterial: RawMaterialScreen,
    OrderManagement: OrderManagementScreen,
    PrimarySales: PrimarySalesScreen,
    Distributor: DistributorScreen,
    SuperStockList: SuperStockListScreen,
    Claim: ClaimScreen,
    Collection: CollectionScreen,
    FinanceAccounts: FinanceAccountsScreen,
    AIAnalytics: AIAnalyticsScreen,
};

const FINANCE_DRAWER_ITEMS = [
    { key: "RawMaterial", label: "Raw Materials", icon: "🌿" },
    { key: "OrderManagement", label: "Order Management", icon: "📦" },
    { key: "PrimarySales", label: "Primary Sales", icon: "📈" },
    { key: "Distributor", label: "Distributor", icon: "🚚" },
    { key: "SuperStockList", label: "Super Stocklists", icon: "📋" },
    { key: "Claim", label: "Claim", icon: "📝" },
    { key: "Collection", label: "Collections", icon: "💰" },
    { key: "FinanceAccounts", label: "Finance & Accounts", icon: "🏦" },
    { key: "AIAnalytics", label: "AI Analytics", icon: "🤖" },
];

function DashboardIcon({ color }) {
    return (
        <View style={iconStyles.grid}>
            {[0, 1, 2, 3].map((item) => (
                <View key={item} style={[iconStyles.gridItem, { backgroundColor: color }]} />
            ))}
        </View>
    );
}

function ActivityIcon({ color }) {
    return (
        <View style={iconStyles.activityWrap}>
            <View style={[iconStyles.activityLine, { backgroundColor: color }]} />
            <View style={[iconStyles.activityLine, iconStyles.activityLineShort, { backgroundColor: color }]} />
            <View style={[iconStyles.activityLine, { backgroundColor: color }]} />
        </View>
    );
}

function AttendanceIcon({ color }) {
    return (
        <View style={iconStyles.pinWrap}>
            <View style={[iconStyles.pinCircle, { backgroundColor: color }]} />
            <View style={[iconStyles.pinPoint, { borderTopColor: color }]} />
        </View>
    );
}

function ProfileIcon({ color }) {
    return (
        <View style={iconStyles.profileWrap}>
            <View style={[iconStyles.profileHead, { backgroundColor: color }]} />
            <View style={[iconStyles.profileBody, { backgroundColor: color }]} />
        </View>
    );
}

const FinanceDrawerContent = ({ onNavigate, onLogout, onClose }) => {
    const handleLogoutPress = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: () => {
                    onClose?.();
                    onLogout?.();
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={drawerStyles.safeArea} edges={["top", "bottom"]}>
            <View style={drawerStyles.container}>
                <View style={drawerStyles.profileSection}>
                    <Image source={LOGO} style={drawerStyles.logo} resizeMode="contain" />
                    <Text style={drawerStyles.userName}>Priya Sharma</Text>
                    <Text style={drawerStyles.userRole}>Finance Department</Text>
                </View>

                <ScrollView
                    style={drawerStyles.menuScroll}
                    contentContainerStyle={drawerStyles.menuContent}
                    showsVerticalScrollIndicator={false}
                >
                    {FINANCE_DRAWER_ITEMS.map((item) => (
                        <TouchableOpacity
                            key={item.key}
                            style={drawerStyles.menuItem}
                            activeOpacity={0.85}
                            onPress={() => onNavigate?.(item.key)}
                        >
                            <View style={drawerStyles.menuIconWrap}>
                                <Text style={drawerStyles.menuIcon}>{item.icon}</Text>
                            </View>
                            <Text style={drawerStyles.menuLabel}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <TouchableOpacity
                    style={drawerStyles.logoutButton}
                    activeOpacity={0.85}
                    onPress={handleLogoutPress}
                >
                    <View style={drawerStyles.menuIconWrap}>
                        <Image source={LOGOUT} style={drawerStyles.logoutIcon} resizeMode="contain" />
                    </View>
                    <Text style={drawerStyles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const TabBar = ({ tabs, activeTab, onTabPress, compactLabel }) => (
    <SafeAreaView edges={["bottom"]} style={styles.tabBarSafeArea}>
        <View style={styles.tabBar}>
            {tabs.map((tab) => {
                const focused = activeTab === tab.key;
                const color = focused ? ACTIVE_TAB_COLOR : INACTIVE_COLOR;
                const Icon = tab.icon;

                return (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tabItem, focused && styles.tabItemActive]}
                        onPress={() => onTabPress(tab.key)}
                        activeOpacity={0.85}
                    >
                        <Icon color={color} />
                        <Text
                            style={[
                                compactLabel ? styles.tabLabelCompact : styles.tabLabel,
                                focused && styles.tabLabelActive,
                            ]}
                            numberOfLines={2}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    </SafeAreaView>
);

const BottomTabNavigation = ({ role = "finance" }) => {
    const dispatch = useDispatch();
    const isFinance = role === "finance";
    const tabs = isFinance ? FINANCE_TABS : ADMIN_TABS;
    const screenMap = isFinance ? FINANCE_SCREEN_MAP : ADMIN_SCREEN_MAP;

    const [activeTab, setActiveTab] = useState("Dashboard");
    const [stackRoute, setStackRoute] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const ActiveScreen = screenMap[activeTab];

    const closeDrawer = useCallback(() => setDrawerOpen(false), []);
    const openDrawer = useCallback(() => setDrawerOpen(true), []);

    const handleLogout = useCallback(() => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: () => dispatch(logoutUser()),
            },
        ]);
    }, [dispatch]);

    const navigation = useMemo(
        () => ({
            openDrawer,
            closeDrawer,
            navigate: (name) => {
                closeDrawer();
                if (isFinance) {
                    setStackRoute(name);
                    return;
                }
                if (name === "Notification") {
                    setStackRoute("Notification");
                }
            },
            goBack: () => setStackRoute(null),
            onLogout: handleLogout,
        }),
        [isFinance, openDrawer, closeDrawer, handleLogout]
    );

    const FinanceStackScreen = stackRoute ? FINANCE_STACK_SCREEN_MAP[stackRoute] : null;
    const showAdminNotification = !isFinance && stackRoute === "Notification";

    const renderTabContent = () => (
        <>
            <View style={styles.screenContainer}>
                <ActiveScreen />
            </View>
            <TabBar
                tabs={tabs}
                activeTab={activeTab}
                onTabPress={setActiveTab}
                compactLabel={isFinance}
            />
        </>
    );

    if (isFinance) {
        return (
            <AppNavigationProvider value={navigation}>
                <SafeAreaProvider>
                    <View style={styles.root}>
                        {FinanceStackScreen ? <FinanceStackScreen /> : renderTabContent()}

                        {drawerOpen ? (
                            <View style={styles.drawerOverlay}>
                                <View style={styles.drawerPanel}>
                                    <FinanceDrawerContent
                                        onNavigate={navigation.navigate}
                                        onLogout={handleLogout}
                                        onClose={closeDrawer}
                                    />
                                </View>
                                <TouchableOpacity
                                    style={styles.backdrop}
                                    activeOpacity={1}
                                    onPress={closeDrawer}
                                />
                            </View>
                        ) : null}
                    </View>
                </SafeAreaProvider>
            </AppNavigationProvider>
        );
    }

    return (
        <AppNavigationProvider value={navigation}>
            <SafeAreaProvider>
                <View style={styles.root}>
                    {showAdminNotification ? <AdminNotificationScreen /> : renderTabContent()}
                </View>
            </SafeAreaProvider>
        </AppNavigationProvider>
    );
};

export default BottomTabNavigation;

const iconStyles = StyleSheet.create({
    grid: {
        width: 22,
        height: 22,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 3,
    },
    gridItem: {
        width: 9,
        height: 9,
        borderRadius: 2,
    },
    activityWrap: {
        width: 18,
        height: 18,
        justifyContent: "space-between",
    },
    activityLine: {
        height: 2,
        borderRadius: 1,
        width: "100%",
    },
    activityLineShort: {
        width: "70%",
    },
    pinWrap: {
        width: 18,
        height: 22,
        alignItems: "center",
        justifyContent: "flex-start",
    },
    pinCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    pinPoint: {
        width: 0,
        height: 0,
        marginTop: 1,
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderTopWidth: 8,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
    },
    profileWrap: {
        width: 20,
        height: 22,
        alignItems: "center",
        justifyContent: "flex-end",
    },
    profileHead: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginBottom: 2,
    },
    profileBody: {
        width: 16,
        height: 8,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
});

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#F3F4F6",
    },
    screenContainer: {
        flex: 1,
    },
    tabBarSafeArea: {
        backgroundColor: WHITE,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    tabBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 4,
        paddingTop: 8,
        paddingBottom: 6,
        backgroundColor: WHITE,
    },
    tabItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 6,
        borderRadius: 12,
        gap: 3,
        minHeight: 52,
    },
    tabItemActive: {
        backgroundColor: ACTIVE_TAB_BG,
    },
    tabLabel: {
        fontSize: 10,
        fontFamily: FIRASANS,
        color: INACTIVE_COLOR,
        textAlign: "center",
    },
    tabLabelCompact: {
        fontSize: 9,
        fontFamily: FIRASANS,
        color: INACTIVE_COLOR,
        textAlign: "center",
    },
    tabLabelActive: {
        color: ACTIVE_TAB_COLOR,
        fontFamily: FIRASANSSEMIBOLD,
    },
    drawerOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: "row",
        zIndex: 999,
        elevation: 24,
    },
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
    },
    drawerPanel: {
        width: DRAWER_WIDTH,
        backgroundColor: WHITE,
        shadowColor: "#000",
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
});

const drawerStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: WHITE,
    },
    container: {
        flex: 1,
        backgroundColor: WHITE,
    },
    profileSection: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        alignItems: "flex-start",
    },
    logo: {
        width: 120,
        height: 36,
        marginBottom: 16,
    },
    userName: {
        fontFamily: UBUNTUBOLD,
        fontSize: 18,
        color: "#111827",
        marginBottom: 4,
    },
    userRole: {
        fontFamily: FIRASANS,
        fontSize: 13,
        color: "#6B7280",
    },
    menuScroll: {
        flex: 1,
    },
    menuContent: {
        paddingVertical: 8,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    menuIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
    },
    menuIcon: {
        fontSize: 18,
    },
    menuLabel: {
        flex: 1,
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 15,
        color: "#111827",
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 18,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        gap: 12,
    },
    logoutIcon: {
        width: 20,
        height: 20,
        tintColor: "#DC2626",
    },
    logoutText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 16,
        color: "#DC2626",
    },
});
