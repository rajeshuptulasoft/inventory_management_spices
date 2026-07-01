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
import { MyHeader } from "../../../components/commonComponents/MyHeader";
import { useFinanceNavigation } from "../../../navigations/AdminNavigationContext";
import {
    buildUrl,
    GETNETWORK,
    extractApiList,
    fmtInr,
    isApiSuccess,
    logScreenApi,
} from "../../../utils/Network";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR } from "../../../constant/color";

const mapMaterialCard = (row) => ({
    id: String(row.id),
    code: row.sku || row.code || `RM-${row.id}`,
    name: row.name || "",
    category: (row.category || "raw").toString(),
    stock: String(row.current_stock ?? 0),
    unit: row.unit?.symbol || row.unit || "",
    min: String(row.minimum_stock ?? 0),
    price: fmtInr(row.cost_per_unit),
    low: Number(row.current_stock ?? 0) <= Number(row.minimum_stock ?? 0),
});

const PackingPackagingMaterialsScreen = () => {
    const navigation = useFinanceNavigation();
    const [materials, setMaterials] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        const res = await GETNETWORK(buildUrl("raw-materials"), true);
        logScreenApi("PackingPackagingMaterialsScreen", "raw-materials", res, buildUrl("raw-materials"));
        if (isApiSuccess(res)) {
            const list = extractApiList(res).map(mapMaterialCard);
            const packaging = list.filter((m) => m.category.toLowerCase().includes("pack"));
            setMaterials(packaging.length ? packaging : list);
        }
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return materials;
        return materials.filter(
            (m) =>
                m.name.toLowerCase().includes(q) ||
                m.code.toLowerCase().includes(q) ||
                m.category.toLowerCase().includes(q)
        );
    }, [materials, search]);

    return (
        <View style={styles.root}>
            <MyHeader title="Packaging Materials" onBackPress={navigation.goBack} />
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
                            <Text style={styles.pageTitle}>Raw & Packaging Stock</Text>
                            <TextInput
                                style={styles.search}
                                placeholder="Search material..."
                                placeholderTextColor="#9CA3AF"
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.title}>{item.name}</Text>
                            <Text style={styles.meta}>Code: {item.code} • Category: {item.category}</Text>
                            <Text style={styles.meta}>Price: {item.price} • Min: {item.min}</Text>
                            <Text style={[styles.stock, item.low && styles.stockLow]}>
                                Stock: {item.stock} {item.unit}
                            </Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No materials found</Text>}
                />
            </SafeAreaView>
        </View>
    );
};

export default PackingPackagingMaterialsScreen;

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
    stock: { fontFamily: FIRASANSSEMIBOLD, fontSize: 13, color: "#111827", marginTop: 6 },
    stockLow: { color: "#DC2626" },
    empty: { textAlign: "center", color: "#6B7280", fontFamily: FIRASANS, marginTop: 40 },
});
