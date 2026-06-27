import React, { useCallback, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    ScrollView,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FinanceHeader from "../../../components/commonComponents/FinanceHeader";
import AttendanceActionButtons from "../../../components/attendance/AttendanceActionButtons";
import { useFinanceNavigation } from "../../../navigations/AdminNavigationContext";
import { useAttendanceTracking } from "../../../hooks/useAttendanceTracking";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR } from "../../../constant/color";

const SCREEN_BG = "#F3F4F6";
const CARD_BG = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const TEXT_LIGHT = "#9CA3AF";
const BORDER_COLOR = "#E5E7EB";
const GREEN = "#16A34A";
const ORANGE = "#F59E0B";

const SUMMARY_META = [
    {
        id: "1",
        label: "TOTAL RECORDS",
        footer: "All time",
        icon: "📋",
        iconBg: "#DBEAFE",
        key: "totalRecords",
    },
    {
        id: "2",
        label: "PRESENT TODAY",
        footer: "Checked in today",
        icon: "✓",
        iconBg: "#DCFCE7",
        iconColor: GREEN,
        key: "presentToday",
    },
    {
        id: "3",
        label: "WITH LOCATION",
        footer: "GPS captured",
        icon: "📍",
        iconBg: "#FCE7F3",
        key: "withLocation",
    },
];

const EMPLOYEE = { name: "Machine Operator", role: "Machine Operator • Production Floor" };
const STORAGE_KEY = "attendance_shift";

const SummaryCard = ({ item }) => (
    <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
            <Text style={styles.summaryLabel}>{item.label}</Text>
            <View style={[styles.summaryIconWrap, { backgroundColor: item.iconBg }]}>
                <Text style={[styles.summaryIcon, item.iconColor ? { color: item.iconColor } : null]}>
                    {item.icon}
                </Text>
            </View>
        </View>
        <Text style={styles.summaryValue}>{item.value}</Text>
        <Text style={styles.summaryFooter}>→ {item.footer}</Text>
    </View>
);

const AttendanceLogCard = ({ item }) => {
    const hasCheckOut = item.checkOut && item.checkOut !== "-";
    const displayStatus = item.checkIn ? "Present" : item.status;

    return (
        <View style={styles.logCard}>
            <View style={styles.logCardHeader}>
                <View>
                    <Text style={styles.logLabel}>DATE</Text>
                    <Text style={styles.logValue}>{item.date}</Text>
                </View>
                <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>{displayStatus}</Text>
                </View>
            </View>

            <View style={styles.logField}>
                <Text style={styles.logLabel}>EMPLOYEE</Text>
                <Text style={styles.employeeName}>{item.name}</Text>
                {item.role ? <Text style={styles.employeeRole}>{item.role}</Text> : null}
            </View>

            <View style={styles.checkRow}>
                <View style={styles.checkCol}>
                    <Text style={styles.logLabel}>CHECK IN</Text>
                    <Text style={styles.checkInTime}>{item.checkIn}</Text>
                    {item.checkInLocation ? (
                        <Text style={styles.locationText}>{item.checkInLocation}</Text>
                    ) : null}
                </View>
                <View style={styles.checkCol}>
                    <Text style={styles.logLabel}>CHECK OUT</Text>
                    <Text style={[styles.checkOutTime, hasCheckOut && styles.checkOutTimeActive]}>
                        {hasCheckOut ? item.checkOut : "-"}
                    </Text>
                    {hasCheckOut && item.checkOutLocation ? (
                        <Text style={styles.locationText}>
                            {item.checkOutLocation === "-" ? "-" : item.checkOutLocation}
                        </Text>
                    ) : hasCheckOut ? (
                        <Text style={styles.locationText}>-</Text>
                    ) : null}
                </View>
            </View>
        </View>
    );
};

const MachineAttendanceScreen = () => {
    const navigation = useFinanceNavigation();
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const { rows, canCheckIn, canCheckOut, handleCheckIn, handleCheckOut, summaryData } =
        useAttendanceTracking(STORAGE_KEY, EMPLOYEE);

    const summaryCards = useMemo(
        () =>
            SUMMARY_META.map((item) => ({
                ...item,
                value: summaryData[item.key] ?? "0",
            })),
        [summaryData]
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const filteredRows = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return rows;
        return rows.filter(
            (row) =>
                row.name.toLowerCase().includes(query) ||
                (row.role && row.role.toLowerCase().includes(query)) ||
                row.date.includes(query)
        );
    }, [search, rows]);

    const listHeader = (
        <View>
            <View style={styles.pageHeader}>
                <Text style={styles.pageTitle}>Attendance Tracking</Text>
                <Text style={styles.pageSubtitle}>
                    GPS check-in/out for all employees — tap the location button to mark attendance.
                </Text>
            </View>

            <ScrollView
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.summaryScroll}
            >
                {summaryCards.map((item) => (
                    <SummaryCard key={item.id} item={item} />
                ))}
            </ScrollView>

            <View style={styles.logSection}>
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
        </View>
    );

    const listFooter = (
        <Text style={styles.footerText}>
            SpiceCraft ERP v3.0 • Logged in as Machine Operator (Machine Operator) • 27
        </Text>
    );

    return (
        <View style={styles.root}>
            <FinanceHeader
                title="Attendance"
                profileInitial="M"
                onProfilePress={navigation.openDrawer}
            />

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
                    ListEmptyComponent={
                        <View style={styles.emptyLog}>
                            <Text style={styles.emptyLogText}>No attendance records yet</Text>
                        </View>
                    }
                />

                <AttendanceActionButtons
                    canCheckIn={canCheckIn}
                    canCheckOut={canCheckOut}
                    onCheckIn={handleCheckIn}
                    onCheckOut={handleCheckOut}
                />
            </SafeAreaView>
        </View>
    );
};

export default MachineAttendanceScreen;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: SCREEN_BG,
    },
    safeArea: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    pageHeader: {
        paddingTop: 14,
        paddingBottom: 14,
    },
    pageTitle: {
        fontFamily: UBUNTUBOLD,
        fontSize: 22,
        color: TEXT_DARK,
        marginBottom: 6,
    },
    pageSubtitle: {
        fontFamily: FIRASANS,
        fontSize: 13,
        color: TEXT_MUTED,
        lineHeight: 18,
    },
    summaryScroll: {
        gap: 10,
        paddingBottom: 14,
    },
    summaryCard: {
        width: 158,
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        marginRight: 10,
    },
    summaryTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 10,
        gap: 6,
    },
    summaryLabel: {
        flex: 1,
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 10,
        color: TEXT_MUTED,
        letterSpacing: 0.3,
        lineHeight: 14,
    },
    summaryIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    summaryIcon: {
        fontSize: 14,
        color: TEXT_DARK,
    },
    summaryValue: {
        fontFamily: UBUNTUBOLD,
        fontSize: 28,
        color: TEXT_DARK,
        marginBottom: 4,
    },
    summaryFooter: {
        fontFamily: FIRASANS,
        fontSize: 11,
        color: TEXT_LIGHT,
    },
    logSection: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        padding: 14,
        marginBottom: 10,
    },
    logTitle: {
        fontFamily: UBUNTUBOLD,
        fontSize: 16,
        color: TEXT_DARK,
        marginBottom: 10,
    },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        paddingHorizontal: 12,
    },
    searchIcon: {
        fontSize: 14,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 11,
        fontFamily: FIRASANS,
        fontSize: 14,
        color: TEXT_DARK,
    },
    logCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    logCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    logLabel: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 9,
        color: TEXT_MUTED,
        letterSpacing: 0.4,
        marginBottom: 4,
    },
    logValue: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 13,
        color: TEXT_DARK,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ECFDF5",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: GREEN,
    },
    statusText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 11,
        color: GREEN,
    },
    logField: {
        marginBottom: 12,
    },
    employeeName: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 15,
        color: TEXT_DARK,
    },
    employeeRole: {
        fontFamily: FIRASANS,
        fontSize: 12,
        color: TEXT_MUTED,
        marginTop: 2,
    },
    checkRow: {
        flexDirection: "row",
        gap: 12,
    },
    checkCol: {
        flex: 1,
    },
    checkInTime: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 13,
        color: GREEN,
    },
    checkOutTime: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 13,
        color: TEXT_MUTED,
    },
    checkOutTimeActive: {
        color: ORANGE,
    },
    locationText: {
        fontFamily: FIRASANS,
        fontSize: 11,
        color: TEXT_LIGHT,
        marginTop: 4,
        lineHeight: 15,
    },
    emptyLog: {
        minHeight: 120,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 32,
    },
    emptyLogText: {
        fontFamily: FIRASANS,
        fontSize: 13,
        color: TEXT_LIGHT,
    },
    footerText: {
        fontFamily: FIRASANS,
        fontSize: 11,
        color: TEXT_LIGHT,
        textAlign: "center",
        marginTop: 8,
        lineHeight: 16,
    },
});
