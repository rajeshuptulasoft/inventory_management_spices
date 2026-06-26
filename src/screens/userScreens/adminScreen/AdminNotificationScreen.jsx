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
import { useNavigation } from "../../../navigations/AdminNavigationContext";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR, WHITE } from "../../../constant/color";

const SCREEN_BG = "#F3F4F6";
const CARD_BG = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const UNREAD_DOT = "#2563EB";

const INITIAL_NOTIFICATIONS = [
    {
        id: "1",
        title: "Low Stock Alert",
        message: "Turmeric Powder is below 50 units. Restock recommended.",
        time: "2 hours ago",
        unread: true,
        icon: "⚠️",
        iconBg: "#FEE2E2",
    },
    {
        id: "2",
        title: "New Order Received",
        message: "Order #8922 from Global Foods Inc. has been placed.",
        time: "2 mins ago",
        unread: true,
        icon: "🛍️",
        iconBg: "#DCFCE7",
    },
    {
        id: "3",
        title: "Production Batch Completed",
        message: "Batch #45 passed quality check at 100%.",
        time: "45 mins ago",
        unread: false,
        icon: "✓",
        iconBg: "#DBEAFE",
    },
    {
        id: "4",
        title: "Shipment Dispatched",
        message: "Tracking ID YB-990-22 is on the way to the retailer.",
        time: "5 hours ago",
        unread: false,
        icon: "🚚",
        iconBg: "#FEF3C7",
    },
    {
        id: "5",
        title: "Attendance Reminder",
        message: "3 employees have not checked in today.",
        time: "Yesterday",
        unread: false,
        icon: "📍",
        iconBg: "#E0E7FF",
    },
];

const NotificationCard = ({ item }) => (
    <TouchableOpacity activeOpacity={0.85} style={styles.card}>
        <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
            <Text style={styles.iconText}>{item.icon}</Text>
        </View>

        <View style={styles.cardBody}>
            <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.unread ? <View style={styles.unreadDot} /> : null}
            </View>
            <Text style={styles.cardMessage}>{item.message}</Text>
            <Text style={styles.cardTime}>{item.time}</Text>
        </View>
    </TouchableOpacity>
);

const AdminNotificationScreen = () => {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const [refreshing, setRefreshing] = useState(false);

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    useEffect(() => {
        if (Platform.OS !== "android") {
            return undefined;
        }

        const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
            navigation.goBack();
            return true;
        });

        return () => subscription.remove();
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
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[BRANDCOLOR]}
                            tintColor={BRANDCOLOR}
                        />
                    }
                    ListHeaderComponent={
                        <Text style={styles.sectionLabel}>Recent Notifications</Text>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <Text style={styles.emptyTitle}>No notifications</Text>
                            <Text style={styles.emptyText}>You are all caught up.</Text>
                        </View>
                    }
                />
            </SafeAreaView>
        </View>
    );
};

export default AdminNotificationScreen;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: SCREEN_BG,
    },
    safeArea: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        paddingBottom: 24,
    },
    sectionLabel: {
        fontFamily: UBUNTUBOLD,
        fontSize: 16,
        color: TEXT_DARK,
        marginBottom: 12,
    },
    card: {
        flexDirection: "row",
        backgroundColor: CARD_BG,
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
    iconText: {
        fontSize: 18,
    },
    cardBody: {
        flex: 1,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 4,
    },
    cardTitle: {
        flex: 1,
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 15,
        color: TEXT_DARK,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: UNREAD_DOT,
    },
    cardMessage: {
        fontFamily: FIRASANS,
        fontSize: 13,
        color: TEXT_MUTED,
        lineHeight: 18,
        marginBottom: 6,
    },
    cardTime: {
        fontFamily: FIRASANS,
        fontSize: 12,
        color: "#9CA3AF",
    },
    emptyWrap: {
        alignItems: "center",
        paddingVertical: 48,
    },
    emptyTitle: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 16,
        color: TEXT_DARK,
        marginBottom: 6,
    },
    emptyText: {
        fontFamily: FIRASANS,
        fontSize: 14,
        color: TEXT_MUTED,
    },
});
