import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    RefreshControl,
    Alert,
    Modal,
    TouchableOpacity,
    ScrollView,
    Pressable,
    KeyboardAvoidingView,
    Platform,
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
    capitalizeStatus,
    logScreenApi,
} from "../../../utils/Network";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR, WHITE } from "../../../constant/color";

const SCREEN_BG = "#F3F4F6";
const CARD_BG = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const BORDER_COLOR = "#E5E7EB";

const mapRow = (row) => ({
    id: String(row.id),
    name: row.name || "",
    grade: row.grade || "—",
    stock: String(row.current_stock ?? 0),
    minStock: String(row.minimum_stock ?? 0),
    status: capitalizeStatus(row.status),
});

const ProductionCommoditiesScreen = () => {
    const navigation = useFinanceNavigation();
    const [rows, setRows] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editId, setEditId] = useState(null);
    const [name, setName] = useState("");
    const [grade, setGrade] = useState("A");
    const [minStock, setMinStock] = useState("100");
    const [currentStock, setCurrentStock] = useState("0");

    const loadData = useCallback(async () => {
        const res = await GETNETWORK(buildUrl("fmcg/commodities"), true);
        logScreenApi("ProductionCommoditiesScreen", "fmcg/commodities", res, buildUrl("fmcg/commodities"));
        if (isApiSuccess(res)) {
            setRows(extractApiList(res).map(mapRow));
        }
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((r) => r.name.toLowerCase().includes(q));
    }, [rows, search]);

    const openCreate = () => {
        setEditId(null);
        setName("");
        setGrade("A");
        setMinStock("100");
        setCurrentStock("0");
        setModalVisible(true);
    };

    const openEdit = (item) => {
        setEditId(item.id);
        setName(item.name);
        setGrade(item.grade);
        setMinStock(item.minStock);
        setCurrentStock(item.stock);
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("Required", "Enter commodity name.");
            return;
        }
        const payload = {
            name: name.trim(),
            grade,
            minimum_stock: Number(minStock) || 0,
            status: "active",
        };
        if (!editId) payload.current_stock = Number(currentStock) || 0;

        let res;
        if (editId) {
            res = await PUTNETWORK(buildUrl(`fmcg/commodities/${editId}`), payload, true);
            logScreenApi("ProductionCommoditiesScreen", "fmcg/commodities/update", res, buildUrl(`fmcg/commodities/${editId}`));
        } else {
            res = await POSTNETWORK(buildUrl("fmcg/commodities"), payload, true);
            logScreenApi("ProductionCommoditiesScreen", "fmcg/commodities/create", res, buildUrl("fmcg/commodities"));
        }
        if (!isApiSuccess(res)) {
            Alert.alert("Error", getApiMessage(res));
            return;
        }
        setModalVisible(false);
        loadData();
    };

    return (
        <View style={styles.root}>
            <MyHeader title="Commodities" onBackPress={navigation.goBack} />
            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[BRANDCOLOR]} />}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={
                        <View style={styles.header}>
                            <Text style={styles.pageTitle}>Commodities</Text>
                            <TextInput
                                style={styles.search}
                                placeholder="Search..."
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.card} onPress={() => openEdit(item)}>
                            <Text style={styles.cardTitle}>{item.name}</Text>
                            <Text style={styles.cardMeta}>Grade: {item.grade} • Stock: {item.stock}</Text>
                            <Text style={styles.cardMeta}>Min: {item.minStock} • {item.status}</Text>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No commodities found</Text>}
                />
                <TouchableOpacity style={styles.fab} onPress={openCreate}>
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            </SafeAreaView>

            <Modal visible={modalVisible} transparent animationType="fade">
                <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)} />
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalWrap}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>{editId ? "Edit Commodity" : "Add Commodity"}</Text>
                        <ScrollView keyboardShouldPersistTaps="handled">
                            <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
                            <TextInput style={styles.input} placeholder="Grade" value={grade} onChangeText={setGrade} />
                            <TextInput style={styles.input} placeholder="Minimum stock" value={minStock} onChangeText={setMinStock} keyboardType="numeric" />
                            {!editId ? (
                                <TextInput style={styles.input} placeholder="Current stock" value={currentStock} onChangeText={setCurrentStock} keyboardType="numeric" />
                            ) : null}
                        </ScrollView>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                            <Text style={styles.saveBtnText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

export default ProductionCommoditiesScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: SCREEN_BG },
    safeArea: { flex: 1 },
    listContent: { padding: 16, paddingBottom: 80 },
    header: { marginBottom: 12 },
    pageTitle: { fontFamily: UBUNTUBOLD, fontSize: 22, color: TEXT_DARK, marginBottom: 10 },
    search: { backgroundColor: CARD_BG, borderRadius: 10, borderWidth: 1, borderColor: BORDER_COLOR, padding: 12, fontFamily: FIRASANS },
    card: { backgroundColor: CARD_BG, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: BORDER_COLOR },
    cardTitle: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: TEXT_DARK },
    cardMeta: { fontFamily: FIRASANS, fontSize: 12, color: TEXT_MUTED, marginTop: 4 },
    empty: { textAlign: "center", color: TEXT_MUTED, fontFamily: FIRASANS, marginTop: 40 },
    fab: { position: "absolute", right: 20, bottom: 24, width: 52, height: 52, borderRadius: 26, backgroundColor: BRANDCOLOR, alignItems: "center", justifyContent: "center" },
    fabText: { color: WHITE, fontSize: 28, lineHeight: 30 },
    modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
    modalWrap: { flex: 1, justifyContent: "center", padding: 20 },
    modalCard: { backgroundColor: CARD_BG, borderRadius: 14, padding: 16, maxHeight: "80%" },
    modalTitle: { fontFamily: UBUNTUBOLD, fontSize: 18, marginBottom: 12, color: TEXT_DARK },
    input: { borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 10, padding: 12, marginBottom: 10, fontFamily: FIRASANS },
    saveBtn: { backgroundColor: BRANDCOLOR, borderRadius: 10, padding: 14, alignItems: "center", marginTop: 8 },
    saveBtnText: { color: WHITE, fontFamily: FIRASANSSEMIBOLD },
});
