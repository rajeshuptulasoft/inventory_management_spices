import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import BottomTabNavigation from "./BottomTabNavigation";
import { getObjByKey } from "../utils/Storage";

const Stack = createStackNavigator();

const AdminMainScreen = () => <BottomTabNavigation role="admin" />;
const FinanceMainScreen = () => <BottomTabNavigation role="finance" />;

const RoleBasedMain = () => {
    const [role, setRole] = useState(null);

    useEffect(() => {
        const loadRole = async () => {
            const loginResponse = await getObjByKey("loginResponse");
            setRole(loginResponse?.role === "finance" ? "finance" : "admin");
        };
        loadRole();
    }, []);

    if (!role) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#05A845" />
            </View>
        );
    }

    return role === "finance" ? <FinanceMainScreen /> : <AdminMainScreen />;
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
            <Stack.Screen name="AdminMain" component={AdminMainScreen} />
            <Stack.Screen name="FinanceMain" component={FinanceMainScreen} />
        </Stack.Navigator>
    );
};

export default AuthNavigation;
