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

const StoreStockEntryScreen = () => {
    const navigation = useFinanceNavigation();
    const [type, setType] = useState("in");
    const [variants, setVariants] = useState([]);
    const [variantId, setVariantId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [notes, setNotes] = useState("");
    const [batchNumber, setBatchNumber] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const loadVariants = useCallback(async () => {
        const res = await GETNETWORK(buildUrl("products", "limit=100"), true);
        logScreenApi("StoreStockEntryScreen", "products", res, buildUrl("products", "limit=100"));
        if (isApiSuccess(res)) {
            const list = extractApiList(res).flatMap((p) =>
                (p.variants || []).map((v) => ({
                    id: String(v.id),
                    label: `${p.product_name} - ${v.size} (Stock: ${v.current_stock ?? 0})`,
                }))
            );
            setVariants(list);
        }
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadVariants();
    }, [loadVariants]);

    const handleSubmit = async () => {
        if (!variantId || !quantity) {
            Alert.alert("Required", "Select variant and enter quantity.");
            return;
        }
        const payload = {
            variant_id: Number(variantId),
            quantity: Number(quantity),
            notes: notes || undefined,
            batch_number: batchNumber || undefined,
        };
        const endpoint = type === "in" ? "inventory/stock-in" : "inventory/stock-out";
        const res = await POSTNETWORK(buildUrl(endpoint), payload, true);
        logScreenApi("StoreStockEntryScreen", endpoint, res, buildUrl(endpoint));
        if (!isApiSuccess(res)) {
            Alert.alert("Error", getApiMessage(res));
            return;
        }
        Alert.alert("Success", `Stock ${type === "in" ? "added" : "removed"}`);
        setQuantity("");
        setNotes("");
        setBatchNumber("");
        loadVariants();
    };

    return (
        <View style={styles.root}>
            <MyHeader title="Stock Entry" onBackPress={navigation.goBack} />
            <SafeAreaView style={styles.safeArea} edges={[]}>
                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadVariants(); }} colors={[BRANDCOLOR]} />}
                >
                    <Text style={styles.pageTitle}>Stock Entry</Text>
                    <View style={styles.toggleRow}>
                        <TouchableOpacity style={[styles.toggleBtn, type === "in" && styles.toggleActive]} onPress={() => setType("in")}>
                            <Text style={[styles.toggleText, type === "in" && styles.toggleTextActive]}>Stock In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.toggleBtn, type === "out" && styles.toggleActive]} onPress={() => setType("out")}>
                            <Text style={[styles.toggleText, type === "out" && styles.toggleTextActive]}>Stock Out</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.label}>Variant ID</Text>
                    <TextInput style={styles.input} placeholder="Variant ID" value={variantId} onChangeText={setVariantId} keyboardType="numeric" />
                    {variants.slice(0, 5).map((v) => (
                        <TouchableOpacity key={v.id} onPress={() => setVariantId(v.id)}>
                            <Text style={styles.hint}>{v.label}</Text>
                        </TouchableOpacity>
                    ))}
                    <Text style={styles.label}>Quantity</Text>
                    <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
                    {type === "in" ? (
                        <TextInput style={styles.input} placeholder="Batch number" value={batchNumber} onChangeText={setBatchNumber} />
                    ) : null}
                    <TextInput style={styles.input} placeholder="Notes" value={notes} onChangeText={setNotes} />
                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                        <Text style={styles.submitText}>Submit</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default StoreStockEntryScreen;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F3F4F6" },
    safeArea: { flex: 1 },
    content: { padding: 16 },
    pageTitle: { fontFamily: UBUNTUBOLD, fontSize: 22, color: "#111827", marginBottom: 16 },
    toggleRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
    toggleBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: WHITE, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center" },
    toggleActive: { backgroundColor: BRANDCOLOR, borderColor: BRANDCOLOR },
    toggleText: { fontFamily: FIRASANSSEMIBOLD, color: "#6B7280" },
    toggleTextActive: { color: WHITE },
    label: { fontFamily: FIRASANSSEMIBOLD, fontSize: 12, color: "#6B7280", marginBottom: 6 },
    input: { backgroundColor: WHITE, borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", padding: 12, marginBottom: 10, fontFamily: FIRASANS },
    hint: { fontFamily: FIRASANS, fontSize: 11, color: "#2563EB", marginBottom: 4 },
    submitBtn: { backgroundColor: BRANDCOLOR, borderRadius: 10, padding: 14, alignItems: "center", marginTop: 8 },
    submitText: { color: WHITE, fontFamily: FIRASANSSEMIBOLD },
});
