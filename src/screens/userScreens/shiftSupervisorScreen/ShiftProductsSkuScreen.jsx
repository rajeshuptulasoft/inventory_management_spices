import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    RefreshControl,
    BackHandler,
    Platform,
    Alert,
    Modal,
    KeyboardAvoidingView,
    ScrollView,
    Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MyHeader } from "../../../components/commonComponents/MyHeader";
import { useFinanceNavigation } from "../../../navigations/AdminNavigationContext";
import { FIRASANS, FIRASANSSEMIBOLD, UBUNTUBOLD } from "../../../constant/fontPath";
import { BRANDCOLOR, WHITE } from "../../../constant/color";
import {
    buildUrl,
    GETNETWORK,
    POSTNETWORK,
    PUTNETWORK,
    DELETENETWORK,
    extractApiList,
    getApiMessage,
    isApiSuccess,
    capitalizeStatus,
} from "../../../utils/Network";

const SCREEN_BG = "#F3F4F6";
const CARD_BG = "#FFFFFF";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";
const TEXT_LIGHT = "#9CA3AF";
const BORDER_COLOR = "#E5E7EB";
const PRIMARY_BLUE = "#2563EB";
const GREEN = "#16A34A";
const RED = "#DC2626";

const mapProductRow = (row) => ({
    id: String(row.id),
    sku: row.sku || row.product_code || `SKU-${row.id}`,
    name: row.product_name || row.name || "",
    category: row.category?.name || row.category_name || "",
    categoryId: String(row.category_id ?? ""),
    description: row.description || "",
    status: capitalizeStatus(row.status),
    variants: String(row.variants?.length ?? 0),
});

const FormField = ({ label, required, children }) => (
    <View style={styles.formField}>
        <Text style={styles.formLabel}>
            {label}
            {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
        {children}
    </View>
);

const ProductFormModal = ({ visible, editingItem, categoryOptions, onClose, onSave }) => {
    const [sku, setSku] = useState("");
    const [name, setName] = useState("");
    const [category, setCategory] = useState(null);
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("Active");
    const [imageUri, setImageUri] = useState(null);

    useEffect(() => {
        if (visible) {
            setSku(editingItem?.sku ?? "");
            setName(editingItem?.name ?? "");
            setCategory(editingItem?.category ?? null);
            setDescription(editingItem?.description ?? "");
            setStatus(editingItem?.status ?? "Active");
            setImageUri(editingItem?.imageUri ?? null);
        }
    }, [visible, editingItem]);

    const resetForm = () => {
        setSku("");
        setName("");
        setCategory(null);
        setDescription("");
        setStatus("Active");
        setImageUri(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSave = () => {
        if (!sku.trim() || !name.trim()) {
            Alert.alert("Required Fields", "Please enter SKU Code and Product Name.");
            return;
        }
        onSave({
            id: editingItem?.id,
            sku: sku.trim().toUpperCase(),
            name: name.trim(),
            category,
            description: description.trim(),
            status,
            imageUri,
            variants: editingItem?.variants ?? "0",
        });
        resetForm();
    };

    const openCategoryPicker = () => {
        const options = categoryOptions?.length
            ? categoryOptions
            : [{ id: "", name: "No categories loaded" }];
        Alert.alert("Select Category", "", [
            {
                text: "— Select category —",
                onPress: () => setCategory(null),
            },
            ...options.map((option) => ({
                text: option.name,
                onPress: () => setCategory(option.name),
            })),
            { text: "Cancel", style: "cancel" },
        ]);
    };

    const cycleStatus = () => {
        setStatus((prev) => (prev === "Active" ? "Inactive" : "Active"));
    };

    const handleUploadImage = () => {
        Alert.alert(
            "Upload Image",
            "Image upload will be connected to your media library.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Use Placeholder",
                    onPress: () => setImageUri("placeholder"),
                },
            ]
        );
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <View style={styles.modalOverlay}>
                <Pressable style={styles.modalBackdrop} onPress={handleClose} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={styles.modalKeyboard}
                >
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingItem ? "Edit Product" : "Add Product"}
                            </Text>
                            <TouchableOpacity
                                onPress={handleClose}
                                style={styles.closeButton}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <FormField label="SKU" required>
                                <TextInput
                                    style={styles.formInput}
                                    value={sku}
                                    onChangeText={setSku}
                                    placeholderTextColor={TEXT_LIGHT}
                                    autoCapitalize="characters"
                                />
                            </FormField>

                            <FormField label="PRODUCT" required>
                                <TextInput
                                    style={styles.formInput}
                                    value={name}
                                    onChangeText={setName}
                                    placeholderTextColor={TEXT_LIGHT}
                                />
                            </FormField>

                            <FormField label="CATEGORY">
                                <TouchableOpacity
                                    style={styles.pickerField}
                                    onPress={openCategoryPicker}
                                    activeOpacity={0.85}
                                >
                                    <Text style={[styles.pickerText, !category && styles.pickerPlaceholder]}>
                                        {category ?? "— Select category —"}
                                    </Text>
                                    <Text style={styles.pickerChevron}>▾</Text>
                                </TouchableOpacity>
                            </FormField>

                            <FormField label="PRODUCT IMAGE">
                                <View style={styles.imageRow}>
                                    <View style={styles.imagePreview}>
                                        {imageUri ? (
                                            <Text style={styles.imagePreviewIcon}>🖼️</Text>
                                        ) : (
                                            <Text style={styles.imagePreviewIcon}>📷</Text>
                                        )}
                                    </View>
                                    <TouchableOpacity
                                        style={styles.uploadButton}
                                        onPress={handleUploadImage}
                                        activeOpacity={0.85}
                                    >
                                        <Text style={styles.uploadButtonText}>Upload Image</Text>
                                    </TouchableOpacity>
                                </View>
                            </FormField>

                            <FormField label="DESCRIPTION">
                                <TextInput
                                    style={[styles.formInput, styles.textArea]}
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholderTextColor={TEXT_LIGHT}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </FormField>

                            <FormField label="STATUS">
                                <TouchableOpacity
                                    style={styles.pickerField}
                                    onPress={cycleStatus}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.pickerText}>{status}</Text>
                                    <Text style={styles.pickerChevron}>▾</Text>
                                </TouchableOpacity>
                            </FormField>
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                onPress={handleClose}
                                activeOpacity={0.85}
                                style={styles.cancelButton}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSave}
                                activeOpacity={0.9}
                                style={styles.saveButton}
                            >
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const ProductCard = ({ item, onEdit, onDelete }) => (
    <View style={styles.productCard}>
        <View style={styles.productGrid}>
            <View style={styles.gridColSku}>
                <Text style={styles.fieldLabel}>SKU</Text>
                <Text style={styles.skuText}>{item.sku}</Text>
            </View>
            <View style={styles.gridColProduct}>
                <Text style={styles.fieldLabel}>PRODUCT</Text>
                <Text style={styles.productName}>{item.name}</Text>
            </View>
        </View>

        <View style={styles.productGrid}>
            <View style={styles.gridColCategory}>
                <Text style={styles.fieldLabel}>CATEGORY</Text>
                <Text style={styles.metaValue}>{item.category ?? "—"}</Text>
            </View>
            <View style={styles.gridColVariants}>
                <Text style={styles.fieldLabel}>VARIANTS</Text>
                <Text style={styles.variantsValue}>{item.variants ?? "0"}</Text>
            </View>
            <View style={styles.gridColStatus}>
                <Text style={styles.fieldLabel}>STATUS</Text>
                <View style={[styles.statusBadge, item.status === "Inactive" && styles.statusInactive]}>
                    <Text
                        style={[styles.statusText, item.status === "Inactive" && styles.statusTextInactive]}
                    >
                        {item.status}
                    </Text>
                </View>
            </View>
        </View>

        <View style={styles.actionRow}>
            <Text style={styles.fieldLabel}>ACTIONS</Text>
            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.editButton} activeOpacity={0.85} onPress={() => onEdit(item)}>
                    <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} activeOpacity={0.85} onPress={() => onDelete(item)}>
                    <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    </View>
);

const ShiftProductsSkuScreen = () => {
    const navigation = useFinanceNavigation();
    const [products, setProducts] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const fetchProducts = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                GETNETWORK(buildUrl("products", "limit=100"), true),
                GETNETWORK(buildUrl("categories"), true),
            ]);
            if (!isApiSuccess(productsRes)) {
                setLoadError(getApiMessage(productsRes, "Failed to load products"));
                setProducts([]);
            } else {
                setProducts(extractApiList(productsRes).map(mapProductRow));
                setLoadError("");
            }
            if (isApiSuccess(categoriesRes)) {
                setCategoryOptions(
                    extractApiList(categoriesRes).map((row) => ({
                        id: String(row.id),
                        name: row.name || row.category_name || "",
                    }))
                );
            }
        } catch {
            setLoadError("Failed to load products");
            setProducts([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);
    const [showPermissionAlert] = useState(true);

    const handleBack = useCallback(() => {
        if (showModal) {
            setShowModal(false);
            setEditingItem(null);
            return;
        }
        navigation.goBack();
    }, [navigation, showModal]);

    useEffect(() => {
        if (Platform.OS !== "android") {
            return undefined;
        }

        const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
            if (showModal) {
                setShowModal(false);
                setEditingItem(null);
                return true;
            }
            navigation.goBack();
            return true;
        });

        return () => subscription.remove();
    }, [navigation, showModal]);

    const onRefresh = useCallback(() => {
        fetchProducts(true);
    }, [fetchProducts]);

    const filteredProducts = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return products;
        return products.filter(
            (item) =>
                item.sku.toLowerCase().includes(query) ||
                item.name.toLowerCase().includes(query) ||
                (item.category && item.category.toLowerCase().includes(query)) ||
                item.status.toLowerCase().includes(query)
        );
    }, [search, products]);

    const openEditModal = (item) => {
        setEditingItem(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
    };

    const handleSaveProduct = async (form) => {
        const matchedCategory = categoryOptions.find((c) => c.name === form.category);
        const payload = {
            product_name: form.name,
            category_id: matchedCategory?.id ? Number(matchedCategory.id) : undefined,
            description: form.description || "",
            status: String(form.status || "active").toLowerCase(),
        };
        const res = form.id
            ? await PUTNETWORK(buildUrl(`products/${form.id}`), payload, true)
            : await POSTNETWORK(buildUrl("products"), payload, true);
        if (!isApiSuccess(res)) {
            Alert.alert("Error", getApiMessage(res, "Save failed"));
            return;
        }
        closeModal();
        fetchProducts(true);
    };

    const handleDelete = (item) => {
        Alert.alert("Delete Product", `Delete "${item.name}"?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    const res = await DELETENETWORK(buildUrl(`products/${item.id}`), true);
                    if (!isApiSuccess(res)) {
                        Alert.alert("Error", getApiMessage(res, "Delete failed"));
                        return;
                    }
                    fetchProducts(true);
                },
            },
        ]);
    };

    const listHeader = (
        <View>
            <View style={styles.pageHeader}>
                <Text style={styles.pageTitle}>Products & SKU</Text>
                <Text style={styles.pageSubtitle}>
                    Product master, variants, pricing & inventory
                </Text>
            </View>

            <View style={styles.summaryCard}>
                <View style={styles.summaryTop}>
                    <Text style={styles.summaryLabel}>TOTAL RECORDS</Text>
                    <View style={styles.summaryIconWrap}>
                        <Text style={styles.summaryIcon}>📊</Text>
                    </View>
                </View>
                <Text style={styles.summaryValue}>{products.length}</Text>
                <Text style={styles.summaryFooter}>
                    {loading ? "→ Loading..." : loadError ? `→ ${loadError}` : "→ From database"}
                </Text>
            </View>

            {showPermissionAlert ? (
                <View style={styles.permissionBanner}>
                    <Text style={styles.permissionText}>You do not have permission for this action</Text>
                </View>
            ) : null}

            <View style={styles.listSection}>
                <Text style={styles.sectionTitle}>Products & SKU</Text>
                <View style={styles.searchBox}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search..."
                        placeholderTextColor={TEXT_LIGHT}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>
        </View>
    );

    const listFooter = (
        <Text style={styles.footerText}>
            SpiceCraft ERP v3.0 • Logged in as Shift Supervisor (Shift Supervisor) • 27
        </Text>
    );

    return (
        <View style={styles.root}>
            <MyHeader
                showBack
                showCenterTitle
                title="Products & SKU"
                backgroundColor={WHITE}
                onBackPress={handleBack}
            />

            <SafeAreaView style={styles.safeArea} edges={[]}>
                <FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ProductCard item={item} onEdit={openEditModal} onDelete={handleDelete} />
                    )}
                    ListHeaderComponent={listHeader}
                    ListFooterComponent={listFooter}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[BRANDCOLOR]}
                            tintColor={BRANDCOLOR}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <Text style={styles.emptyText}>No products found</Text>
                        </View>
                    }
                />

                <ProductFormModal
                    visible={showModal}
                    editingItem={editingItem}
                    categoryOptions={categoryOptions}
                    onClose={closeModal}
                    onSave={handleSaveProduct}
                />
            </SafeAreaView>
        </View>
    );
};

export default ShiftProductsSkuScreen;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: SCREEN_BG,
    },
    safeArea: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    pageHeader: {
        paddingTop: 14,
        paddingBottom: 14,
    },
    pageTitle: {
        fontFamily: UBUNTUBOLD,
        fontSize: 22,
        color: TEXT_DARK,
        marginBottom: 6,
    },
    pageSubtitle: {
        fontFamily: FIRASANS,
        fontSize: 13,
        color: TEXT_MUTED,
        lineHeight: 18,
    },
    summaryCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        marginBottom: 12,
        maxWidth: 200,
    },
    summaryTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    summaryLabel: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 10,
        color: TEXT_MUTED,
        letterSpacing: 0.3,
    },
    summaryIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: "#DBEAFE",
        justifyContent: "center",
        alignItems: "center",
    },
    summaryIcon: {
        fontSize: 16,
    },
    summaryValue: {
        fontFamily: UBUNTUBOLD,
        fontSize: 28,
        color: TEXT_DARK,
        marginBottom: 4,
    },
    summaryFooter: {
        fontFamily: FIRASANS,
        fontSize: 11,
        color: TEXT_LIGHT,
    },
    permissionBanner: {
        backgroundColor: "#FEE2E2",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#FECACA",
    },
    permissionText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 13,
        color: "#B91C1C",
        lineHeight: 18,
    },
    listSection: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        padding: 14,
        marginBottom: 10,
    },
    sectionTitle: {
        fontFamily: UBUNTUBOLD,
        fontSize: 16,
        color: TEXT_DARK,
        marginBottom: 10,
    },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        paddingHorizontal: 12,
    },
    searchIcon: {
        fontSize: 14,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 11,
        fontFamily: FIRASANS,
        fontSize: 14,
        color: TEXT_DARK,
    },
    productCard: {
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    productGrid: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 12,
        alignItems: "flex-start",
    },
    gridColSku: {
        width: "28%",
    },
    gridColProduct: {
        flex: 1,
    },
    gridColCategory: {
        flex: 1,
    },
    gridColVariants: {
        width: "22%",
    },
    gridColStatus: {
        width: "26%",
    },
    fieldLabel: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 9,
        color: TEXT_MUTED,
        letterSpacing: 0.4,
        marginBottom: 4,
    },
    skuText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 13,
        color: PRIMARY_BLUE,
    },
    productName: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 15,
        color: TEXT_DARK,
        lineHeight: 20,
    },
    statusBadge: {
        alignSelf: "flex-start",
        backgroundColor: "#ECFDF5",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusInactive: {
        backgroundColor: "#F3F4F6",
    },
    statusText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 11,
        color: GREEN,
    },
    statusTextInactive: {
        color: TEXT_MUTED,
    },
    metaValue: {
        fontFamily: FIRASANS,
        fontSize: 12,
        color: TEXT_DARK,
        lineHeight: 16,
    },
    variantsValue: {
        fontFamily: UBUNTUBOLD,
        fontSize: 14,
        color: TEXT_DARK,
    },
    actionRow: {
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
        paddingTop: 12,
    },
    actionButtons: {
        flexDirection: "row",
        gap: 10,
        marginTop: 8,
    },
    editButton: {
        flex: 1,
        backgroundColor: PRIMARY_BLUE,
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: "center",
    },
    editButtonText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 13,
        color: WHITE,
    },
    deleteButton: {
        flex: 1,
        backgroundColor: "#FEE2E2",
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#FECACA",
    },
    deleteButtonText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 13,
        color: RED,
    },
    emptyWrap: {
        paddingVertical: 32,
        alignItems: "center",
    },
    emptyText: {
        fontFamily: FIRASANS,
        fontSize: 13,
        color: TEXT_LIGHT,
    },
    footerText: {
        fontFamily: FIRASANS,
        fontSize: 11,
        color: TEXT_LIGHT,
        textAlign: "center",
        marginTop: 8,
        lineHeight: 16,
    },
    fab: {
        position: "absolute",
        right: 20,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: PRIMARY_BLUE,
        justifyContent: "center",
        alignItems: "center",
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
    },
    fabIcon: {
        fontFamily: UBUNTUBOLD,
        fontSize: 28,
        color: WHITE,
        lineHeight: 30,
        marginTop: -2,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.45)",
    },
    modalKeyboard: {
        width: "100%",
        zIndex: 1,
    },
    modalCard: {
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: 20,
        maxHeight: "88%",
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontFamily: UBUNTUBOLD,
        fontSize: 20,
        color: TEXT_DARK,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
    },
    closeButtonText: {
        fontSize: 16,
        color: TEXT_MUTED,
    },
    formField: {
        marginBottom: 16,
    },
    formLabel: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 11,
        color: TEXT_MUTED,
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    required: {
        color: RED,
    },
    formInput: {
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontFamily: FIRASANS,
        fontSize: 15,
        color: TEXT_DARK,
    },
    textArea: {
        minHeight: 96,
        paddingTop: 12,
    },
    pickerField: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    pickerText: {
        fontFamily: FIRASANS,
        fontSize: 15,
        color: TEXT_DARK,
        flex: 1,
    },
    pickerPlaceholder: {
        color: TEXT_LIGHT,
    },
    pickerChevron: {
        fontSize: 12,
        color: TEXT_MUTED,
        marginLeft: 8,
    },
    imageRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    imagePreview: {
        width: 72,
        height: 72,
        borderRadius: 10,
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        justifyContent: "center",
        alignItems: "center",
    },
    imagePreviewIcon: {
        fontSize: 28,
    },
    uploadButton: {
        backgroundColor: "#F3F4F6",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
    },
    uploadButtonText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 13,
        color: TEXT_DARK,
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 16,
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 8,
    },
    cancelButtonText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 15,
        color: TEXT_MUTED,
    },
    saveButton: {
        backgroundColor: PRIMARY_BLUE,
        borderRadius: 10,
        paddingVertical: 11,
        paddingHorizontal: 22,
    },
    saveButtonText: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 15,
        color: WHITE,
    },
});
