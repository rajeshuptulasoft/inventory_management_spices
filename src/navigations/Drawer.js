import RawMaterialScreen from "../screens/userScreens/finaceHeaderScreen/RawMaterialScreen";
import OrderManagementScreen from "../screens/userScreens/finaceHeaderScreen/OrderManagementScreen";
import PrimarySalesScreen from "../screens/userScreens/finaceHeaderScreen/PrimarySalesScreen";
import FinanceNotificationScreen from "../screens/userScreens/finaceHeaderScreen/FinanceNotificationScreen";
import MarketingNotificationScreen from "../screens/userScreens/marketingHeadScreen/MarketingNotificationScreen";
import ShiftNotificationScreen from "../screens/userScreens/shiftSupervisorScreen/ShiftNotificationScreen";

import {
    MarketingCategoriesScreen,
    MarketingProductsSkuScreen,
    MarketingOrderManagementScreen,
    MarketingPrimarySalesScreen,
} from "./MarketingDrawerScreens";

import {
    ShiftProductsSkuScreen,
    ShiftRawMaterialScreen,
    ShiftProductionBomScreen,
} from "./ShiftDrawerScreens";

import {
    MachineProductsSkuScreen,
    MachineRawMaterialScreen,
    MachineProductionBomScreen,
} from "./MachineDrawerScreens";

import MachineNotificationScreen from "../screens/userScreens/machineOperatorScreen/MachineNotificationScreen";
import ProductionNotificationScreen from "../screens/userScreens/productionManagerScreen/ProductionNotificationScreen";

import {
    ProductionRunsScreen,
    ProductionCommoditiesScreen,
    ProductionRawMaterialScreen,
    ProductionStockEntryScreen,
    ProductionBatchScreen,
    ProductionInventoryScreen,
} from "./ProductionDrawerScreens";

import { mergeDrawerConfigWithSubAdmin } from "./subAdminDrawer";
import { SecondarySalesScreen, TertiarySalesScreen, DistributorScreen, SuperStockListScreen, WholesalerScreen, DealerScreen, RetailerScreen, ModernTradeScreen, ChannelMgmtScreen, SfaDmsScreen, TradePromotionScreen, ClaimScreen, CollectionScreen, FinanceAccountsScreen, TransportDispatchScreen, AIAnalyticsScreen, SettingsUsersScreen } from "../screens/userScreens/shared/SubAdminModuleScreens";

export const FINANCE_DRAWER_ITEMS = [
    { key: "RawMaterial", label: "Raw Materials", icon: "🌿" },
    { key: "OrderManagement", label: "Order Management", icon: "📦" },
    { key: "PrimarySales", label: "Primary Sales", icon: "📈" },
    { key: "Distributor", label: "Distributor", icon: "🚚" },
    { key: "SuperStockList", label: "Super Stocklists", icon: "📋" },
    { key: "Claim", label: "Claim", icon: "📝" },
    { key: "Collection", label: "Collections", icon: "💰" },
    { key: "FinanceAccounts", label: "Finance & Accounts", icon: "🏦" },
    { key: "TransportDispatch", label: "Transport & Dispatch", icon: "🚛" },
    { key: "AIAnalytics", label: "AI Analytics", icon: "🤖" },
    { key: "SettingsUsers", label: "Settings & Users", icon: "⚙️" },
];

export const MARKETING_DRAWER_ITEMS = [
    { key: "Categories", label: "Categories", icon: "📂" },
    { key: "ProductsSKU", label: "Products & SKU", icon: "🏷️" },
    { key: "OrderManagement", label: "Order Management", icon: "📦" },
    { key: "PrimarySales", label: "Primary Sales", icon: "📈" },
    { key: "SecondarySales", label: "Secondary Sales", icon: "📊" },
    { key: "TertiarySales", label: "Tertiary Sales", icon: "🏬" },
    { key: "Distributor", label: "Distributor", icon: "🚚" },
    { key: "SuperStockList", label: "Super Stocklist", icon: "📋" },
    { key: "Wholesaler", label: "Wholesaler", icon: "🏭" },
    { key: "Dealer", label: "Dealer", icon: "🤝" },
    { key: "Retailer", label: "Retailer", icon: "🏪" },
    { key: "ModernTrade", label: "Modern Trade", icon: "🛒" },
    { key: "ChannelMgmt", label: "Channel Mgmt", icon: "🔀" },
    { key: "SfaDms", label: "SFA/DMS", icon: "📱" },
    { key: "TradePromotion", label: "Trade Promotion", icon: "🎁" },
    { key: "Claim", label: "Claims", icon: "📝" },
];

export const SHIFT_DRAWER_ITEMS = [
    { key: "ProductsSKU", label: "Products & SKU", icon: "🏷️" },
    { key: "RawMaterial", label: "Raw Materials", icon: "🌿" },
    { key: "ProductionBOM", label: "Production & BOM", icon: "🏭" },
];

export const MACHINE_DRAWER_ITEMS = [
    { key: "ProductsSKU", label: "Products & SKU", icon: "🏷️" },
    { key: "RawMaterial", label: "Raw Materials", icon: "🌿" },
    { key: "ProductionBOM", label: "Production & BOM", icon: "🏭" },
];

export const PRODUCTION_DRAWER_ITEMS = [
    { key: "ProductionRuns", label: "Production", icon: "🏭" },
    { key: "Commodities", label: "Commodities", icon: "🌾" },
    { key: "RawMaterial", label: "Raw Materials", icon: "🧪" },
    { key: "StockEntry", label: "Stock Entry", icon: "➕" },
    { key: "Batches", label: "Batches", icon: "📅" },
    { key: "Inventory", label: "Inventory", icon: "📦" },
];

export const FINANCE_STACK_SCREEN_MAP = {
    Notification: FinanceNotificationScreen,
    RawMaterial: RawMaterialScreen,
    OrderManagement: OrderManagementScreen,
    PrimarySales: PrimarySalesScreen,
    Distributor: DistributorScreen,
    SuperStockList: SuperStockListScreen,
    Claim: ClaimScreen,
    Collection: CollectionScreen,
    FinanceAccounts: FinanceAccountsScreen,
    TransportDispatch: TransportDispatchScreen,
    AIAnalytics: AIAnalyticsScreen,
    SettingsUsers: SettingsUsersScreen,
};

export const MARKETING_STACK_SCREEN_MAP = {
    Notification: MarketingNotificationScreen,
    Categories: MarketingCategoriesScreen,
    ProductsSKU: MarketingProductsSkuScreen,
    OrderManagement: MarketingOrderManagementScreen,
    PrimarySales: MarketingPrimarySalesScreen,
    SecondarySales: SecondarySalesScreen,
    TertiarySales: TertiarySalesScreen,
    Distributor: DistributorScreen,
    SuperStockList: SuperStockListScreen,
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

export const SHIFT_STACK_SCREEN_MAP = {
    Notification: ShiftNotificationScreen,
    ProductsSKU: ShiftProductsSkuScreen,
    RawMaterial: ShiftRawMaterialScreen,
    ProductionBOM: ShiftProductionBomScreen,
    Collection: CollectionScreen,
    FinanceAccounts: FinanceAccountsScreen,
    TransportDispatch: TransportDispatchScreen,
    AIAnalytics: AIAnalyticsScreen,
    SettingsUsers: SettingsUsersScreen,
};

export const MACHINE_STACK_SCREEN_MAP = {
    Notification: MachineNotificationScreen,
    ProductsSKU: MachineProductsSkuScreen,
    RawMaterial: MachineRawMaterialScreen,
    ProductionBOM: MachineProductionBomScreen,
    Collection: CollectionScreen,
    FinanceAccounts: FinanceAccountsScreen,
    TransportDispatch: TransportDispatchScreen,
    AIAnalytics: AIAnalyticsScreen,
    SettingsUsers: SettingsUsersScreen,
};

export const PRODUCTION_STACK_SCREEN_MAP = {
    Notification: ProductionNotificationScreen,
    ProductionRuns: ProductionRunsScreen,
    Commodities: ProductionCommoditiesScreen,
    RawMaterial: ProductionRawMaterialScreen,
    StockEntry: ProductionStockEntryScreen,
    Batches: ProductionBatchScreen,
    Inventory: ProductionInventoryScreen,
    Collection: CollectionScreen,
    FinanceAccounts: FinanceAccountsScreen,
    TransportDispatch: TransportDispatchScreen,
    AIAnalytics: AIAnalyticsScreen,
    SettingsUsers: SettingsUsersScreen,
};

export const DRAWER_CONFIG = {
    finance: {
        items: FINANCE_DRAWER_ITEMS,
        stackMap: FINANCE_STACK_SCREEN_MAP,
        userName: "Priya Sharma",
        userRole: "Finance Department",
        profileInitial: "P",
    },
    marketing: {
        items: MARKETING_DRAWER_ITEMS,
        stackMap: MARKETING_STACK_SCREEN_MAP,
        userName: "Anita Verma",
        userRole: "Marketing Department",
        profileInitial: "M",
    },
    shift: {
        items: SHIFT_DRAWER_ITEMS,
        stackMap: SHIFT_STACK_SCREEN_MAP,
        userName: "Vikram Singh",
        userRole: "Production & Shift",
        profileInitial: "S",
    },
    machine: {
        items: MACHINE_DRAWER_ITEMS,
        stackMap: MACHINE_STACK_SCREEN_MAP,
        userName: "Machine Operator",
        userRole: "Machine Operator",
        profileInitial: "M",
    },
    production: {
        items: PRODUCTION_DRAWER_ITEMS,
        stackMap: PRODUCTION_STACK_SCREEN_MAP,
        userName: "Production Manager",
        userRole: "Production Manager",
        profileInitial: "P",
    },
};

export const getDrawerConfig = (role, isSubAdmin = false) => {
    const normalizedRole =
        role === "shift" ||
        role === "finance" ||
        role === "marketing" ||
        role === "machine" ||
        role === "production"
            ? role
            : "finance";
    const config = DRAWER_CONFIG[normalizedRole] || DRAWER_CONFIG.finance;
    return mergeDrawerConfigWithSubAdmin(config, normalizedRole, isSubAdmin);
};
