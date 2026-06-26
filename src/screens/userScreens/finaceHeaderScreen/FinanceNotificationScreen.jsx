import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    BackHandler,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MyHeader } from "../../../components/commonComponents/MyHeader";
import { useFinanceNavigation } from "../../../navigations/AdminNavigationContext";
import { FIRASANS, FIRASANSSEMIBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR, WHITE } from "../../../constant/color";

const INITIAL_NOTIFICATIONS = [
    {
        id: "1",
        title: "Collection Pending",
        message: "₹1.2L outstanding from East zone distributor.",
        time: "1 hour ago",
        unread: true,
        icon: "💰",
        iconBg: "#DCFCE7",
    },
    {
        id: "2",
        title: "Claim Approved",
        message: "Claim #CL-208 has been approved for settlement.",
        time: "3 hours ago",
        unread: true,
        icon: "✓",
        iconBg: "#DBEAFE",
    },
    {
        id: "3",
        title: "New Order Alert",
        message: "Primary sales order #PS-441 requires finance review.",
        time: "Yesterday",
        unread: false,
        icon: "📋",
        iconBg: "#FEF3C7",
    },
];

const NotificationCard = ({ item }) => (
    <TouchableOpacity activeOpacity={0.85} style={styles.card}>
        <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
            <Text style={styles.iconText}>{item.icon}</Text>
        </View>
        <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMessage}>{item.message}</Text>
            <Text style={styles.cardTime}>{item.time}</Text>
        </View>
    </TouchableOpacity>
);

const FinanceNotificationScreen = () => {
    const navigation = useFinanceNavigation();
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const [refreshing, setRefreshing] = useState(false);

    const handleBack = useCallback(() => navigation.goBack(), [navigation]);

    useEffect(() => {
        if (Platform.OS !== "android") return undefined;
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            navigation.goBack();
            return true;
        });
        return () => sub.remove();
    }, [navigation]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setNotifications([...INITIAL_NOTIFICATIONS]);
            setRefreshing(false);
        }, 1000);
    }, []);

    return (
        <View style={styles.root}>
            <MyHeader
                showBack
                showCenterTitle
                title="Notification"
                backgroundColor={WHITE}
                onBackPress={handleBack}
            />
            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <NotificationCard item={item} />}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[BRANDCOLOR]}
                            tintColor={BRANDCOLOR}
                        />
                    }
                />
            </SafeAreaView>
        </View>
    );
};

export default FinanceNotificationScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    safeArea: { flex: 1 },
    listContent: { padding: 16 },
    card: {
        flexDirection: "row",
        backgroundColor: WHITE,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        gap: 12,
    },
    iconWrap: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: "center",
        alignItems: "center",
    },
    iconText: { fontSize: 18 },
    cardBody: { flex: 1 },
    cardTitle: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: "#111827", marginBottom: 4 },
    cardMessage: { fontFamily: FIRASANS, fontSize: 13, color: "#6B7280", marginBottom: 4 },
    cardTime: { fontFamily: FIRASANS, fontSize: 12, color: "#9CA3AF" },
});
