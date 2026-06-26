import React, { useCallback, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/commonComponents/Header";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR } from "../../../constant/color";

const SCREEN_BG = "#FFFFFF";
const CARD_BG = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const TEXT_LIGHT = "#9CA3AF";
const BORDER_COLOR = "#E5E7EB";
const GREEN = "#16A34A";
const ORANGE = "#F59E0B";
const RED = "#EF4444";

const SUMMARY_DATA = [
    {
        id: "1",
        label: "TOTAL RECORDS",
        value: "2",
        footer: "All time",
        icon: "📋",
    },
    {
        id: "2",
        label: "PRESENT TODAY",
        value: "0",
        footer: "Checked in today",
        icon: "✓",
        iconColor: GREEN,
    },
    {
        id: "3",
        label: "WITH LOCATION",
        value: "2",
        footer: "GPS captured",
        icon: "📍",
    },
];

const ATTENDANCE_ROWS = [
    {
        id: "1",
        date: "2026-06-22",
        name: "Super Admin",
        role: "Super Admin • Administration",
        checkIn: "5:46:37 pm",
        checkInLocation: "20.25996, 85.78834",
        checkOut: "5:46:40 pm",
        checkOutLocation: "-",
        status: "Present",
    },
    {
        id: "2",
        date: "2025-09-24",
        name: "Rajesh",
        role: "Administration",
        checkIn: "6:31:27 pm",
        checkInLocation: "Plot No-934, near KIIT Square, Patia, Bhubaneswar, Odisha 751024, India",
        checkOut: "-",
        checkOutLocation: "-",
        status: "Present",
    },
];

const AttendanceLogCard = ({ item }) => (
    <View style={styles.logItemCard}>
        <View style={styles.logItemHeader}>
            <Text style={styles.logItemDate}>{item.date}</Text>
            <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{item.status}</Text>
            </View>
        </View>

        <Text style={styles.employeeName}>{item.name}</Text>
        <Text style={styles.employeeRole}>{item.role}</Text>

        <View style={styles.checkRow}>
            <Text style={styles.checkLabel}>Check In</Text>
            <Text style={styles.checkInTime}>{item.checkIn}</Text>
        </View>
        <Text style={styles.locationText}>{item.checkInLocation}</Text>

        <View style={styles.checkRow}>
            <Text style={styles.checkLabel}>Check Out</Text>
            <Text style={styles.checkOutTime}>
                {item.checkOut === "-" ? "-" : item.checkOut}
            </Text>
        </View>
        <Text style={styles.locationText}>{item.checkOutLocation}</Text>

        <TouchableOpacity activeOpacity={0.8} style={styles.deleteButton}>
            <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
    </View>
);

const AdminAttendanceScreen = () => {
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    const filteredRows = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return ATTENDANCE_ROWS;

        return ATTENDANCE_ROWS.filter(
            (row) =>
                row.name.toLowerCase().includes(query) ||
                row.role.toLowerCase().includes(query) ||
                row.date.includes(query)
        );
    }, [search]);

    const listHeader = (
        <View>
            <Text style={styles.title}>Attendance Tracking</Text>
            <Text style={styles.subtitle}>
                GPS check-in/out for all employees — use the header buttons to mark attendance.
            </Text>

            <View style={styles.summaryRow}>
                {SUMMARY_DATA.map((item) => (
                    <View key={item.id} style={styles.summaryCard}>
                        <View style={styles.summaryTop}>
                            <Text style={styles.summaryLabel}>{item.label}</Text>
                            <Text style={[styles.summaryIcon, item.iconColor ? { color: item.iconColor } : null]}>
                                {item.icon}
                            </Text>
                        </View>
                        <Text style={styles.summaryValue}>{item.value}</Text>
                        <Text style={styles.summaryFooter}>→ {item.footer}</Text>
                    </View>
                ))}
            </View>

            <Text style={styles.logTitle}>Attendance Log</Text>
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
    );

    const listFooter = (
        <View>
            <Text style={styles.footerText}>
                SpiceCraft ERP v3.0 • Logged in as Rajesh (Admin) • 23
            </Text>
            <View style={styles.bottomSpacer} />
        </View>
    );

    return (
        <View style={styles.root}>
            <Header title="Attendance" />

            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={filteredRows}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <AttendanceLogCard item={item} />}
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
                />
            </SafeAreaView>
        </View>
    );
};

export default AdminAttendanceScreen;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: SCREEN_BG,
    },
    safeArea: {
        flex: 1,
        backgroundColor: SCREEN_BG,
    },
    listContent: {
        padding: 16,
        paddingBottom: 24,
    },
    title: {
        fontSize: 24,
        fontFamily: UBUNTUBOLD,
        color: TEXT_DARK,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 13,
        fontFamily: FIRASANS,
        color: TEXT_MUTED,
        lineHeight: 18,
        marginBottom: 18,
    },
    summaryRow: {
        gap: 12,
        marginBottom: 20,
    },
    summaryCard: {
        backgroundColor: CARD_BG,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        padding: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    summaryTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 11,
        fontFamily: FIRASANSSEMIBOLD,
        color: TEXT_LIGHT,
        letterSpacing: 0.6,
        flex: 1,
    },
    summaryIcon: {
        fontSize: 16,
    },
    summaryValue: {
        fontSize: 28,
        fontFamily: UBUNTUBOLD,
        color: TEXT_DARK,
        marginBottom: 6,
    },
    summaryFooter: {
        fontSize: 12,
        fontFamily: FIRASANS,
        color: TEXT_MUTED,
    },
    logTitle: {
        fontSize: 16,
        fontFamily: UBUNTUBOLD,
        color: TEXT_DARK,
        marginBottom: 12,
    },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        paddingHorizontal: 12,
        height: 42,
        marginBottom: 14,
    },
    searchIcon: {
        fontSize: 14,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: FIRASANS,
        color: TEXT_DARK,
        padding: 0,
    },
    logItemCard: {
        backgroundColor: CARD_BG,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        padding: 14,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    logItemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    logItemDate: {
        fontSize: 12,
        fontFamily: FIRASANSSEMIBOLD,
        color: TEXT_MUTED,
    },
    employeeName: {
        fontSize: 15,
        fontFamily: UBUNTUBOLD,
        color: TEXT_DARK,
        marginBottom: 2,
    },
    employeeRole: {
        fontSize: 12,
        fontFamily: FIRASANS,
        color: TEXT_MUTED,
        marginBottom: 12,
    },
    checkRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    checkLabel: {
        fontSize: 12,
        fontFamily: FIRASANSSEMIBOLD,
        color: TEXT_MUTED,
    },
    checkInTime: {
        fontSize: 13,
        fontFamily: FIRASANSSEMIBOLD,
        color: GREEN,
    },
    checkOutTime: {
        fontSize: 13,
        fontFamily: FIRASANSSEMIBOLD,
        color: ORANGE,
    },
    locationText: {
        fontSize: 11,
        fontFamily: FIRASANS,
        color: TEXT_LIGHT,
        lineHeight: 16,
        marginBottom: 10,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0FDF4",
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: GREEN,
    },
    statusText: {
        fontSize: 11,
        fontFamily: FIRASANSSEMIBOLD,
        color: GREEN,
    },
    deleteButton: {
        alignSelf: "flex-end",
    },
    deleteText: {
        fontSize: 13,
        fontFamily: FIRASANSSEMIBOLD,
        color: RED,
    },
    footerText: {
        textAlign: "center",
        fontSize: 11,
        fontFamily: FIRASANS,
        color: TEXT_LIGHT,
        marginTop: 8,
    },
    bottomSpacer: {
        height: 16,
    },
});
