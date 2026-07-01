import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FinanceHeader from "../../../components/commonComponents/FinanceHeader";
import { CustomButton } from "../../../components/commonComponents/Button";
import { useFinanceNavigation } from "../../../navigations/AdminNavigationContext";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR, WHITE } from "../../../constant/color";
import {
    buildUrl,
    extractApiList,
    GETNETWORK,
    PUTNETWORK,
    getApiMessage,
    isApiSuccess,
    logScreenApi,
} from "../../../utils/Network";

const isPendingQc = (status) => {
    const s = String(status || "pending").toLowerCase();
    return !["approved", "passed", "completed", "rejected", "failed"].includes(s);
};

const mapInspectionRow = (row, type) => ({
    id: `${type}-${row.id}`,
    rawId: row.id,
    type,
    title:
        type === "batch"
            ? row.batch_number || `Batch #${row.id}`
            : row.batch_code || `Production #${row.id}`,
    subtitle:
        type === "batch"
            ? `Qty ${row.quantity ?? 0} • Exp ${row.expiry_date || "—"}`
            : row.variant?.product?.product_name || row.product_name || "Production run",
    status: row.qc_status || row.status || "pending",
    raw: row,
});

const QcInspectionsScreen = () => {
    const navigation = useFinanceNavigation();
    const [rows, setRows] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);

    const loadData = useCallback(async () => {
        try {
            const [batchRes, prodRes] = await Promise.all([
                GETNETWORK(buildUrl("batches"), true),
                GETNETWORK(buildUrl("production"), true),
            ]);
            logScreenApi("QcInspectionsScreen", "batches", batchRes, buildUrl("batches"));
            logScreenApi("QcInspectionsScreen", "production", prodRes, buildUrl("production"));
            const batches = isApiSuccess(batchRes) ? extractApiList(batchRes) : [];
            const production = isApiSuccess(prodRes) ? extractApiList(prodRes) : [];

            const combined = [
                ...batches.filter((b) => isPendingQc(b.qc_status || b.status)).map((b) => mapInspectionRow(b, "batch")),
                ...production.filter((p) => isPendingQc(p.qc_status || p.status)).map((p) => mapInspectionRow(p, "production")),
            ];

            setRows(combined);
        } finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const updateQcStatus = async (item, decision) => {
        setUpdatingId(item.id);
        const qcStatus = decision === "approve" ? "approved" : "rejected";
        const endpoint =
            item.type === "batch"
                ? buildUrl(`batches/${item.rawId}`)
                : buildUrl(`production/${item.rawId}`);

        const payload = {
            ...item.raw,
            qc_status: qcStatus,
            status: decision === "approve" ? "approved" : item.raw.status,
        };

        const res = await PUTNETWORK(endpoint, payload, true);
        logScreenApi("QcInspectionsScreen", "endpoint", res, endpoint);
        setUpdatingId(null);

        if (!isApiSuccess(res)) {
            navigation.showError?.(getApiMessage(res, "Unable to update QC status."));
            return;
        }

        navigation.showSuccess?.(`Marked as ${qcStatus}.`);
        loadData();
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{item.type === "batch" ? "Batch" : "Production"}</Text>
                </View>
                <Text style={styles.statusLabel}>{String(item.status).replace(/_/g, " ")}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
            <View style={styles.actions}>
                <CustomButton
                    text="Reject"
                    width="48%"
                    backgroundColor="#FEE2E2"
                    color="#DC2626"
                    fontSize={13}
                    fontFamily={FIRASANSSEMIBOLD}
                    onPress={() => updateQcStatus(item, "reject")}
                />
                <CustomButton
                    text="Approve"
                    width="48%"
                    backgroundColor={BRANDCOLOR}
                    fontSize={13}
                    fontFamily={FIRASANSSEMIBOLD}
                    onPress={() => updateQcStatus(item, "approve")}
                />
            </View>
        </View>
    );

    return (
        <View style={styles.root}>
            <FinanceHeader
                profileInitial="Q"
                onProfilePress={navigation.openDrawer}
                onNotificationPress={() => navigation.navigate("Notification")}
            />
            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={rows}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListHeaderComponent={
                        <Text style={styles.pageTitle}>Pending Inspections</Text>
                    }
                    ListEmptyComponent={
                        <Text style={styles.empty}>No pending QC items</Text>
                    }
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
                />
            </SafeAreaView>
        </View>
    );
};

export default QcInspectionsScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    safeArea: { flex: 1 },
    list: { padding: 16, paddingBottom: 24 },
    pageTitle: { fontFamily: UBUNTUBOLD, fontSize: 22, color: "#111827", marginBottom: 12 },
    card: {
        backgroundColor: WHITE,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    typeBadge: { backgroundColor: "#DBEAFE", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    typeText: { fontFamily: FIRASANSSEMIBOLD, fontSize: 11, color: "#1D4ED8" },
    statusLabel: { fontFamily: FIRASANS, fontSize: 12, color: "#6B7280", textTransform: "capitalize" },
    title: { fontFamily: FIRASANSSEMIBOLD, fontSize: 15, color: "#111827" },
    subtitle: { fontFamily: FIRASANS, fontSize: 12, color: "#6B7280", marginTop: 4 },
    actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
    empty: { textAlign: "center", color: "#6B7280", fontFamily: FIRASANS, marginTop: 40 },
});
