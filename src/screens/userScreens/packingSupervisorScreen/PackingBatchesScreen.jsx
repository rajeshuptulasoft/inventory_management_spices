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
import FinanceHeader from "../../../components/commonComponents/FinanceHeader";
import { useFinanceNavigation } from "../../../navigations/AdminNavigationContext";
import {
    buildUrl,
    GETNETWORK,
    POSTNETWORK,
    PUTNETWORK,
    extractApiList,
    getApiMessage,
    isApiSuccess,
    logScreenApi,
} from "../../../utils/Network";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR, WHITE } from "../../../constant/color";

const mapBatchCard = (row) => ({
    id: String(row.id),
    batchNumber: row.batch_number || `BATCH-${row.id}`,
    product: `${row.variant?.product?.product_name || ""} - ${row.variant?.size || ""}`.trim(),
    mfgDate: row.manufacturing_date || "—",
    expiry: row.expiry_date || "—",
    qty: String(row.quantity ?? 0),
    variantId: String(row.variant_id ?? ""),
});

const PackingBatchesScreen = () => {
    const navigation = useFinanceNavigation();
    const [batches, setBatches] = useState([]);
    const [variants, setVariants] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        variantId: "",
        batchNumber: "",
        mfgDate: "",
        expiryDate: "",
        quantity: "",
    });

    const loadData = useCallback(async () => {
        const [batchRes, productRes] = await Promise.all([
            GETNETWORK(buildUrl("batches", "expiring=true"), true),
            GETNETWORK(buildUrl("products", "limit=100"), true),
        ]);
        logScreenApi("PackingBatchesScreen", "batches", batchRes, buildUrl("batches", "expiring=true"));
        logScreenApi("PackingBatchesScreen", "products", productRes, buildUrl("products", "limit=100"));
        if (isApiSuccess(batchRes)) {
            setBatches(extractApiList(batchRes).map(mapBatchCard));
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
        if (!q) return batches;
        return batches.filter(
            (b) =>
                b.batchNumber.toLowerCase().includes(q) ||
                b.product.toLowerCase().includes(q)
        );
    }, [batches, search]);

    const openAdd = () => {
        setEditing(null);
        setForm({ variantId: "", batchNumber: "", mfgDate: "", expiryDate: "", quantity: "" });
        setModalVisible(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setForm({
            variantId: item.variantId,
            batchNumber: item.batchNumber,
            mfgDate: item.mfgDate === "—" ? "" : item.mfgDate,
            expiryDate: item.expiry === "—" ? "" : item.expiry,
            quantity: item.qty,
        });
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!form.variantId || !form.batchNumber || !form.quantity) {
            Alert.alert("Required", "Variant, batch number and quantity are required.");
            return;
        }
        const payload = {
            variant_id: Number(form.variantId),
            batch_number: form.batchNumber.trim(),
            manufacturing_date: form.mfgDate || null,
            expiry_date: form.expiryDate || null,
            quantity: Number(form.quantity),
        };
        const res = editing
            ? await PUTNETWORK(buildUrl(`batches/${editing.id}`), payload, true)
            : await POSTNETWORK(buildUrl("batches"), payload, true);
        logScreenApi(
            "PackingBatchesScreen",
            editing ? "batches/update" : "batches/create",
            res,
            buildUrl(editing ? `batches/${editing.id}` : "batches")
        );
        if (!isApiSuccess(res)) {
            Alert.alert("Error", getApiMessage(res));
            return;
        }
        setModalVisible(false);
        loadData();
    };

    return (
        <View style={styles.root}>
            <FinanceHeader title="Batches" profileInitial="P" onProfilePress={navigation.openDrawer} />
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
                                <Text style={styles.pageTitle}>Batch Management</Text>
                                <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
                                    <Text style={styles.addBtnText}>+ Add</Text>
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
                        <TouchableOpacity style={styles.card} onPress={() => openEdit(item)}>
                            <Text style={styles.title}>{item.batchNumber}</Text>
                            <Text style={styles.meta}>{item.product || "—"}</Text>
                            <Text style={styles.meta}>
                                Mfg: {item.mfgDate} • Exp: {item.expiry}
                            </Text>
                            <Text style={styles.qty}>Qty: {item.qty}</Text>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No batches found</Text>}
                />
            </SafeAreaView>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <ScrollView>
                            <Text style={styles.modalTitle}>{editing ? "Edit Batch" : "New Batch"}</Text>
                            <Text style={styles.label}>Variant ID</Text>
                            <TextInput
                                style={styles.input}
                                value={form.variantId}
                                onChangeText={(v) => setForm((f) => ({ ...f, variantId: v }))}
                                keyboardType="numeric"
                                editable={!editing}
                            />
                            {variants.slice(0, 5).map((v) => (
                                <TouchableOpacity key={v.id} onPress={() => setForm((f) => ({ ...f, variantId: v.id }))}>
                                    <Text style={styles.hint}>{v.label}</Text>
                                </TouchableOpacity>
                            ))}
                            <Text style={styles.label}>Batch Number</Text>
                            <TextInput
                                style={styles.input}
                                value={form.batchNumber}
                                onChangeText={(v) => setForm((f) => ({ ...f, batchNumber: v }))}
                            />
                            <Text style={styles.label}>Mfg Date (YYYY-MM-DD)</Text>
                            <TextInput
                                style={styles.input}
                                value={form.mfgDate}
                                onChangeText={(v) => setForm((f) => ({ ...f, mfgDate: v }))}
                            />
                            <Text style={styles.label}>Expiry Date</Text>
                            <TextInput
                                style={styles.input}
                                value={form.expiryDate}
                                onChangeText={(v) => setForm((f) => ({ ...f, expiryDate: v }))}
                            />
                            <Text style={styles.label}>Quantity</Text>
                            <TextInput
                                style={styles.input}
                                value={form.quantity}
                                onChangeText={(v) => setForm((f) => ({ ...f, quantity: v }))}
                                keyboardType="numeric"
                            />
                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
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

export default PackingBatchesScreen;

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
    qty: { fontFamily: FIRASANSSEMIBOLD, fontSize: 13, color: "#111827", marginTop: 6 },
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
