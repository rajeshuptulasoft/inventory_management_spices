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
import { MyHeader } from "../../../components/commonComponents/MyHeader";
import { MyAlert } from "../../../components/commonComponents/MyAlert";
import { CustomButton } from "../../../components/commonComponents/Button";
import { useFinanceNavigation } from "../../../navigations/AdminNavigationContext";
import {
    buildUrl,
    GETNETWORK,
    PUTNETWORK,
    extractApiList,
    getApiMessage,
    isApiSuccess,
    fmtInr,
    logScreenApi,
} from "../../../utils/Network";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR, WHITE } from "../../../constant/color";

const mapRow = (row) => ({
    id: String(row.id),
    code: row.sku || row.code || `RM-${row.id}`,
    name: row.name || "",
    price: fmtInr(row.cost_per_unit),
    reorderLevel: String(row.minimum_stock ?? 0),
    stock: String(row.current_stock ?? 0),
    raw: row,
});

const QcRawMaterialScreen = () => {
    const navigation = useFinanceNavigation();
    const [rows, setRows] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [confirm, setConfirm] = useState(null);

    const loadData = useCallback(async () => {
        const res = await GETNETWORK(buildUrl("raw-materials"), true);
        logScreenApi("QcRawMaterialScreen", "raw-materials", res, buildUrl("raw-materials"));
        if (isApiSuccess(res)) {
            setRows(extractApiList(res).map(mapRow));
        }
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter(
            (r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q)
        );
    }, [rows, search]);

    const handleQc = (item, decision) => {
        const qcStatus = decision === "approve" ? "approved" : "rejected";
        setConfirm({
            title: "Raw Material QC",
            message: `${decision === "approve" ? "Approve" : "Reject"} ${item.name}?`,
            onConfirm: async () => {
                setConfirm(null);
                const res = await PUTNETWORK(
                    buildUrl(`raw-materials/${item.id}`),
                    { ...item.raw, qc_status: qcStatus },
                    true
                );
                logScreenApi("QcRawMaterialScreen", "raw-materials/${item.id}", res, buildUrl(`raw-materials/${item.id}`));
                if (!isApiSuccess(res)) {
                    navigation.showError?.(getApiMessage(res, "QC update failed"));
                    return;
                }
                navigation.showSuccess?.(`Raw material marked as ${qcStatus}.`);
                loadData();
            },
        });
    };

    return (
        <View style={styles.root}>
            <MyHeader title="Raw Material QC" onBackPress={navigation.goBack} />
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
                            <Text style={styles.pageTitle}>Raw Materials QC</Text>
                            <TextInput
                                style={styles.search}
                                placeholder="Search materials..."
                                placeholderTextColor="#9CA3AF"
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.title}>{item.name}</Text>
                            <Text style={styles.meta}>
                                {item.code} • Stock: {item.stock} • Reorder: {item.reorderLevel}
                            </Text>
                            <Text style={styles.price}>{item.price}</Text>
                            <View style={styles.actions}>
                                <CustomButton
                                    text="Reject"
                                    width="48%"
                                    backgroundColor="#FEE2E2"
                                    color="#DC2626"
                                    fontSize={13}
                                    fontFamily={FIRASANSSEMIBOLD}
                                    onPress={() => handleQc(item, "reject")}
                                />
                                <CustomButton
                                    text="Approve"
                                    width="48%"
                                    backgroundColor={BRANDCOLOR}
                                    fontSize={13}
                                    fontFamily={FIRASANSSEMIBOLD}
                                    onPress={() => handleQc(item, "approve")}
                                />
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No raw materials found</Text>}
                />
            </SafeAreaView>
            <MyAlert
                visible={Boolean(confirm)}
                title={confirm?.title || ""}
                message={confirm?.message || ""}
                textLeft="Cancel"
                textRight="Confirm"
                onPressLeft={() => setConfirm(null)}
                onPressRight={confirm?.onConfirm}
                onRequestClose={() => setConfirm(null)}
            />
        </View>
    );
};

export default QcRawMaterialScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    safeArea: { flex: 1 },
    list: { padding: 16 },
    pageTitle: { fontFamily: UBUNTUBOLD, fontSize: 22, color: "#111827", marginBottom: 10 },
    search: {
        backgroundColor: WHITE,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontFamily: FIRASANS,
        fontSize: 14,
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
    price: { fontFamily: FIRASANSSEMIBOLD, fontSize: 13, color: "#111827", marginTop: 4 },
    actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
    empty: { textAlign: "center", color: "#6B7280", fontFamily: FIRASANS, marginTop: 40 },
});
