import {
    WarehouseScreen,
    OrderManagementScreen,
    PrimarySalesScreen,
    SecondarySalesScreen,
    TertiarySalesScreen,
    DistributorScreen,
    SuperStockListScreen,
    BestPlanScreen,
    WholesalerScreen,
    DealerScreen,
    RetailerScreen,
    ModernTradeScreen,
    ChannelMgmtScreen,
    SfaDmsScreen,
    TradePromotionScreen,
    ClaimScreen,
    CollectionScreen,
    FinanceAccountsScreen,
    TransportDispatchScreen,
    AIAnalyticsScreen,
    SettingsUsersScreen,
} from "../screens/userScreens/shared/SubAdminModuleScreens";

/** Full list of modules that can be granted via Sub Admin access */
export const SUB_ADMIN_DRAWER_ITEMS = [
    { key: "Warehouse", label: "Warehouse", icon: "🏢" },
    { key: "OrderManagement", label: "Order Management", icon: "📦" },
    { key: "PrimarySales", label: "Primary Sales", icon: "📈" },
    { key: "SecondarySales", label: "Secondary Sales", icon: "📊" },
    { key: "TertiarySales", label: "Tertiary Sales", icon: "🏬" },
    { key: "Distributor", label: "Distributor", icon: "🚚" },
    { key: "SuperStockList", label: "Super Stocklist", icon: "📋" },
    { key: "BestPlan", label: "Best Plan", icon: "⭐" },
    { key: "Wholesaler", label: "Wholesaler", icon: "🏭" },
    { key: "Dealer", label: "Dealer", icon: "🤝" },
    { key: "Retailer", label: "Retailer", icon: "🏪" },
    { key: "ModernTrade", label: "Modern Trade", icon: "🛒" },
    { key: "ChannelMgmt", label: "Channel Mgmt", icon: "🔀" },
    { key: "SfaDms", label: "SFA/DMS", icon: "📱" },
    { key: "TradePromotion", label: "Trade Promotion", icon: "🎁" },
    { key: "Claim", label: "Claims", icon: "📝" },
    { key: "Collection", label: "Collections", icon: "💰" },
    { key: "FinanceAccounts", label: "Finance & Accounts", icon: "🏦" },
    { key: "TransportDispatch", label: "Transport & Dispatch", icon: "🚛" },
    { key: "AIAnalytics", label: "AI Analytics", icon: "🤖" },
    { key: "SettingsUsers", label: "Settings & Users", icon: "⚙️" },
];

/** Drawer keys already shown without Sub Admin — excluded from Sub Admin extras */
export const ROLE_BASE_DRAWER_KEYS = {
    finance: [
        "RawMaterial",
        "OrderManagement",
        "PrimarySales",
        "Distributor",
        "SuperStockList",
        "Claim",
        "Collection",
        "FinanceAccounts",
        "TransportDispatch",
        "AIAnalytics",
        "SettingsUsers",
    ],
    marketing: [
        "Categories",
        "ProductsSKU",
        "OrderManagement",
        "PrimarySales",
        "SecondarySales",
        "TertiarySales",
        "Distributor",
        "SuperStockList",
        "Wholesaler",
        "Dealer",
        "Retailer",
        "ModernTrade",
        "ChannelMgmt",
        "SfaDms",
        "TradePromotion",
        "Claim",
    ],
    shift: ["ProductsSKU", "RawMaterial", "ProductionBOM"],
    machine: ["ProductsSKU", "RawMaterial", "ProductionBOM"],
    production: [
        "ProductionRuns",
        "Commodities",
        "RawMaterial",
        "StockEntry",
        "Batches",
        "Inventory",
    ],
    qc: ["Notification", "Batches", "ProductionRuns", "RawMaterial", "Commodities", "Inventory"],
};

export const SUB_ADMIN_SCREEN_MAP = {
    Warehouse: WarehouseScreen,
    OrderManagement: OrderManagementScreen,
    PrimarySales: PrimarySalesScreen,
    SecondarySales: SecondarySalesScreen,
    TertiarySales: TertiarySalesScreen,
    Distributor: DistributorScreen,
    SuperStockList: SuperStockListScreen,
    BestPlan: BestPlanScreen,
    Wholesaler: WholesalerScreen,
    Dealer: DealerScreen,
    Retailer: RetailerScreen,
    ModernTrade: ModernTradeScreen,
    ChannelMgmt: ChannelMgmtScreen,
    SfaDms: SfaDmsScreen,
    TradePromotion: TradePromotionScreen,
    Claim: ClaimScreen,
    Collection: CollectionScreen,
    FinanceAccounts: FinanceAccountsScreen,
    TransportDispatch: TransportDispatchScreen,
    AIAnalytics: AIAnalyticsScreen,
    SettingsUsers: SettingsUsersScreen,
};

export const normalizeDrawerRole = (role) => {
    if (!role) return "finance";
    const key = String(role).toLowerCase();
    if (key === "shiftsupervisor" || key === "shift_supervisor") return "shift";
    if (key === "machineoperator" || key === "machine_operator" || key === "machine") return "machine";
    if (key === "productionmanager" || key === "production_manager") return "production";
    if (key === "qcinspector" || key === "qc_inspector" || key === "quality_inspector") return "qc";
    if (["admin", "distributor", "dealer", "wholesaler", "retailer", "asm", "so", "vehicle", "transport", "nsm", "rsm", "store", "packing"].includes(key)) {
        return key;
    }
    return key;
};

export const isSubAdminSession = (loginResponse) => {
    if (!loginResponse) return false;
    if (loginResponse.isSubAdmin === true) return true;
    return String(loginResponse.email || "").toLowerCase().includes("subadmin");
};

export const getSubAdminDrawerItemsForRole = (role) => {
    const normalizedRole = normalizeDrawerRole(role);
    const baseKeys = new Set(ROLE_BASE_DRAWER_KEYS[normalizedRole] || []);
    return SUB_ADMIN_DRAWER_ITEMS.filter((item) => !baseKeys.has(item.key)).map((item) => ({
        ...item,
        isSubAdminItem: true,
    }));
};

export const mergeDrawerConfigWithSubAdmin = (config, role, isSubAdmin) => {
    if (!isSubAdmin || !config) {
        return config;
    }

    const normalizedRole = normalizeDrawerRole(role);
    const subAdminItems = getSubAdminDrawerItemsForRole(normalizedRole);
    if (!subAdminItems.length) {
        return config;
    }

    return {
        ...config,
        items: [...config.items, ...subAdminItems],
        stackMap: {
            ...config.stackMap,
            ...SUB_ADMIN_SCREEN_MAP,
        },
        isSubAdmin: true,
    };
};
