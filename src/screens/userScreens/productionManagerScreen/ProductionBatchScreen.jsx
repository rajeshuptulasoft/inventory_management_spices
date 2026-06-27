import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MyHeader } from "../../../components/commonComponents/MyHeader";
import { useFinanceNavigation } from "../../../navigations/AdminNavigationContext";
import { buildUrl, GETNETWORK, extractApiList, isApiSuccess } from "../../../utils/Network";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR } from "../../../constant/color";

const ProductionBatchScreen = () => {
    const navigation = useFinanceNavigation();
    const [batches, setBatches] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        const res = await GETNETWORK(buildUrl("batches", "expiring=true"), true);
        if (isApiSuccess(res)) {
            setBatches(extractApiList(res));
        }
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <View style={styles.root}>
            <MyHeader title="Batch Management" onBackPress={navigation.goBack} />
            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={batches}
                    keyExtractor={(item) => String(item.id)}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={[BRANDCOLOR]} />}
                    contentContainerStyle={styles.list}
                    ListHeaderComponent={<Text style={styles.pageTitle}>Batches</Text>}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => Alert.alert("Batch", item.batch_number || `Batch #${item.id}`)}
                        >
                            <Text style={styles.title}>{item.batch_number || `Batch #${item.id}`}</Text>
                            <Text style={styles.meta}>Qty: {item.quantity ?? 0} • Exp: {item.expiry_date || "—"}</Text>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No batches found</Text>}
                />
            </SafeAreaView>
        </View>
    );
};

export default ProductionBatchScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    safeArea: { flex: 1 },
    list: { padding: 16 },
    pageTitle: { fontFamily: UBUNTUBOLD, fontSize: 22, color: "#111827", marginBottom: 12 },
    card: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#E5E7EB" },
    title: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: "#111827" },
    meta: { fontFamily: FIRASANS, fontSize: 12, color: "#6B7280", marginTop: 4 },
    empty: { textAlign: "center", color: "#6B7280", fontFamily: FIRASANS, marginTop: 40 },
});
