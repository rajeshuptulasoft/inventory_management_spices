import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    RefreshControl,
    TouchableOpacity,
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
    fmtInr,
    getApiMessage,
    isApiSuccess,
    logScreenApi,
} from "../../../utils/Network";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR, WHITE } from "../../../constant/color";

const RsmCollectionsScreen = () => {
    const navigation = useFinanceNavigation();
    const [rows, setRows] = useState([]);
    const [distributors, setDistributors] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [form, setForm] = useState({ distributorId: "", amount: "", paymentMode: "cash", date: "", notes: "" });

    const loadData = useCallback(async () => {
        const [cRes, dRes] = await Promise.all([
            GETNETWORK(buildUrl("collections"), true),
            GETNETWORK(buildUrl("parties", "limit=200"), true),
        ]);
        logScreenApi("RsmCollectionsScreen", "collections", cRes, buildUrl("collections"));
        logScreenApi("RsmCollectionsScreen", "parties", dRes, buildUrl("parties", "limit=200"));
        if (isApiSuccess(cRes)) {
            setRows(
                extractApiList(cRes).map((row, i) => ({
                    id: String(row.id ?? i),
                    distributor: row.distributor?.name || row.distributor_name || `#${row.distributor_id}`,
                    amount: fmtInr(row.amount),
                    mode: row.payment_mode || "—",
                    date: row.collection_date || row.created_at?.slice?.(0, 10) || "—",
                    status: row.status || "—",
                }))
            );
        }
        if (isApiSuccess(dRes)) {
            setDistributors(extractApiList(dRes).map((d) => ({ id: String(d.id), name: d.name || "" })));
        }
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((r) => r.distributor.toLowerCase().includes(q) || r.status.toLowerCase().includes(q));
    }, [rows, search]);

    const handleSave = async () => {
        if (!form.distributorId || !form.amount) {
            Alert.alert("Required", "Distributor and amount are required.");
            return;
        }
        const payload = {
            distributor_id: Number(form.distributorId),
            amount: Number(form.amount),
            payment_mode: form.paymentMode || "cash",
            collection_date: form.date || new Date().toISOString().slice(0, 10),
            status: "confirmed",
            notes: form.notes || undefined,
        };
        const res = await POSTNETWORK(buildUrl("collections"), payload, true);
        logScreenApi("RsmCollectionsScreen", "collections/create", res, buildUrl("collections"));
        if (!isApiSuccess(res)) {
            Alert.alert("Error", getApiMessage(res));
            return;
        }
        setModalVisible(false);
        loadData();
    };

    return (
        <View style={styles.root}>
            <MyHeader title="Collections" onBackPress={navigation.goBack} />
            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={[BRANDCOLOR]} />}
                    contentContainerStyle={styles.list}
                    ListHeaderComponent={
                        <View>
                            <View style={styles.headerRow}>
                                <Text style={styles.pageTitle}>Collections</Text>
                                <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                                    <Text style={styles.addBtnText}>+ Add</Text>
                                </TouchableOpacity>
                            </View>
                            <TextInput style={styles.search} placeholder="Search..." placeholderTextColor="#9CA3AF" value={search} onChangeText={setSearch} />
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.title}>{item.distributor}</Text>
                            <Text style={styles.meta}>{item.date} • {item.mode}</Text>
                            <Text style={styles.amount}>{item.amount}</Text>
                            <Text style={styles.status}>{item.status}</Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No collections</Text>}
                />
            </SafeAreaView>
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <ScrollView>
                            <Text style={styles.modalTitle}>Record Collection</Text>
                            <Text style={styles.label}>Distributor ID</Text>
                            <TextInput style={styles.input} value={form.distributorId} onChangeText={(v) => setForm((f) => ({ ...f, distributorId: v }))} keyboardType="numeric" />
                            {distributors.slice(0, 5).map((d) => (
                                <TouchableOpacity key={d.id} onPress={() => setForm((f) => ({ ...f, distributorId: d.id }))}>
                                    <Text style={styles.hint}>{d.name}</Text>
                                </TouchableOpacity>
                            ))}
                            <Text style={styles.label}>Amount</Text>
                            <TextInput style={styles.input} value={form.amount} onChangeText={(v) => setForm((f) => ({ ...f, amount: v }))} keyboardType="numeric" />
                            <Text style={styles.label}>Payment Mode</Text>
                            <TextInput style={styles.input} value={form.paymentMode} onChangeText={(v) => setForm((f) => ({ ...f, paymentMode: v }))} />
                            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
                            <TextInput style={styles.input} value={form.date} onChangeText={(v) => setForm((f) => ({ ...f, date: v }))} />
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

export default RsmCollectionsScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    safeArea: { flex: 1 },
    list: { padding: 16, paddingBottom: 24 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    pageTitle: { fontFamily: UBUNTUBOLD, fontSize: 22, color: "#111827" },
    addBtn: { backgroundColor: BRANDCOLOR, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    addBtnText: { color: WHITE, fontFamily: FIRASANSSEMIBOLD, fontSize: 13 },
    search: { backgroundColor: WHITE, borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", padding: 12, fontFamily: FIRASANS, marginBottom: 12 },
    card: { backgroundColor: WHITE, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#E5E7EB" },
    title: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: "#111827" },
    meta: { fontFamily: FIRASANS, fontSize: 12, color: "#6B7280", marginTop: 4 },
    amount: { fontFamily: UBUNTUBOLD, fontSize: 16, color: "#111827", marginTop: 6 },
    status: { fontFamily: FIRASANSSEMIBOLD, fontSize: 12, color: BRANDCOLOR, marginTop: 4, textTransform: "capitalize" },
    empty: { textAlign: "center", color: "#6B7280", fontFamily: FIRASANS, marginTop: 40 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
    modalCard: { backgroundColor: WHITE, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, maxHeight: "80%" },
    modalTitle: { fontFamily: UBUNTUBOLD, fontSize: 18, color: "#111827", marginBottom: 12 },
    label: { fontFamily: FIRASANSSEMIBOLD, fontSize: 12, color: "#6B7280", marginBottom: 6, marginTop: 8 },
    input: { backgroundColor: "#F9FAFB", borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", padding: 12, fontFamily: FIRASANS },
    hint: { fontFamily: FIRASANS, fontSize: 11, color: "#2563EB", marginTop: 4 },
    modalActions: { flexDirection: "row", gap: 10, marginTop: 16, marginBottom: 8 },
    cancelBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center" },
    cancelText: { fontFamily: FIRASANSSEMIBOLD, color: "#6B7280" },
    saveBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: BRANDCOLOR, alignItems: "center" },
    saveText: { fontFamily: FIRASANSSEMIBOLD, color: WHITE },
});
