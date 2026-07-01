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
    Modal,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MyHeader } from "../../../components/commonComponents/MyHeader";
import { useFinanceNavigation } from "../../../navigations/AdminNavigationContext";
import {
    buildUrl,
    GETNETWORK,
    POSTNETWORK,
    extractApiList,
    capitalizeStatus,
    getApiMessage,
    isApiSuccess,
    logScreenApi,
} from "../../../utils/Network";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR, WHITE } from "../../../constant/color";

const mapRunCard = (row) => ({
    id: String(row.id),
    batch: row.batch_code || row.batch_number || `RUN-${row.id}`,
    product: `${row.variant?.product?.product_name || ""} - ${row.variant?.size || ""}`.trim(),
    planned: String(row.planned_qty ?? 0),
    produced: String(row.produced_qty ?? 0),
    wastage: String(row.wastage_qty ?? 0),
    operator: row.operator_name || "—",
    status: capitalizeStatus(row.status),
});

const PackingProductionRunsScreen = () => {
    const navigation = useFinanceNavigation();
    const [runs, setRuns] = useState([]);
    const [variants, setVariants] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [form, setForm] = useState({
        variantId: "",
        plannedQty: "",
        producedQty: "",
        wastageQty: "0",
        operatorName: "Packing Supervisor",
    });

    const loadData = useCallback(async () => {
        const [runRes, productRes] = await Promise.all([
            GETNETWORK(buildUrl("production"), true),
            GETNETWORK(buildUrl("products", "limit=100"), true),
        ]);
        logScreenApi("PackingProductionRunsScreen", "production", runRes, buildUrl("production"));
        logScreenApi("PackingProductionRunsScreen", "products", productRes, buildUrl("products", "limit=100"));
        if (isApiSuccess(runRes)) {
            setRuns(extractApiList(runRes).map(mapRunCard));
        }
        if (isApiSuccess(productRes)) {
            setVariants(
                extractApiList(productRes).flatMap((p) =>
                    (p.variants || []).map((v) => ({
                        id: String(v.id),
                        label: `${p.product_name} - ${v.size}`,
                    }))
                )
            );
        }
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return runs;
        return runs.filter(
            (r) =>
                r.batch.toLowerCase().includes(q) ||
                r.product.toLowerCase().includes(q) ||
                r.status.toLowerCase().includes(q)
        );
    }, [runs, search]);

    const handleCreate = async () => {
        if (!form.variantId || !form.plannedQty) {
            Alert.alert("Required", "Variant and planned quantity are required.");
            return;
        }
        const payload = {
            variant_id: Number(form.variantId),
            planned_qty: Number(form.plannedQty),
            produced_qty: Number(form.producedQty || form.plannedQty),
            wastage_qty: Number(form.wastageQty || 0),
            operator_name: form.operatorName || "Packing Supervisor",
        };
        const res = await POSTNETWORK(buildUrl("production"), payload, true);
        logScreenApi("PackingProductionRunsScreen", "production/create", res, buildUrl("production"));
        if (!isApiSuccess(res)) {
            Alert.alert("Error", getApiMessage(res));
            return;
        }
        Alert.alert("Success", "Production run recorded — finished goods added to stock");
        setModalVisible(false);
        loadData();
    };

    return (
        <View style={styles.root}>
            <MyHeader title="Production Runs" onBackPress={navigation.goBack} />
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
                            <View style={styles.headerRow}>
                                <Text style={styles.pageTitle}>Packing Runs</Text>
                                <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                                    <Text style={styles.addBtnText}>+ New</Text>
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.search}
                                placeholder="Search batch or product..."
                                placeholderTextColor="#9CA3AF"
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.title}>{item.batch}</Text>
                            <Text style={styles.meta}>{item.product || "—"}</Text>
                            <Text style={styles.meta}>
                                Planned: {item.planned} • Produced: {item.produced} • Wastage: {item.wastage}
                            </Text>
                            <Text style={styles.meta}>Operator: {item.operator}</Text>
                            <Text style={styles.status}>{item.status}</Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No production runs</Text>}
                />
            </SafeAreaView>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <ScrollView>
                            <Text style={styles.modalTitle}>New Production Run</Text>
                            <Text style={styles.label}>Variant ID</Text>
                            <TextInput
                                style={styles.input}
                                value={form.variantId}
                                onChangeText={(v) => setForm((f) => ({ ...f, variantId: v }))}
                                keyboardType="numeric"
                            />
                            {variants.slice(0, 5).map((v) => (
                                <TouchableOpacity key={v.id} onPress={() => setForm((f) => ({ ...f, variantId: v.id }))}>
                                    <Text style={styles.hint}>{v.label}</Text>
                                </TouchableOpacity>
                            ))}
                            <Text style={styles.label}>Planned Qty</Text>
                            <TextInput
                                style={styles.input}
                                value={form.plannedQty}
                                onChangeText={(v) => setForm((f) => ({ ...f, plannedQty: v }))}
                                keyboardType="numeric"
                            />
                            <Text style={styles.label}>Produced Qty</Text>
                            <TextInput
                                style={styles.input}
                                value={form.producedQty}
                                onChangeText={(v) => setForm((f) => ({ ...f, producedQty: v }))}
                                keyboardType="numeric"
                            />
                            <Text style={styles.label}>Wastage</Text>
                            <TextInput
                                style={styles.input}
                                value={form.wastageQty}
                                onChangeText={(v) => setForm((f) => ({ ...f, wastageQty: v }))}
                                keyboardType="numeric"
                            />
                            <Text style={styles.label}>Operator</Text>
                            <TextInput
                                style={styles.input}
                                value={form.operatorName}
                                onChangeText={(v) => setForm((f) => ({ ...f, operatorName: v }))}
                            />
                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleCreate}>
                                    <Text style={styles.saveText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default PackingProductionRunsScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    safeArea: { flex: 1 },
    list: { padding: 16, paddingBottom: 24 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    pageTitle: { fontFamily: UBUNTUBOLD, fontSize: 22, color: "#111827" },
    addBtn: { backgroundColor: BRANDCOLOR, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    addBtnText: { color: WHITE, fontFamily: FIRASANSSEMIBOLD, fontSize: 13 },
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
    status: { fontFamily: FIRASANSSEMIBOLD, fontSize: 12, color: BRANDCOLOR, marginTop: 6 },
    empty: { textAlign: "center", color: "#6B7280", fontFamily: FIRASANS, marginTop: 40 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
    modalCard: { backgroundColor: WHITE, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, maxHeight: "85%" },
    modalTitle: { fontFamily: UBUNTUBOLD, fontSize: 18, color: "#111827", marginBottom: 12 },
    label: { fontFamily: FIRASANSSEMIBOLD, fontSize: 12, color: "#6B7280", marginBottom: 6, marginTop: 8 },
    input: {
        backgroundColor: "#F9FAFB",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 12,
        fontFamily: FIRASANS,
    },
    hint: { fontFamily: FIRASANS, fontSize: 11, color: "#2563EB", marginTop: 4 },
    modalActions: { flexDirection: "row", gap: 10, marginTop: 16, marginBottom: 8 },
    cancelBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center" },
    cancelText: { fontFamily: FIRASANSSEMIBOLD, color: "#6B7280" },
    saveBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: BRANDCOLOR, alignItems: "center" },
    saveText: { fontFamily: FIRASANSSEMIBOLD, color: WHITE },
});
