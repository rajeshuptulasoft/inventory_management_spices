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
    PUTNETWORK,
    extractApiList,
    getApiMessage,
    isApiSuccess,
    logScreenApi,
} from "../../../utils/Network";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR, WHITE } from "../../../constant/color";

const mapRackRow = (row) => ({
    id: String(row.id),
    name: row.rack_name || "",
    warehouse: row.warehouse?.name || row.warehouse_name || "—",
    capacity: String(row.capacity ?? 0),
    status: (row.status || "active").toString(),
    warehouseId: String(row.warehouse_id ?? row.warehouse?.id ?? ""),
});

const StoreRacksScreen = () => {
    const navigation = useFinanceNavigation();
    const [racks, setRacks] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: "", warehouseId: "", capacity: "", status: "active" });

    const loadData = useCallback(async () => {
        const [racksRes, whRes] = await Promise.all([
            GETNETWORK(buildUrl("racks"), true),
            GETNETWORK(buildUrl("racks/warehouses/list"), true),
        ]);
        logScreenApi("StoreRacksScreen", "racks", racksRes, buildUrl("racks"));
        logScreenApi("StoreRacksScreen", "racks/warehouses/list", whRes, buildUrl("racks/warehouses/list"));
        if (isApiSuccess(racksRes)) {
            setRacks(extractApiList(racksRes).map(mapRackRow));
        }
        if (isApiSuccess(whRes)) {
            setWarehouses(extractApiList(whRes));
        }
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return racks;
        return racks.filter(
            (r) =>
                r.name.toLowerCase().includes(q) ||
                r.warehouse.toLowerCase().includes(q) ||
                r.status.toLowerCase().includes(q)
        );
    }, [racks, search]);

    const openAdd = () => {
        setEditing(null);
        setForm({
            name: "",
            warehouseId: String(warehouses[0]?.id ?? ""),
            capacity: "",
            status: "active",
        });
        setModalVisible(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setForm({
            name: item.name,
            warehouseId: item.warehouseId,
            capacity: item.capacity,
            status: item.status,
        });
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.warehouseId) {
            Alert.alert("Required", "Rack name and warehouse are required.");
            return;
        }
        const payload = {
            rack_name: form.name.trim(),
            warehouse_id: Number(form.warehouseId),
            capacity: Number(form.capacity || 0),
            status: form.status.toLowerCase(),
        };
        const res = editing
            ? await PUTNETWORK(buildUrl(`racks/${editing.id}`), payload, true)
            : await POSTNETWORK(buildUrl("racks"), payload, true);
        logScreenApi(
            "StoreRacksScreen",
            editing ? "racks/update" : "racks/create",
            res,
            buildUrl(editing ? `racks/${editing.id}` : "racks")
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
            <MyHeader title="Rack Management" onBackPress={navigation.goBack} />
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
                                <Text style={styles.pageTitle}>Racks</Text>
                                <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
                                    <Text style={styles.addBtnText}>+ Add</Text>
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.search}
                                placeholder="Search racks..."
                                placeholderTextColor="#9CA3AF"
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.card} onPress={() => openEdit(item)}>
                            <Text style={styles.title}>{item.name}</Text>
                            <Text style={styles.meta}>Warehouse: {item.warehouse}</Text>
                            <Text style={styles.meta}>Capacity: {item.capacity}</Text>
                            <Text style={styles.status}>{item.status}</Text>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No racks found</Text>}
                />
            </SafeAreaView>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <ScrollView>
                            <Text style={styles.modalTitle}>{editing ? "Edit Rack" : "Add Rack"}</Text>
                            <Text style={styles.label}>Rack Name</Text>
                            <TextInput
                                style={styles.input}
                                value={form.name}
                                onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                            />
                            <Text style={styles.label}>Warehouse ID</Text>
                            <TextInput
                                style={styles.input}
                                value={form.warehouseId}
                                onChangeText={(v) => setForm((f) => ({ ...f, warehouseId: v }))}
                                keyboardType="numeric"
                            />
                            <Text style={styles.label}>Capacity</Text>
                            <TextInput
                                style={styles.input}
                                value={form.capacity}
                                onChangeText={(v) => setForm((f) => ({ ...f, capacity: v }))}
                                keyboardType="numeric"
                            />
                            <Text style={styles.label}>Status</Text>
                            <TextInput
                                style={styles.input}
                                value={form.status}
                                onChangeText={(v) => setForm((f) => ({ ...f, status: v }))}
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

export default StoreRacksScreen;

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
    status: { fontFamily: FIRASANSSEMIBOLD, fontSize: 12, color: BRANDCOLOR, marginTop: 6, textTransform: "capitalize" },
    empty: { textAlign: "center", color: "#6B7280", fontFamily: FIRASANS, marginTop: 40 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
    modalCard: { backgroundColor: WHITE, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, maxHeight: "80%" },
    modalTitle: { fontFamily: UBUNTUBOLD, fontSize: 18, color: "#111827", marginBottom: 12 },
    label: { fontFamily: FIRASANSSEMIBOLD, fontSize: 12, color: "#6B7280", marginBottom: 6 },
    input: {
        backgroundColor: "#F9FAFB",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 12,
        marginBottom: 10,
        fontFamily: FIRASANS,
    },
    modalActions: { flexDirection: "row", gap: 10, marginTop: 8 },
    cancelBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center" },
    cancelText: { fontFamily: FIRASANSSEMIBOLD, color: "#6B7280" },
    saveBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: BRANDCOLOR, alignItems: "center" },
    saveText: { fontFamily: FIRASANSSEMIBOLD, color: WHITE },
});
