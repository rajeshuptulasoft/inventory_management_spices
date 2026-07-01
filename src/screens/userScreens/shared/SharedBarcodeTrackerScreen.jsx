import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    RefreshControl,
    BackHandler,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MyHeader } from "../../../components/commonComponents/MyHeader";
import { useFinanceNavigation } from "../../../navigations/AdminNavigationContext";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR } from "../../../constant/color";
import {
    buildUrl,
    GETNETWORK,
    extractApiList,
    fmtInr,
    isApiSuccess,
    logScreenApi,
} from "../../../utils/Network";

const mapVariantRow = (row, index) => ({
    id: String(row.id ?? index),
    sku: row.sku || row.product_code || `SKU-${row.id ?? index}`,
    barcode: row.barcode || row.ean || "—",
    product: row.product?.name || row.product_name || row.name || "—",
    size: row.size || row.pack_size || "—",
    mrp: fmtInr(row.mrp),
    price: fmtInr(row.selling_price ?? row.price),
    status: (row.status || "active").toString(),
});

const SharedBarcodeTrackerScreen = ({ screenName = "SharedBarcodeTrackerScreen" }) => {
    const navigation = useFinanceNavigation();
    const [rows, setRows] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        const res = await GETNETWORK(buildUrl("variants", "limit=200"), true);
        logScreenApi(screenName, "variants", res, buildUrl("variants", "limit=200"));
        if (isApiSuccess(res)) {
            setRows(extractApiList(res).map(mapVariantRow));
        }
        setRefreshing(false);
    }, [screenName]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (Platform.OS !== "android") return undefined;
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            navigation.goBack();
            return true;
        });
        return () => sub.remove();
    }, [navigation]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter(
            (r) =>
                r.sku.toLowerCase().includes(q) ||
                r.barcode.toLowerCase().includes(q) ||
                r.product.toLowerCase().includes(q)
        );
    }, [rows, search]);

    return (
        <View style={styles.root}>
            <MyHeader title="Barcode Tracker" onBackPress={navigation.goBack} />
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
                            <Text style={styles.pageTitle}>Barcode Tracker</Text>
                            <TextInput
                                style={styles.search}
                                placeholder="Search SKU, barcode, product..."
                                placeholderTextColor="#9CA3AF"
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.title}>{item.product}</Text>
                            <Text style={styles.meta}>SKU: {item.sku} • Size: {item.size}</Text>
                            <Text style={styles.barcode}>Barcode: {item.barcode}</Text>
                            <Text style={styles.meta}>MRP: {item.mrp} • Price: {item.price}</Text>
                            <Text style={styles.status}>{item.status}</Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No barcodes found</Text>}
                />
            </SafeAreaView>
        </View>
    );
};

export default SharedBarcodeTrackerScreen;

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
        padding: 12,
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
    barcode: { fontFamily: FIRASANSSEMIBOLD, fontSize: 13, color: "#2563EB", marginTop: 6 },
    status: { fontFamily: FIRASANSSEMIBOLD, fontSize: 12, color: BRANDCOLOR, marginTop: 6, textTransform: "capitalize" },
    empty: { textAlign: "center", color: "#6B7280", fontFamily: FIRASANS, marginTop: 40 },
});
