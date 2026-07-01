import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FinanceHeader from "../../../components/commonComponents/FinanceHeader";
import { useFinanceNavigation } from "../../../navigations/AdminNavigationContext";
import {
    buildUrl,
    GETNETWORK,
    extractApiList,
    isApiSuccess,
    logScreenApi,
} from "../../../utils/Network";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR } from "../../../constant/color";

const PackingInventoryScreen = () => {
    const navigation = useFinanceNavigation();
    const [rows, setRows] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        const res = await GETNETWORK(buildUrl("products", "limit=100"), true);
        logScreenApi("PackingInventoryScreen", "products", res, buildUrl("products", "limit=100"));
        if (isApiSuccess(res)) {
            const list = extractApiList(res).flatMap((p) =>
                (p.variants || []).map((v) => ({
                    id: String(v.id),
                    product: p.product_name || "",
                    size: v.size || "",
                    sku: v.sku || "",
                    stock: v.current_stock ?? 0,
                    min: v.minimum_stock ?? 0,
                    rack: v.rack?.rack_name || "—",
                    low: Number(v.current_stock ?? 0) <= Number(v.minimum_stock ?? 0),
                }))
            );
            setRows(list);
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
                r.product.toLowerCase().includes(q) ||
                r.sku.toLowerCase().includes(q) ||
                r.size.toLowerCase().includes(q)
        );
    }, [rows, search]);

    return (
        <View style={styles.root}>
            <FinanceHeader
                title="Inventory"
                profileInitial="S"
                onProfilePress={navigation.openDrawer}
            />
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
                            <Text style={styles.pageTitle}>Stock on Hand</Text>
                            <TextInput
                                style={styles.search}
                                placeholder="Search product, SKU..."
                                placeholderTextColor="#9CA3AF"
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.title}>
                                {item.product} — {item.size}
                            </Text>
                            <Text style={styles.meta}>SKU: {item.sku || "—"} • Rack: {item.rack}</Text>
                            <Text style={styles.meta}>Min stock: {item.min}</Text>
                            <Text style={[styles.stock, item.low && styles.stockLow]}>
                                Stock: {item.stock}
                            </Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No inventory items</Text>}
                />
            </SafeAreaView>
        </View>
    );
};

export default PackingInventoryScreen;

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
        fontSize: 14,
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
    stock: { fontFamily: FIRASANSSEMIBOLD, fontSize: 13, color: "#111827", marginTop: 6 },
    stockLow: { color: "#DC2626" },
    empty: { textAlign: "center", color: "#6B7280", fontFamily: FIRASANS, marginTop: 40 },
});
