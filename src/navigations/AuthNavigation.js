import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useDispatch } from "react-redux";
import { createStackNavigator } from "@react-navigation/stack";
import BottomTabNavigation from "./BottomTabNavigation";
import { getObjByKey } from "../utils/Storage";
import { logoutUser } from "../redux/actions/auth";

const Stack = createStackNavigator();

const VALID_ROLES = new Set(["finance", "marketing", "shift", "machine", "production"]);

const FinanceMainScreen = () => <BottomTabNavigation role="finance" />;
const MarketingMainScreen = () => <BottomTabNavigation role="marketing" />;
const ShiftMainScreen = () => <BottomTabNavigation role="shift" />;
const MachineMainScreen = () => <BottomTabNavigation role="machine" />;
const ProductionMainScreen = () => <BottomTabNavigation role="production" />;

const RoleBasedMain = () => {
    const dispatch = useDispatch();
    const [role, setRole] = useState(undefined);

    useEffect(() => {
        const loadRole = async () => {
            const loginResponse = await getObjByKey("loginResponse");
            const storedRole = loginResponse?.role;
            if (storedRole && VALID_ROLES.has(storedRole)) {
                setRole(storedRole);
                return;
            }
            await dispatch(logoutUser());
            setRole(null);
        };
        loadRole();
    }, [dispatch]);

    if (role === undefined) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#05A845" />
            </View>
        );
    }

    if (role === null) {
        return null;
    }

    if (role === "finance") {
        return <FinanceMainScreen />;
    }
    if (role === "marketing") {
        return <MarketingMainScreen />;
    }
    if (role === "shift") {
        return <ShiftMainScreen />;
    }
    if (role === "machine") {
        return <MachineMainScreen />;
    }
    if (role === "production") {
        return <ProductionMainScreen />;
    }

    return null;
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
            <Stack.Screen name="FinanceMain" component={FinanceMainScreen} />
            <Stack.Screen name="MarketingMain" component={MarketingMainScreen} />
            <Stack.Screen name="ShiftMain" component={ShiftMainScreen} />
            <Stack.Screen name="MachineMain" component={MachineMainScreen} />
            <Stack.Screen name="ProductionMain" component={ProductionMainScreen} />
        </Stack.Navigator>
    );
};

export default AuthNavigation;
