import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FinanceHeader from "../../../components/commonComponents/FinanceHeader";
import { useFinanceNavigation } from "../../../navigations/AdminNavigationContext";
import { buildUrl, GETNETWORK, extractApiList, fmtInr, isApiSuccess, logScreenApi } from "../../../utils/Network";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR } from "../../../constant/color";

const RetailerCollectionsScreen = () => {
    const navigation = useFinanceNavigation();
    const [rows, setRows] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        const res = await GETNETWORK(buildUrl("collections", "limit=100"), true);
        logScreenApi("RetailerCollectionsScreen", "collections", res, buildUrl("collections", "limit=100"));
        if (isApiSuccess(res)) {
            setRows(
                extractApiList(res).map((row, i) => ({
                    id: String(row.id ?? i),
                    refNo: row.reference_no || row.receipt_no || `COL-${row.id ?? i}`,
                    amount: fmtInr(row.amount ?? row.collection_amount ?? 0),
                    mode: row.payment_mode || row.mode || "—",
                    date: row.collection_date || row.created_at?.slice?.(0, 10) || "—",
                    status: row.status || "—",
                }))
            );
        }
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter(
            (r) =>
                r.refNo.toLowerCase().includes(q) ||
                r.mode.toLowerCase().includes(q) ||
                r.status.toLowerCase().includes(q)
        );
    }, [rows, search]);

    return (
        <View style={styles.root}>
            <FinanceHeader title="Collections" profileInitial="R" onProfilePress={navigation.openDrawer} />
            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                loadData();
                            }}
                            colors={[BRANDCOLOR]}
                        />
                    }
                    contentContainerStyle={styles.list}
                    ListHeaderComponent={
                        <View>
                            <Text style={styles.pageTitle}>Payment Collections</Text>
                            <TextInput
                                style={styles.search}
                                placeholder="Search collection..."
                                placeholderTextColor="#9CA3AF"
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.title}>{item.refNo}</Text>
                            <Text style={styles.meta}>{item.amount} • {item.mode}</Text>
                            <Text style={styles.meta}>{item.date}</Text>
                            <Text style={styles.status}>{item.status}</Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No collections found</Text>}
                />
            </SafeAreaView>
        </View>
    );
};

export default RetailerCollectionsScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    safeArea: { flex: 1 },
    list: { padding: 16, paddingBottom: 24 },
    pageTitle: { fontFamily: UBUNTUBOLD, fontSize: 22, color: "#111827", marginBottom: 10 },
    search: { backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", padding: 12, fontFamily: FIRASANS, marginBottom: 12 },
    card: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#E5E7EB" },
    title: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: "#111827" },
    meta: { fontFamily: FIRASANS, fontSize: 12, color: "#6B7280", marginTop: 4 },
    status: { fontFamily: FIRASANSSEMIBOLD, fontSize: 12, color: BRANDCOLOR, marginTop: 6, textTransform: "capitalize" },
    empty: { textAlign: "center", color: "#6B7280", fontFamily: FIRASANS, marginTop: 40 },
});
