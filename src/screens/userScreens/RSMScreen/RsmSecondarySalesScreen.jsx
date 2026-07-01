import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MyHeader } from "../../../components/commonComponents/MyHeader";
import { useFinanceNavigation } from "../../../navigations/AdminNavigationContext";
import { buildUrl, GETNETWORK, extractApiList, fmtInr, isApiSuccess, logScreenApi } from "../../../utils/Network";
import { FIRASANS, FIRASANSSEMIBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR } from "../../../constant/color";

const RsmSecondarySalesScreen = () => {
    const navigation = useFinanceNavigation();
    const [rows, setRows] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        const res = await GETNETWORK(buildUrl("orders", "limit=100"), true);
        logScreenApi("RsmSecondarySalesScreen", "orders", res, buildUrl("orders", "limit=100"));
        if (isApiSuccess(res)) {
            setRows(
                extractApiList(res).map((row, i) => ({
                    id: String(row.id ?? i),
                    party: row.party_name || row.distributor?.name || row.dealer_name || "—",
                    invoice: row.invoice_number || row.order_number || `SS-${row.id ?? i}`,
                    amount: fmtInr(row.amount ?? row.total_amount),
                    date: row.sale_date || row.created_at?.slice?.(0, 10) || "—",
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
        return rows.filter((r) => r.party.toLowerCase().includes(q) || r.invoice.toLowerCase().includes(q));
    }, [rows, search]);

    return (
        <View style={styles.root}>
            <MyHeader title="Secondary Sales" onBackPress={navigation.goBack} />
            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={[BRANDCOLOR]} />}
                    contentContainerStyle={styles.list}
                    ListHeaderComponent={<TextInput style={styles.search} placeholder="Search..." placeholderTextColor="#9CA3AF" value={search} onChangeText={setSearch} />}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.title}>{item.invoice}</Text>
                            <Text style={styles.meta}>{item.party}</Text>
                            <Text style={styles.meta}>{item.date} • {item.amount}</Text>
                            <Text style={styles.status}>{item.status}</Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No secondary sales</Text>}
                />
            </SafeAreaView>
        </View>
    );
};

export default RsmSecondarySalesScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    safeArea: { flex: 1 },
    list: { padding: 16, paddingBottom: 24 },
    search: { backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", padding: 12, fontFamily: FIRASANS, marginBottom: 12 },
    card: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#E5E7EB" },
    title: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: "#111827" },
    meta: { fontFamily: FIRASANS, fontSize: 12, color: "#6B7280", marginTop: 4 },
    status: { fontFamily: FIRASANSSEMIBOLD, fontSize: 12, color: BRANDCOLOR, marginTop: 6 },
    empty: { textAlign: "center", color: "#6B7280", fontFamily: FIRASANS, marginTop: 40 },
});
