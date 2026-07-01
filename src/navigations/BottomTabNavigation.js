import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    BackHandler,
    Platform,
} from "react-native";
import { useDispatch } from "react-redux";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { FIRASANS, FIRASANSSEMIBOLD } from "../constant/fontPath";
import { WHITE } from "../constant/color";
import { AppNavigationProvider } from "./AdminNavigationContext";
import { logoutUser } from "../redux/actions/auth";
import { getDrawerConfig } from "./Drawer";
import CustomDrawerNavigation from "./CustomDrawerNavigation";
import { getLoginSession } from "../utils/RoleStorage";
import { isSubAdminSession } from "./subAdminDrawer";
import { MyAlert } from "../components/commonComponents/MyAlert";
import { useAppToast } from "../hooks/useAppToast";
import { useStackBackHandler } from "../hooks/useStackBackHandler";

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

import QcDashboardScreen from "../screens/userScreens/qcInspectorScreen/QcDashboardScreen";
import QcCategoriesScreen from "../screens/userScreens/qcInspectorScreen/QcCategoriesScreen";
import QcAttendanceScreen from "../screens/userScreens/qcInspectorScreen/QcAttendanceScreen";
import QcProfileScreen from "../screens/userScreens/qcInspectorScreen/QcProfileScreen";

import StoreDashboardScreen from "../screens/userScreens/storeKeeperScreen/StoreDashboardScreen";
import StoreCategoriesScreen from "../screens/userScreens/storeKeeperScreen/StoreCategoriesScreen";
import StoreAttendanceScreen from "../screens/userScreens/storeKeeperScreen/StoreAttendanceScreen";
import StoreProfileScreen from "../screens/userScreens/storeKeeperScreen/StoreProfileScreen";

import PackingDashboardScreen from "../screens/userScreens/packingSupervisorScreen/PackingDashboardScreen";
import PackingCategoriesScreen from "../screens/userScreens/packingSupervisorScreen/PackingCategoriesScreen";
import PackingAttendanceScreen from "../screens/userScreens/packingSupervisorScreen/PackingAttendanceScreen";
import PackingProfileScreen from "../screens/userScreens/packingSupervisorScreen/PackingProfileScreen";

import NsmDashboardScreen from "../screens/userScreens/NSMScreen/NsmDashboardScreen";
import NsmTeamActivityLogScreen from "../screens/userScreens/NSMScreen/NsmTeamActivityLogScreen";
import NsmAttendanceScreen from "../screens/userScreens/NSMScreen/NsmAttendanceScreen";
import NsmProfileScreen from "../screens/userScreens/NSMScreen/NsmProfileScreen";

import RsmDashboardScreen from "../screens/userScreens/RSMScreen/RsmDashboardScreen";
import RsmCategoriesScreen from "../screens/userScreens/RSMScreen/RsmCategoriesScreen";
import RsmAttendanceScreen from "../screens/userScreens/RSMScreen/RsmAttendanceScreen";
import RsmProfileScreen from "../screens/userScreens/RSMScreen/RsmProfileScreen";

import AdminDashboardScreen from "../screens/userScreens/adminScreen/AdminDashboardScreen";
import AdminAttendanceScreen from "../screens/userScreens/adminScreen/AdminAttendanceScreen";
import AdminProductsScreen from "../screens/userScreens/adminScreen/AdminProductsScreen";
import AdminProfileScreen from "../screens/userScreens/adminScreen/AdminProfileScreen";

import DistributorDashboardScreen from "../screens/userScreens/distributorScreen/DistributorDashboardScreen";
import DistributorAttendanceScreen from "../screens/userScreens/distributorScreen/DistributorAttendanceScreen";
import DistributorProfileScreen from "../screens/userScreens/distributorScreen/DistributorProfileScreen";

import DealerDashboardScreen from "../screens/userScreens/dealerScreen/DealerDashboardScreen";
import DealerAttendanceScreen from "../screens/userScreens/dealerScreen/DealerAttendanceScreen";
import DealerProfileScreen from "../screens/userScreens/dealerScreen/DealerProfileScreen";

import WholesalerDashboardScreen from "../screens/userScreens/wholesalerScreen/WholesalerDashboardScreen";
import WholesalerAttendanceScreen from "../screens/userScreens/wholesalerScreen/WholesalerAttendanceScreen";
import WholesalerProfileScreen from "../screens/userScreens/wholesalerScreen/WholesalerProfileScreen";

import RetailerDashboardScreen from "../screens/userScreens/retailerScreen/RetailerDashboardScreen";
import RetailerRetailerScreen from "../screens/userScreens/retailerScreen/RetailerRetailerScreen";
import RetailerAttendanceScreen from "../screens/userScreens/retailerScreen/RetailerAttendanceScreen";
import RetailerProfileScreen from "../screens/userScreens/retailerScreen/RetailerProfileScreen";
import RetailerNotificationScreen from "../screens/userScreens/retailerScreen/RetailerNotificationScreen";

import AsmDashboardScreen from "../screens/userScreens/ASMScreen/AsmDashboardScreen";
import AsmCategoriesScreen from "../screens/userScreens/ASMScreen/AsmCategoriesScreen";
import AsmAttendanceScreen from "../screens/userScreens/ASMScreen/AsmAttendanceScreen";
import AsmProfileScreen from "../screens/userScreens/ASMScreen/AsmProfileScreen";

import SoDashboardScreen from "../screens/userScreens/SOScreen/SoDashboardScreen";
import SoCategoriesScreen from "../screens/userScreens/SOScreen/SoCategoriesScreen";
import SoAttendanceScreen from "../screens/userScreens/SOScreen/SoAttendanceScreen";
import SoProfileScreen from "../screens/userScreens/SOScreen/SoProfileScreen";

import VehicleDashboardScreen from "../screens/userScreens/vechileScreen/VehicleDashboardScreen";
import VehicleTransportDispatchScreen from "../screens/userScreens/vechileScreen/VehicleTransportDispatchScreen";
import VehicleAttendanceScreen from "../screens/userScreens/vechileScreen/VehicleAttendanceScreen";
import VehicleProfileScreen from "../screens/userScreens/vechileScreen/VehicleProfileScreen";
import VehicleNotificationScreen from "../screens/userScreens/vechileScreen/VehicleNotificationScreen";

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
    { key: "Categories", label: "Categories", icon: CategoriesIcon },
    { key: "Attendance", label: "Attendance", icon: AttendanceIcon },
    { key: "Profile", label: "Profile", icon: ProfileIcon },
];

const PRODUCTION_TABS = [
    { key: "Dashboard", label: "Dashboard", icon: DashboardIcon },
    { key: "TeamActivityLog", label: "Team Activity Log", icon: ActivityIcon },
    { key: "Attendance", label: "Attendance", icon: AttendanceIcon },
    { key: "Profile", label: "Profile", icon: ProfileIcon },
];

const QC_TABS = [
    { key: "Dashboard", label: "Dashboard", icon: DashboardIcon },
    { key: "Categories", label: "Categories", icon: CategoriesIcon },
    { key: "Attendance", label: "Attendance", icon: AttendanceIcon },
    { key: "Profile", label: "Profile", icon: ProfileIcon },
];

const STORE_TABS = [
    { key: "Dashboard", label: "Dashboard", icon: DashboardIcon },
    { key: "Categories", label: "Categories", icon: CategoriesIcon },
    { key: "Attendance", label: "Attendance", icon: AttendanceIcon },
    { key: "Profile", label: "Profile", icon: ProfileIcon },
];

const PACKING_TABS = [
    { key: "Dashboard", label: "Dashboard", icon: DashboardIcon },
    { key: "Categories", label: "Categories", icon: CategoriesIcon },
    { key: "Attendance", label: "Attendance", icon: AttendanceIcon },
    { key: "Profile", label: "Profile", icon: ProfileIcon },
];

const NSM_TABS = [
    { key: "Dashboard", label: "Dashboard", icon: DashboardIcon },
    { key: "TeamActivityLog", label: "Team Activity Log", icon: ActivityIcon },
    { key: "Attendance", label: "Attendance", icon: AttendanceIcon },
    { key: "Profile", label: "Profile", icon: ProfileIcon },
];

const RSM_TABS = [
    { key: "Dashboard", label: "Dashboard", icon: DashboardIcon },
    { key: "Categories", label: "Categories", icon: CategoriesIcon },
    { key: "Attendance", label: "Attendance", icon: AttendanceIcon },
    { key: "Profile", label: "Profile", icon: ProfileIcon },
];

const CHANNEL_SIMPLE_TABS = [
    { key: "Dashboard", label: "Dashboard", icon: DashboardIcon },
    { key: "Attendance", label: "Attendance", icon: AttendanceIcon },
    { key: "Profile", label: "Profile", icon: ProfileIcon },
];

const RETAILER_TABS = [
    { key: "Dashboard", label: "Dashboard", icon: DashboardIcon },
    { key: "Retailer", label: "Retailer", icon: CategoriesIcon },
    { key: "Attendance", label: "Attendance", icon: AttendanceIcon },
    { key: "Profile", label: "Profile", icon: ProfileIcon },
];

const ADMIN_TABS = [
    { key: "Dashboard", label: "Dashboard", icon: DashboardIcon },
    { key: "Attendance", label: "Attendance", icon: AttendanceIcon },
    { key: "Products", label: "Products", icon: CategoriesIcon },
    { key: "Profile", label: "Profile", icon: ProfileIcon },
];

const ASM_TABS = [
    { key: "Dashboard", label: "Dashboard", icon: DashboardIcon },
    { key: "Categories", label: "Categories", icon: CategoriesIcon },
    { key: "Attendance", label: "Attendance", icon: AttendanceIcon },
    { key: "Profile", label: "Profile", icon: ProfileIcon },
];

const SO_TABS = [
    { key: "Dashboard", label: "Dashboard", icon: DashboardIcon },
    { key: "Categories", label: "Categories", icon: CategoriesIcon },
    { key: "Attendance", label: "Attendance", icon: AttendanceIcon },
    { key: "Profile", label: "Profile", icon: ProfileIcon },
];

const VEHICLE_TABS = [
    { key: "Dashboard", label: "Dashboard", icon: DashboardIcon },
    { key: "TransportDispatch", label: "Transport & Dispatch", icon: ActivityIcon },
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

const QC_SCREEN_MAP = {
    Dashboard: QcDashboardScreen,
    Categories: QcCategoriesScreen,
    Attendance: QcAttendanceScreen,
    Profile: QcProfileScreen,
};

const STORE_SCREEN_MAP = {
    Dashboard: StoreDashboardScreen,
    Categories: StoreCategoriesScreen,
    Attendance: StoreAttendanceScreen,
    Profile: StoreProfileScreen,
};

const PACKING_SCREEN_MAP = {
    Dashboard: PackingDashboardScreen,
    Categories: PackingCategoriesScreen,
    Attendance: PackingAttendanceScreen,
    Profile: PackingProfileScreen,
};

const NSM_SCREEN_MAP = {
    Dashboard: NsmDashboardScreen,
    TeamActivityLog: NsmTeamActivityLogScreen,
    Attendance: NsmAttendanceScreen,
    Profile: NsmProfileScreen,
};

const RSM_SCREEN_MAP = {
    Dashboard: RsmDashboardScreen,
    Categories: RsmCategoriesScreen,
    Attendance: RsmAttendanceScreen,
    Profile: RsmProfileScreen,
};

const ADMIN_SCREEN_MAP = {
    Dashboard: AdminDashboardScreen,
    Attendance: AdminAttendanceScreen,
    Products: AdminProductsScreen,
    Profile: AdminProfileScreen,
};

const DISTRIBUTOR_SCREEN_MAP = {
    Dashboard: DistributorDashboardScreen,
    Attendance: DistributorAttendanceScreen,
    Profile: DistributorProfileScreen,
};

const DEALER_SCREEN_MAP = {
    Dashboard: DealerDashboardScreen,
    Attendance: DealerAttendanceScreen,
    Profile: DealerProfileScreen,
};

const WHOLESALER_SCREEN_MAP = {
    Dashboard: WholesalerDashboardScreen,
    Attendance: WholesalerAttendanceScreen,
    Profile: WholesalerProfileScreen,
};

const RETAILER_SCREEN_MAP = {
    Dashboard: RetailerDashboardScreen,
    Retailer: RetailerRetailerScreen,
    Attendance: RetailerAttendanceScreen,
    Profile: RetailerProfileScreen,
};

const ASM_SCREEN_MAP = {
    Dashboard: AsmDashboardScreen,
    Categories: AsmCategoriesScreen,
    Attendance: AsmAttendanceScreen,
    Profile: AsmProfileScreen,
};

const SO_SCREEN_MAP = {
    Dashboard: SoDashboardScreen,
    Categories: SoCategoriesScreen,
    Attendance: SoAttendanceScreen,
    Profile: SoProfileScreen,
};

const VEHICLE_SCREEN_MAP = {
    Dashboard: VehicleDashboardScreen,
    TransportDispatch: VehicleTransportDispatchScreen,
    Attendance: VehicleAttendanceScreen,
    Profile: VehicleProfileScreen,
};

const NO_DRAWER_STACK_MAP = {
    retailer: { Notification: RetailerNotificationScreen },
    vehicle: { Notification: VehicleNotificationScreen },
    transport: { Notification: VehicleNotificationScreen },
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
    const isQc = role === "qc";
    const isStore = role === "store";
    const isPacking = role === "packing";
    const isNsm = role === "nsm";
    const isRsm = role === "rsm";
    const isAdmin = role === "admin";
    const isDistributor = role === "distributor";
    const isDealer = role === "dealer";
    const isWholesaler = role === "wholesaler";
    const isRetailer = role === "retailer";
    const isAsm = role === "asm";
    const isSo = role === "so";
    const isVehicle = role === "vehicle" || role === "transport";
    const hasDrawer =
        isFinance ||
        isMarketing ||
        isShift ||
        isMachine ||
        isProduction ||
        isQc ||
        isStore ||
        isPacking ||
        isNsm ||
        isRsm ||
        isAdmin ||
        isDistributor ||
        isDealer ||
        isWholesaler ||
        isAsm ||
        isSo;

    const tabs = isVehicle
        ? VEHICLE_TABS
        : isRetailer
          ? RETAILER_TABS
          : isSo
            ? SO_TABS
            : isAsm
              ? ASM_TABS
              : isRsm
                ? RSM_TABS
                : isDistributor || isDealer || isWholesaler
                  ? CHANNEL_SIMPLE_TABS
                  : isAdmin
                    ? ADMIN_TABS
                    : isNsm
                      ? NSM_TABS
                      : isPacking
                        ? PACKING_TABS
                        : isStore
                          ? STORE_TABS
                          : isMarketing
                            ? MARKETING_TABS
                            : isQc
                              ? QC_TABS
                              : isProduction
                                ? PRODUCTION_TABS
                                : isShift
                                  ? SHIFT_TABS
                                  : isMachine
                                    ? MACHINE_TABS
                                    : FINANCE_TABS;

    const screenMap = isVehicle
        ? VEHICLE_SCREEN_MAP
        : isRetailer
          ? RETAILER_SCREEN_MAP
          : isSo
            ? SO_SCREEN_MAP
            : isAsm
              ? ASM_SCREEN_MAP
              : isRsm
                ? RSM_SCREEN_MAP
                : isDistributor
                  ? DISTRIBUTOR_SCREEN_MAP
                  : isDealer
                    ? DEALER_SCREEN_MAP
                    : isWholesaler
                      ? WHOLESALER_SCREEN_MAP
                      : isAdmin
                        ? ADMIN_SCREEN_MAP
                        : isNsm
                          ? NSM_SCREEN_MAP
                          : isPacking
                            ? PACKING_SCREEN_MAP
                            : isStore
                              ? STORE_SCREEN_MAP
                              : isMarketing
                                ? MARKETING_SCREEN_MAP
                                : isQc
                                  ? QC_SCREEN_MAP
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
    const [logoutVisible, setLogoutVisible] = useState(false);
    const { showSuccess, showError, Toast } = useAppToast();

    const refreshLoginSession = useCallback(async () => {
        const loginResponse = await getLoginSession();
        setLoginSession(loginResponse || null);
        return loginResponse;
    }, []);

  useEffect(() => {
        refreshLoginSession();
    }, [refreshLoginSession]);

    const isSubAdmin = isSubAdminSession(loginSession);
    const drawerConfig = hasDrawer ? getDrawerConfig(role, isSubAdmin) : null;
    const stackScreenMap = hasDrawer
        ? drawerConfig?.stackMap || {}
        : NO_DRAWER_STACK_MAP[role] || {};
    const drawerUserName = loginSession?.name || drawerConfig?.userName || "";
    const drawerUserRole = drawerConfig?.isSubAdmin
        ? `${drawerConfig.userRole} • Sub Admin`
        : drawerConfig?.userRole || "";

    const ActiveScreen = screenMap[activeTab];

    const closeDrawer = useCallback(() => setDrawerOpen(false), []);
    const openDrawer = useCallback(async () => {
        if (!hasDrawer) return;
        await refreshLoginSession();
        setDrawerOpen(true);
    }, [hasDrawer, refreshLoginSession]);

    const handleGoBack = useCallback(() => setStackRoute(null), []);
    useStackBackHandler(handleGoBack, Boolean(stackRoute));

    const confirmLogout = useCallback(() => {
        setLogoutVisible(false);
        dispatch(logoutUser());
        showSuccess("Logged out successfully");
    }, [dispatch, showSuccess]);

    const handleLogout = useCallback(() => {
        setLogoutVisible(true);
    }, []);

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
            goBack: handleGoBack,
            onLogout: handleLogout,
            showSuccess,
            showError,
        }),
        [hasDrawer, openDrawer, closeDrawer, handleLogout, handleGoBack, showSuccess, showError]
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
                compactLabel={
                    isFinance ||
                    isMarketing ||
                    isShift ||
                    isMachine ||
                    isProduction ||
                    isQc ||
                    isStore ||
                    isPacking ||
                    isNsm ||
        isRsm ||
                    isAdmin ||
                    isDistributor ||
                    isDealer ||
                    isWholesaler ||
                    isRetailer ||
                    isAsm ||
                    isSo ||
                    isVehicle
                }
          />
        </>
    );

    return (
        <AppNavigationProvider value={navigation}>
            <SafeAreaProvider>
                <View style={styles.root}>
                    {StackScreen ? <StackScreen /> : renderTabContent()}

                    {drawerOpen && drawerConfig ? (
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
                    <Toast />
                    <MyAlert
                        visible={logoutVisible}
                        title="Logout"
                        message="Are you sure you want to logout?"
                        textLeft="Cancel"
                        textRight="Logout"
                        onPressLeft={() => setLogoutVisible(false)}
                        onPressRight={confirmLogout}
                        onRequestClose={() => setLogoutVisible(false)}
                    />
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
