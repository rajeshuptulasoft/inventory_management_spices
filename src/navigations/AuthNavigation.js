import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useSelector } from "react-redux";
import { useRoute } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import BottomTabNavigation from "./BottomTabNavigation";
import { getLoginSession } from "../utils/RoleStorage";

const Stack = createStackNavigator();

const FinanceMainScreen = () => <BottomTabNavigation role="finance" />;
const MarketingMainScreen = () => <BottomTabNavigation role="marketing" />;
const ShiftMainScreen = () => <BottomTabNavigation role="shift" />;
const MachineMainScreen = () => <BottomTabNavigation role="machine" />;
const ProductionMainScreen = () => <BottomTabNavigation role="production" />;
const QcMainScreen = () => <BottomTabNavigation role="qc" />;
const StoreMainScreen = () => <BottomTabNavigation role="store" />;
const PackingMainScreen = () => <BottomTabNavigation role="packing" />;
const NsmMainScreen = () => <BottomTabNavigation role="nsm" />;
const RsmMainScreen = () => <BottomTabNavigation role="rsm" />;
const AdminMainScreen = () => <BottomTabNavigation role="admin" />;
const DistributorMainScreen = () => <BottomTabNavigation role="distributor" />;
const DealerMainScreen = () => <BottomTabNavigation role="dealer" />;
const WholesalerMainScreen = () => <BottomTabNavigation role="wholesaler" />;
const RetailerMainScreen = () => <BottomTabNavigation role="retailer" />;
const AsmMainScreen = () => <BottomTabNavigation role="asm" />;
const SoMainScreen = () => <BottomTabNavigation role="so" />;
const VehicleMainScreen = () => <BottomTabNavigation role="vehicle" />;
const TransportMainScreen = () => <BottomTabNavigation role="transport" />;

const ROLE_MAIN_MAP = {
    finance: FinanceMainScreen,
    marketing: MarketingMainScreen,
    shift: ShiftMainScreen,
    machine: MachineMainScreen,
    production: ProductionMainScreen,
    qc: QcMainScreen,
    store: StoreMainScreen,
    packing: PackingMainScreen,
    nsm: NsmMainScreen,
    rsm: RsmMainScreen,
    admin: AdminMainScreen,
    distributor: DistributorMainScreen,
    dealer: DealerMainScreen,
    wholesaler: WholesalerMainScreen,
    retailer: RetailerMainScreen,
    asm: AsmMainScreen,
    so: SoMainScreen,
    vehicle: VehicleMainScreen,
    transport: TransportMainScreen,
};

export const RoleBasedMain = () => {
    const route = useRoute();
    const reduxRole = useSelector((state) => state.authStatus.role);
    const [sessionRole, setSessionRole] = useState(route.params?.role || null);

    useEffect(() => {
        if (reduxRole || sessionRole) return undefined;

        let mounted = true;
        getLoginSession().then((session) => {
            if (mounted && session?.role) {
                setSessionRole(session.role);
            }
        });

        return () => {
            mounted = false;
        };
    }, [reduxRole, sessionRole]);

    const role = String(reduxRole || route.params?.role || sessionRole || "")
        .toLowerCase()
        .trim();

    if (!role) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#05A845" />
            </View>
        );
    }

    const MainComponent = ROLE_MAIN_MAP[role];
    if (MainComponent) {
        return <MainComponent />;
    }

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
            <ActivityIndicator size="large" color="#05A845" />
        </View>
    );
};

const AuthNavigation = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
            initialRouteName="Main"
        >
            <Stack.Screen name="Main" component={RoleBasedMain} />
        </Stack.Navigator>
    );
};

export default AuthNavigation;
