import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
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
    capitalizeStatus,
    logScreenApi,
} from "../../../utils/Network";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR, WHITE } from "../../../constant/color";

const QcProductionRunsScreen = () => {
    const navigation = useFinanceNavigation();
    const [rows, setRows] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [confirm, setConfirm] = useState(null);

    const loadData = useCallback(async () => {
        const res = await GETNETWORK(buildUrl("production"), true);
        logScreenApi("QcProductionRunsScreen", "production", res, buildUrl("production"));
        if (isApiSuccess(res)) {
            setRows(extractApiList(res));
        }
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleQc = (item, decision) => {
        const qcStatus = decision === "approve" ? "approved" : "rejected";
        setConfirm({
            title: "Production QC",
            message: `${decision === "approve" ? "Approve" : "Reject"} ${item.batch_code || `Run #${item.id}`}?`,
            onConfirm: async () => {
                setConfirm(null);
                const res = await PUTNETWORK(
                    buildUrl(`production/${item.id}`),
                    { ...item, qc_status: qcStatus },
                    true
                );
                logScreenApi("QcProductionRunsScreen", "production/${item.id}", res, buildUrl(`production/${item.id}`));
                if (!isApiSuccess(res)) {
                    navigation.showError?.(getApiMessage(res, "QC update failed"));
                    return;
                }
                navigation.showSuccess?.(`Production run marked as ${qcStatus}.`);
                loadData();
            },
        });
    };

    return (
        <View style={styles.root}>
            <MyHeader title="Production QC" onBackPress={navigation.goBack} />
            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={rows}
                    keyExtractor={(item) => String(item.id)}
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
                    ListHeaderComponent={<Text style={styles.pageTitle}>Production Runs QC</Text>}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.title}>{item.batch_code || `Run #${item.id}`}</Text>
                            <Text style={styles.meta}>
                                {item.variant?.product?.product_name || "—"} • Qty:{" "}
                                {item.produced_qty ?? item.quantity ?? 0}
                            </Text>
                            <Text style={styles.status}>
                                Status: {capitalizeStatus(item.qc_status || item.status || "pending")}
                            </Text>
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
                    ListEmptyComponent={<Text style={styles.empty}>No production runs found</Text>}
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

export default QcProductionRunsScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    safeArea: { flex: 1 },
    list: { padding: 16 },
    pageTitle: { fontFamily: UBUNTUBOLD, fontSize: 22, color: "#111827", marginBottom: 12 },
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
    status: { fontFamily: FIRASANSSEMIBOLD, fontSize: 12, color: "#2563EB", marginTop: 6 },
    actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
    empty: { textAlign: "center", color: "#6B7280", fontFamily: FIRASANS, marginTop: 40 },
});
