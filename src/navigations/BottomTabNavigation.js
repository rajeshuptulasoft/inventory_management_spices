import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Dimensions,
} from "react-native";
import { useDispatch } from "react-redux";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { FIRASANS, FIRASANSSEMIBOLD } from "../constant/fontPath";
import { WHITE } from "../constant/color";
import { AppNavigationProvider } from "./AdminNavigationContext";
import { logoutUser } from "../redux/actions/auth";
import { getDrawerConfig } from "./Drawer";
import CustomDrawerNavigation from "./CustomDrawerNavigation";
import { getObjByKey } from "../utils/Storage";
import { isSubAdminSession } from "./subAdminDrawer";

import FinanceDashboardScreen from "../screens/userScreens/finaceHeaderScreen/FinanceDashboardScreen";
import FinanceTeamActivityLogScreen from "../screens/userScreens/finaceHeaderScreen/FinanceTeamActivityLogScreen";
import FinanceAttendanceScreen from "../screens/userScreens/finaceHeaderScreen/FinanceAttendanceScreen";
import FinanceProfileScreen from "../screens/userScreens/finaceHeaderScreen/FinanceProfileScreen";

import MarketingDashboardScreen from "../screens/userScreens/marketingHeadScreen/MarketingDashboardScreen";
import MarketingAttendanceScreen from "../screens/userScreens/marketingHeadScreen/MarketingAttendanceScreen";
import MarketingBestPlansScreen from "../screens/userScreens/marketingHeadScreen/MarketingBestPlansScreen";
import MarketingProfileScreen from "../screens/userScreens/marketingHeadScreen/MarketingProfileScreen";

import MachineDashboardScreen from "../screens/userScreens/machineOperatorScreen/MachineDashboardScreen";
import MachineAttendanceScreen from "../screens/userScreens/machineOperatorScreen/MachineAttendanceScreen";
import MachineCategoriesScreen from "../screens/userScreens/machineOperatorScreen/MachineCategoriesScreen";
import MachineProfileScreen from "../screens/userScreens/machineOperatorScreen/MachineProfileScreen";

import ShiftDashboardScreen from "../screens/userScreens/shiftSupervisorScreen/ShiftDashboardScreen";
import ShiftAttendanceScreen from "../screens/userScreens/shiftSupervisorScreen/ShiftAttendanceScreen";
import ShiftCategoriesScreen from "../screens/userScreens/shiftSupervisorScreen/ShiftCategoriesScreen";
import ShiftProfileScreen from "../screens/userScreens/shiftSupervisorScreen/ShiftProfileScreen";

import ProductionDashboardScreen from "../screens/userScreens/productionManagerScreen/ProductionDashboardScreen";
import ProductionTeamActivityLogScreen from "../screens/userScreens/productionManagerScreen/ProductionTeamActivityLogScreen";
import ProductionAttendanceScreen from "../screens/userScreens/productionManagerScreen/ProductionAttendanceScreen";
import ProductionProfileScreen from "../screens/userScreens/productionManagerScreen/ProductionProfileScreen";

const ACTIVE_TAB_BG = "#E8F8EF";
const ACTIVE_TAB_COLOR = "#05A845";
const INACTIVE_COLOR = "#9CA3AF";
const DRAWER_WIDTH = Math.min(Dimensions.get("window").width * 0.82, 320);

const FINANCE_TABS = [
    { key: "Dashboard", label: "Dashboard", icon: DashboardIcon },
    { key: "TeamActivityLog", label: "Team Activity Log", icon: ActivityIcon },
    { key: "Attendance", label: "Attendance", icon: AttendanceIcon },
    { key: "Profile", label: "Profile", icon: ProfileIcon },
];

const MARKETING_TABS = [
    { key: "Dashboard", label: "Dashboard", icon: DashboardIcon },
    { key: "Attendance", label: "Attendance", icon: AttendanceIcon },
    { key: "BestPlans", label: "Best Plans", icon: PlansIcon },
    { key: "Profile", label: "Profile", icon: ProfileIcon },
];

const SHIFT_TABS = [
    { key: "Dashboard", label: "Dashboard", icon: DashboardIcon },
    { key: "Attendance", label: "Attendance", icon: AttendanceIcon },
    { key: "Categories", label: "Categories", icon: CategoriesIcon },
    { key: "Profile", label: "Profile", icon: ProfileIcon },
];

const MACHINE_TABS = [
    { key: "Dashboard", label: "Dashboard", icon: DashboardIcon },
    { key: "Attendance", label: "Attendance", icon: AttendanceIcon },
    { key: "Categories", label: "Categories", icon: CategoriesIcon },
    { key: "Profile", label: "Profile", icon: ProfileIcon },
];

const PRODUCTION_TABS = [
    { key: "Dashboard", label: "Dashboard", icon: DashboardIcon },
    { key: "TeamActivityLog", label: "Team Activity Log", icon: ActivityIcon },
    { key: "Attendance", label: "Attendance", icon: AttendanceIcon },
    { key: "Profile", label: "Profile", icon: ProfileIcon },
];

const FINANCE_SCREEN_MAP = {
    Dashboard: FinanceDashboardScreen,
    TeamActivityLog: FinanceTeamActivityLogScreen,
    Attendance: FinanceAttendanceScreen,
    Profile: FinanceProfileScreen,
};

const MARKETING_SCREEN_MAP = {
    Dashboard: MarketingDashboardScreen,
    Attendance: MarketingAttendanceScreen,
    BestPlans: MarketingBestPlansScreen,
    Profile: MarketingProfileScreen,
};

const SHIFT_SCREEN_MAP = {
    Dashboard: ShiftDashboardScreen,
    Attendance: ShiftAttendanceScreen,
    Categories: ShiftCategoriesScreen,
    Profile: ShiftProfileScreen,
};

const MACHINE_SCREEN_MAP = {
    Dashboard: MachineDashboardScreen,
    Attendance: MachineAttendanceScreen,
    Categories: MachineCategoriesScreen,
    Profile: MachineProfileScreen,
};

const PRODUCTION_SCREEN_MAP = {
    Dashboard: ProductionDashboardScreen,
    TeamActivityLog: ProductionTeamActivityLogScreen,
    Attendance: ProductionAttendanceScreen,
    Profile: ProductionProfileScreen,
};

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

function PlansIcon({ color }) {
    return (
        <View style={iconStyles.plansWrap}>
            <View style={[iconStyles.plansStar, { backgroundColor: color }]} />
            <View style={[iconStyles.plansLine, { backgroundColor: color }]} />
        </View>
    );
}

function CategoriesIcon({ color }) {
    return (
        <View style={iconStyles.categoriesWrap}>
            <View style={[iconStyles.categoriesTab, { backgroundColor: color }]} />
            <View style={[iconStyles.categoriesBody, { borderColor: color }]} />
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
    const isMarketing = role === "marketing";
    const isShift = role === "shift";
    const isMachine = role === "machine";
    const isProduction = role === "production";
    const hasDrawer = isFinance || isMarketing || isShift || isMachine || isProduction;

    const tabs = isMarketing
          ? MARKETING_TABS
          : isProduction
            ? PRODUCTION_TABS
          : isShift
            ? SHIFT_TABS
            : isMachine
              ? MACHINE_TABS
              : FINANCE_TABS;
    const screenMap = isMarketing
          ? MARKETING_SCREEN_MAP
          : isProduction
            ? PRODUCTION_SCREEN_MAP
          : isShift
            ? SHIFT_SCREEN_MAP
            : isMachine
              ? MACHINE_SCREEN_MAP
              : FINANCE_SCREEN_MAP;

    const [activeTab, setActiveTab] = useState("Dashboard");
    const [stackRoute, setStackRoute] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [loginSession, setLoginSession] = useState(null);

    const refreshLoginSession = useCallback(async () => {
        const loginResponse = await getObjByKey("loginResponse");
        setLoginSession(loginResponse || null);
        return loginResponse;
    }, []);

    useEffect(() => {
        refreshLoginSession();
    }, [refreshLoginSession]);

    const isSubAdmin = isSubAdminSession(loginSession);
    const drawerConfig = hasDrawer ? getDrawerConfig(role, isSubAdmin) : null;
    const stackScreenMap = drawerConfig?.stackMap || {};
    const drawerUserName = loginSession?.name || drawerConfig?.userName || "";
    const drawerUserRole = drawerConfig?.isSubAdmin
        ? `${drawerConfig.userRole} • Sub Admin`
        : drawerConfig?.userRole || "";

    const ActiveScreen = screenMap[activeTab];

    const closeDrawer = useCallback(() => setDrawerOpen(false), []);
    const openDrawer = useCallback(async () => {
        await refreshLoginSession();
        setDrawerOpen(true);
    }, [refreshLoginSession]);

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
                if (hasDrawer) {
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
        [hasDrawer, openDrawer, closeDrawer, handleLogout]
    );

    const StackScreen = stackRoute ? stackScreenMap[stackRoute] : null;

    const renderTabContent = () => (
        <>
            <View style={styles.screenContainer}>
                <ActiveScreen />
            </View>
            <TabBar
                tabs={tabs}
                activeTab={activeTab}
                onTabPress={setActiveTab}
                compactLabel={isFinance || isMarketing || isShift || isMachine || isProduction}
            />
        </>
    );

    return (
        <AppNavigationProvider value={navigation}>
            <SafeAreaProvider>
                <View style={styles.root}>
                    {StackScreen ? <StackScreen /> : renderTabContent()}

                    {drawerOpen ? (
                        <View style={styles.drawerOverlay}>
                            <View style={styles.drawerPanel}>
                                <CustomDrawerNavigation
                                    drawerItems={drawerConfig.items}
                                    userName={drawerUserName}
                                    userRole={drawerUserRole}
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
    plansWrap: {
        width: 18,
        height: 18,
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
    },
    plansStar: {
        width: 10,
        height: 10,
        borderRadius: 2,
        transform: [{ rotate: "45deg" }],
    },
    plansLine: {
        width: 14,
        height: 2,
        borderRadius: 1,
    },
    categoriesWrap: {
        width: 18,
        height: 18,
        alignItems: "center",
        justifyContent: "flex-end",
    },
    categoriesTab: {
        width: 10,
        height: 3,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
        marginBottom: 1,
    },
    categoriesBody: {
        width: 16,
        height: 12,
        borderWidth: 2,
        borderRadius: 2,
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
