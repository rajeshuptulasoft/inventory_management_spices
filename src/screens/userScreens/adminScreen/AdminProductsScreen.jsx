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
    capitalizeStatus,
    logScreenApi,
} from "../../../utils/Network";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR } from "../../../constant/color";

const mapProductRow = (row) => ({
    id: String(row.id),
    sku: row.sku || row.product_code || `SKU-${row.id}`,
    name: row.product_name || row.name || "",
    category: row.category?.name || row.category_name || "Uncategorized",
    status: capitalizeStatus(row.status || "active"),
    variants: String(row.variants?.length ?? 0),
});

const ProductCard = ({ item }) => (
    <View style={styles.card}>
        <View style={styles.cardTop}>
            <View style={styles.cardInfo}>
                <Text style={styles.fieldLabel}>SKU</Text>
                <Text style={styles.skuText}>{item.sku}</Text>
                <Text style={[styles.fieldLabel, styles.fieldGap]}>PRODUCT</Text>
                <Text style={styles.productName}>{item.name}</Text>
            </View>
            <View style={[styles.statusBadge, item.status === "Inactive" && styles.statusInactive]}>
                <Text style={[styles.statusText, item.status === "Inactive" && styles.statusTextInactive]}>
                    {item.status}
                </Text>
            </View>
        </View>
        <View style={styles.metaRow}>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>CATEGORY</Text>
                <Text style={styles.metaValue}>{item.category}</Text>
            </View>
            <View style={styles.metaCol}>
                <Text style={styles.fieldLabel}>VARIANTS</Text>
                <Text style={styles.variantsValue}>{item.variants}</Text>
            </View>
        </View>
    </View>
);

const AdminProductsScreen = () => {
    const navigation = useFinanceNavigation();
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        const res = await GETNETWORK(buildUrl("products", "limit=100"), true);
        logScreenApi("AdminProductsScreen", "products", res, buildUrl("products", "limit=100"));
        if (isApiSuccess(res)) {
            setProducts(extractApiList(res).map(mapProductRow));
        }
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return products;
        return products.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.sku.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q) ||
                p.status.toLowerCase().includes(q)
        );
    }, [products, search]);

    return (
        <View style={styles.root}>
            <FinanceHeader title="Products" profileInitial="A" onProfilePress={navigation.openDrawer} />
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
                            <Text style={styles.pageTitle}>Product Catalog</Text>
                            <Text style={styles.pageSubtitle}>{products.length} products loaded</Text>
                            <TextInput
                                style={styles.search}
                                placeholder="Search product, SKU, category..."
                                placeholderTextColor="#9CA3AF"
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>
                    }
                    renderItem={({ item }) => <ProductCard item={item} />}
                    ListEmptyComponent={<Text style={styles.empty}>No products found</Text>}
                />
            </SafeAreaView>
        </View>
    );
};

export default AdminProductsScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    safeArea: { flex: 1 },
    list: { padding: 16, paddingBottom: 24 },
    pageTitle: { fontFamily: UBUNTUBOLD, fontSize: 22, color: "#111827", marginBottom: 4 },
    pageSubtitle: { fontFamily: FIRASANS, fontSize: 13, color: "#6B7280", marginBottom: 10 },
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
    cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    cardInfo: { flex: 1, paddingRight: 8 },
    fieldLabel: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 9,
        color: "#6B7280",
        letterSpacing: 0.4,
        marginBottom: 4,
    },
    fieldGap: { marginTop: 8 },
    skuText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 13, color: "#2563EB" },
    productName: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: "#111827" },
    statusBadge: {
        backgroundColor: "#ECFDF5",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusInactive: { backgroundColor: "#F3F4F6" },
    statusText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 11, color: "#16A34A" },
    statusTextInactive: { color: "#6B7280" },
    metaRow: { flexDirection: "row", gap: 12, marginTop: 12 },
    metaCol: { flex: 1 },
    metaValue: { fontFamily: FIRASANS, fontSize: 13, color: "#111827" },
    variantsValue: { fontFamily: FIRASANSSEMIBOLD, fontSize: 13, color: BRANDCOLOR },
    empty: { textAlign: "center", color: "#6B7280", fontFamily: FIRASANS, marginTop: 40 },
});
