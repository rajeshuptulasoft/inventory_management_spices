import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    RefreshControl,
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
    logScreenApi,
} from "../../../utils/Network";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR, WHITE } from "../../../constant/color";

const StoreTransferScreen = () => {
    const navigation = useFinanceNavigation();
    const [racks, setRacks] = useState([]);
    const [variants, setVariants] = useState([]);
    const [variantId, setVariantId] = useState("");
    const [fromRackId, setFromRackId] = useState("");
    const [toRackId, setToRackId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        const [racksRes, productsRes] = await Promise.all([
            GETNETWORK(buildUrl("racks"), true),
            GETNETWORK(buildUrl("products", "limit=100"), true),
        ]);
        logScreenApi("StoreTransferScreen", "racks", racksRes, buildUrl("racks"));
        logScreenApi("StoreTransferScreen", "products", productsRes, buildUrl("products", "limit=100"));
        if (isApiSuccess(racksRes)) {
            setRacks(extractApiList(racksRes).map((r) => ({ id: String(r.id), label: r.rack_name || "" })));
        }
        if (isApiSuccess(productsRes)) {
            const list = extractApiList(productsRes).flatMap((p) =>
                (p.variants || []).map((v) => ({
                    id: String(v.id),
                    label: `${p.product_name} - ${v.size}`,
                    rackId: String(v.rack_id ?? ""),
                }))
            );
            setVariants(list);
        }
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onVariantSelect = (id, rackId) => {
        setVariantId(id);
        if (rackId) setFromRackId(rackId);
    };

    const handleTransfer = async () => {
        if (!variantId || !fromRackId || !toRackId || !quantity) {
            Alert.alert("Required", "Fill variant, from/to rack and quantity.");
            return;
        }
        const payload = {
            variant_id: Number(variantId),
            from_rack_id: Number(fromRackId),
            to_rack_id: Number(toRackId),
            quantity: Number(quantity),
        };
        const res = await POSTNETWORK(buildUrl("inventory/transfer"), payload, true);
        logScreenApi("StoreTransferScreen", "inventory/transfer", res, buildUrl("inventory/transfer"));
        if (!isApiSuccess(res)) {
            Alert.alert("Error", getApiMessage(res));
            return;
        }
        Alert.alert("Success", "Rack transfer completed");
        setQuantity("");
        loadData();
    };

    return (
        <View style={styles.root}>
            <MyHeader title="Rack Transfer" onBackPress={navigation.goBack} />
            <SafeAreaView style={styles.safeArea} edges={[]}>
                <ScrollView
                    contentContainerStyle={styles.content}
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
                >
                    <Text style={styles.pageTitle}>Transfer Stock</Text>
                    <Text style={styles.label}>Variant ID</Text>
                    <TextInput style={styles.input} value={variantId} onChangeText={setVariantId} keyboardType="numeric" />
                    {variants.slice(0, 6).map((v) => (
                        <TouchableOpacity key={v.id} onPress={() => onVariantSelect(v.id, v.rackId)}>
                            <Text style={styles.hint}>{v.label}</Text>
                        </TouchableOpacity>
                    ))}
                    <Text style={styles.label}>From Rack ID</Text>
                    <TextInput style={styles.input} value={fromRackId} onChangeText={setFromRackId} keyboardType="numeric" />
                    {racks.slice(0, 4).map((r) => (
                        <TouchableOpacity key={`from-${r.id}`} onPress={() => setFromRackId(r.id)}>
                            <Text style={styles.hint}>From: {r.label}</Text>
                        </TouchableOpacity>
                    ))}
                    <Text style={styles.label}>To Rack ID</Text>
                    <TextInput style={styles.input} value={toRackId} onChangeText={setToRackId} keyboardType="numeric" />
                    {racks.slice(0, 4).map((r) => (
                        <TouchableOpacity key={`to-${r.id}`} onPress={() => setToRackId(r.id)}>
                            <Text style={styles.hint}>To: {r.label}</Text>
                        </TouchableOpacity>
                    ))}
                    <Text style={styles.label}>Quantity</Text>
                    <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
                    <TouchableOpacity style={styles.submitBtn} onPress={handleTransfer}>
                        <Text style={styles.submitText}>Transfer</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default StoreTransferScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    safeArea: { flex: 1 },
    content: { padding: 16, paddingBottom: 24 },
    pageTitle: { fontFamily: UBUNTUBOLD, fontSize: 22, color: "#111827", marginBottom: 16 },
    label: { fontFamily: FIRASANSSEMIBOLD, fontSize: 12, color: "#6B7280", marginBottom: 6, marginTop: 8 },
    input: {
        backgroundColor: WHITE,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 12,
        fontFamily: FIRASANS,
    },
    hint: { fontFamily: FIRASANS, fontSize: 11, color: "#2563EB", marginTop: 4, marginBottom: 4 },
    submitBtn: { backgroundColor: BRANDCOLOR, borderRadius: 10, padding: 14, alignItems: "center", marginTop: 16 },
    submitText: { color: WHITE, fontFamily: FIRASANSSEMIBOLD },
});
