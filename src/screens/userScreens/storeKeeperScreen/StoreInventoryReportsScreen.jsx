import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MyHeader } from "../../../components/commonComponents/MyHeader";
import { useFinanceNavigation } from "../../../navigations/AdminNavigationContext";
import {
    buildUrl,
    GETNETWORK,
    extractApiData,
    isApiSuccess,
    logScreenApi,
} from "../../../utils/Network";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR } from "../../../constant/color";

const ReportSection = ({ title, color, data, renderItem }) => (
    <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
        {data.length === 0 ? (
            <Text style={styles.emptySection}>No records</Text>
        ) : (
            data.map((item) => (
                <View key={item.id} style={styles.card}>
                    {renderItem(item)}
                </View>
            ))
        )}
    </View>
);

const StoreInventoryReportsScreen = () => {
    const navigation = useFinanceNavigation();
    const [lowStock, setLowStock] = useState([]);
    const [expiring, setExpiring] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        const res = await GETNETWORK(buildUrl("inventory/reports"), true);
        logScreenApi("StoreInventoryReportsScreen", "inventory/reports", res, buildUrl("inventory/reports"));
        if (isApiSuccess(res)) {
            const data = extractApiData(res) || {};
            setLowStock(
                (data.lowStock || []).map((row, i) => ({
                    id: String(row.id ?? i),
                    product: `${row.product?.product_name || row.product_name || ""} - ${row.size || ""}`,
                    sku: row.sku || "—",
                    stock: row.current_stock ?? 0,
                    min: row.minimum_stock ?? 0,
                }))
            );
            setExpiring(
                (data.expiringSoon || []).map((row, i) => ({
                    id: String(row.id ?? i),
                    batch: row.batch_number || `B-${row.id}`,
                    product: `${row.variant?.product?.product_name || ""} - ${row.variant?.size || ""}`,
                    expiry: row.expiry_date || "—",
                    qty: row.quantity ?? 0,
                }))
            );
        }
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <View style={styles.root}>
            <MyHeader title="Inventory Reports" onBackPress={navigation.goBack} />
            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={[{ key: "reports" }]}
                    keyExtractor={(item) => item.key}
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
                    renderItem={() => (
                        <>
                            <ReportSection
                                title="Low Stock Alerts"
                                color="#DC2626"
                                data={lowStock}
                                renderItem={(item) => (
                                    <>
                                        <Text style={styles.title}>{item.product}</Text>
                                        <Text style={styles.meta}>SKU: {item.sku}</Text>
                                        <Text style={styles.alert}>
                                            Stock {item.stock} / Min {item.min}
                                        </Text>
                                    </>
                                )}
                            />
                            <ReportSection
                                title="Expiry Alerts (30 days)"
                                color="#D97706"
                                data={expiring}
                                renderItem={(item) => (
                                    <>
                                        <Text style={styles.title}>{item.batch}</Text>
                                        <Text style={styles.meta}>{item.product}</Text>
                                        <Text style={styles.meta}>
                                            Expiry: {item.expiry} • Qty: {item.qty}
                                        </Text>
                                    </>
                                )}
                            />
                        </>
                    )}
                />
            </SafeAreaView>
        </View>
    );
};

export default StoreInventoryReportsScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    safeArea: { flex: 1 },
    list: { padding: 16, paddingBottom: 24 },
    section: { marginBottom: 20 },
    sectionTitle: { fontFamily: UBUNTUBOLD, fontSize: 16, marginBottom: 10 },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    title: { fontFamily: FIRASANSSEMIBOLD, fontSize: 14, color: "#111827" },
    meta: { fontFamily: FIRASANS, fontSize: 12, color: "#6B7280", marginTop: 4 },
    alert: { fontFamily: FIRASANSSEMIBOLD, fontSize: 12, color: "#DC2626", marginTop: 6 },
    emptySection: { fontFamily: FIRASANS, color: "#6B7280", marginBottom: 8 },
});
