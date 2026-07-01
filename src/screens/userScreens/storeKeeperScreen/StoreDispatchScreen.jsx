import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MyHeader } from "../../../components/commonComponents/MyHeader";
import { useFinanceNavigation } from "../../../navigations/AdminNavigationContext";
import {
    buildUrl,
    GETNETWORK,
    POSTNETWORK,
    extractApiList,
    getApiMessage,
    isApiSuccess,
    mapSalesOrderRow,
    logScreenApi,
} from "../../../utils/Network";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR, WHITE } from "../../../constant/color";

const mapOrderCard = (row) => {
    const base = mapSalesOrderRow(row);
    return {
        id: base.id,
        orderId: base.orderId,
        distributor: row.distributor?.name || row.distributor_name || "—",
        amount: base.amount,
        status: base.status,
        date: base.date,
        items: base.items,
    };
};

const StoreDispatchScreen = () => {
    const navigation = useFinanceNavigation();
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        const res = await GETNETWORK(buildUrl("fmcg/sales-orders", "limit=100"), true);
        logScreenApi("StoreDispatchScreen", "fmcg/sales-orders", res, buildUrl("fmcg/sales-orders", "limit=100"));
        if (isApiSuccess(res)) {
            setOrders(extractApiList(res).map(mapOrderCard));
        }
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return orders;
        return orders.filter(
            (o) =>
                o.orderId.toLowerCase().includes(q) ||
                o.distributor.toLowerCase().includes(q) ||
                o.status.toLowerCase().includes(q)
        );
    }, [orders, search]);

    const runAction = async (id, action) => {
        const endpoint = `fmcg/sales-orders/${id}/${action}`;
        const res = await POSTNETWORK(buildUrl(endpoint), {}, true);
        logScreenApi("StoreDispatchScreen", endpoint, res, buildUrl(endpoint));
        if (!isApiSuccess(res)) {
            Alert.alert("Error", getApiMessage(res));
            return;
        }
        Alert.alert("Success", `Order ${action} successful`);
        loadData();
    };

    const confirmDeliver = (item) => {
        Alert.alert("Deliver Order", `Mark order ${item.orderId} as delivered?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Deliver", onPress: () => runAction(item.id, "deliver") },
        ]);
    };

    const confirmApprove = (item) => {
        Alert.alert("Approve Order", `Approve order ${item.orderId}?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Approve", onPress: () => runAction(item.id, "approve") },
        ]);
    };

    return (
        <View style={styles.root}>
            <MyHeader title="Dispatch Orders" onBackPress={navigation.goBack} />
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
                            <Text style={styles.pageTitle}>Sales Orders</Text>
                            <TextInput
                                style={styles.search}
                                placeholder="Search order, distributor..."
                                placeholderTextColor="#9CA3AF"
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.title}>{item.orderId}</Text>
                            <Text style={styles.meta}>{item.distributor}</Text>
                            <Text style={styles.meta}>
                                {item.date} • {item.items} items • {item.amount}
                            </Text>
                            <Text style={styles.status}>{item.status}</Text>
                            <View style={styles.actions}>
                                {item.status.toLowerCase() === "pending" ? (
                                    <TouchableOpacity style={styles.approveBtn} onPress={() => confirmApprove(item)}>
                                        <Text style={styles.btnText}>Approve</Text>
                                    </TouchableOpacity>
                                ) : null}
                                {["approved", "dispatched", "pending"].includes(item.status.toLowerCase()) ? (
                                    <TouchableOpacity style={styles.deliverBtn} onPress={() => confirmDeliver(item)}>
                                        <Text style={styles.btnText}>Deliver</Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No orders found</Text>}
                />
            </SafeAreaView>
        </View>
    );
};

export default StoreDispatchScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    safeArea: { flex: 1 },
    list: { padding: 16, paddingBottom: 24 },
    pageTitle: { fontFamily: UBUNTUBOLD, fontSize: 22, color: "#111827", marginBottom: 10 },
    search: {
        backgroundColor: WHITE,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontFamily: FIRASANS,
        marginBottom: 12,
    },
    card: {
        backgroundColor: WHITE,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    title: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: "#111827" },
    meta: { fontFamily: FIRASANS, fontSize: 12, color: "#6B7280", marginTop: 4 },
    status: { fontFamily: FIRASANSSEMIBOLD, fontSize: 12, color: BRANDCOLOR, marginTop: 6, textTransform: "capitalize" },
    actions: { flexDirection: "row", gap: 8, marginTop: 10 },
    approveBtn: { backgroundColor: "#2563EB", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    deliverBtn: { backgroundColor: BRANDCOLOR, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    btnText: { color: WHITE, fontFamily: FIRASANSSEMIBOLD, fontSize: 12 },
    empty: { textAlign: "center", color: "#6B7280", fontFamily: FIRASANS, marginTop: 40 },
});
