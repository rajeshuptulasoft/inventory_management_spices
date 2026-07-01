import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FinanceHeader from "../../../components/commonComponents/FinanceHeader";
import { useFinanceNavigation } from "../../../navigations/AdminNavigationContext";
import { buildUrl, GETNETWORK, extractApiList, isApiSuccess, logScreenApi } from "../../../utils/Network";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR } from "../../../constant/color";

const WholesalerStockScreen = () => {
    const navigation = useFinanceNavigation();
    const [rows, setRows] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        const partiesRes = await GETNETWORK(buildUrl("parties", "limit=100"), true);
        logScreenApi("WholesalerStockScreen", "parties", partiesRes, buildUrl("parties", "limit=100"));

        if (!isApiSuccess(partiesRes)) {
            setRefreshing(false);
            return;
        }

        const parties = extractApiList(partiesRes);
        const stockRows = await Promise.all(
            parties.slice(0, 20).map(async (party, i) => {
                const partyId = party.id ?? i;
                const ledgerRes = await GETNETWORK(buildUrl(`parties/${partyId}/stock-ledger`), true);
                logScreenApi(
                    "WholesalerStockScreen",
                    `parties/${partyId}/stock-ledger`,
                    ledgerRes,
                    buildUrl(`parties/${partyId}/stock-ledger`)
                );

                const ledger = isApiSuccess(ledgerRes) ? extractApiList(ledgerRes) : [];
                const stockQty = ledger.reduce(
                    (sum, entry) => sum + Number(entry.quantity ?? entry.qty ?? entry.balance ?? 0),
                    0
                );

                return {
                    id: String(partyId),
                    party: party.name || party.party_name || "Party",
                    skuCount: String(ledger.length || party.stock_count || party.sku_count || 0),
                    stockQty: String(stockQty || party.stock_qty || party.available_stock || 0),
                    lastUpdated: party.updated_at?.slice?.(0, 10) || "—",
                };
            })
        );

        if (stockRows.length === 0) {
            setRows(
                parties.map((party, i) => ({
                    id: String(party.id ?? i),
                    party: party.name || party.party_name || "Party",
                    skuCount: String(party.stock_count || party.sku_count || 0),
                    stockQty: String(party.stock_qty || party.available_stock || 0),
                    lastUpdated: party.updated_at?.slice?.(0, 10) || "—",
                }))
            );
        } else {
            setRows(stockRows);
        }
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((r) => r.party.toLowerCase().includes(q));
    }, [rows, search]);

    return (
        <View style={styles.root}>
            <FinanceHeader title="Stock" profileInitial="W" onProfilePress={navigation.openDrawer} />
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
                            <Text style={styles.pageTitle}>Stock Ledger</Text>
                            <TextInput
                                style={styles.search}
                                placeholder="Search party..."
                                placeholderTextColor="#9CA3AF"
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.title}>{item.party}</Text>
                            <Text style={styles.meta}>SKUs: {item.skuCount} • Qty: {item.stockQty}</Text>
                            <Text style={styles.meta}>Updated: {item.lastUpdated}</Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No stock records found</Text>}
                />
            </SafeAreaView>
        </View>
    );
};

export default WholesalerStockScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    safeArea: { flex: 1 },
    list: { padding: 16, paddingBottom: 24 },
    pageTitle: { fontFamily: UBUNTUBOLD, fontSize: 22, color: "#111827", marginBottom: 10 },
    search: {
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontFamily: FIRASANS,
        marginBottom: 12,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    title: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: "#111827" },
    meta: { fontFamily: FIRASANS, fontSize: 12, color: "#6B7280", marginTop: 4 },
    empty: { textAlign: "center", color: "#6B7280", fontFamily: FIRASANS, marginTop: 40 },
});
