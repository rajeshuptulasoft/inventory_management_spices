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
    ProductionCategoriesScreen,
    ProductionProductsSkuScreen,
    ProductionBarcodeTrackerScreen,
    ProductionRawMaterialScreen,
    ProductionProductionBomScreen,
} from "./ProductionDrawerScreens";

import {
    QcRawMaterialScreen,
    QcProductsSkuScreen,
    QcProductionBomScreen,
    QcNotificationScreen,
} from "./QcInspectorDrawerScreens";

import {
    StoreProductsSkuScreen,
    StoreBarcodeTrackerScreen,
    StoreRawMaterialScreen,
    StoreProductionBomScreen,
    StoreWarehouseScreen,
    StoreTransportDispatchScreen,
    StoreNotificationScreen,
} from "./StoreKeeperDrawerScreens";

import {
    PackingRawMaterialScreen,
    PackingProductsSkuScreen,
    PackingBarcodeTrackerScreen,
    PackingProductionBomScreen,
    PackingWarehouseScreen,
    PackingNotificationScreen,
} from "./PackingSupervisorDrawerScreens";

import {
    NsmNotificationScreen,
} from "./NsmDrawerScreens";

import {
    RsmNotificationScreen,
} from "./RsmDrawerScreens";

import {
    DistributorNotificationScreen,
} from "./DistributorDrawerScreens";

import {
    DealerNotificationScreen,
} from "./DealerDrawerScreens";

import {
    WholesalerNotificationScreen,
} from "./WholesalerDrawerScreens";

import {
    RetailerNotificationScreen,
} from "./RetailerDrawerScreens";

import {
    AsmNotificationScreen,
} from "./AsmDrawerScreens";

import {
    SoNotificationScreen,
} from "./SoDrawerScreens";

import {
    VehicleNotificationScreen,
} from "./VehicleDrawerScreens";

import {
    AdminRoleAuditScreen,
    AdminCategoriesScreen,
    AdminNotificationScreen,
} from "./AdminDrawerScreens";

import { mergeDrawerConfigWithSubAdmin } from "./subAdminDrawer";
import {
    SecondarySalesScreen,
    TertiarySalesScreen,
    DistributorScreen,
    SuperStockListScreen,
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
    OrderManagementScreen as SharedOrderManagementScreen,
    PrimarySalesScreen as SharedPrimarySalesScreen,
    BestPlanScreen,
    WarehouseScreen,
} from "../screens/userScreens/shared/SubAdminModuleScreens";

export const FINANCE_DRAWER_ITEMS = [
    { key: "RawMaterial", label: "Raw Materials", icon: "🌿" },
    { key: "OrderManagement", label: "Order Management", icon: "📦" },
    { key: "PrimarySales", label: "Primary Sales", icon: "📈" },
    { key: "Distributor", label: "Distributor", icon: "🚚" },
    { key: "SuperStockList", label: "Super Stocklists", icon: "📋" },
    { key: "Claim", label: "Claims", icon: "📝" },
    { key: "Collection", label: "Collections", icon: "💰" },
    { key: "FinanceAccounts", label: "Finance & Accounts", icon: "🏦" },
    { key: "AIAnalytics", label: "AI Analytics", icon: "🤖" },
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
    { key: "Categories", label: "Categories", icon: "📂" },
    { key: "ProductsSKU", label: "Products & SKU", icon: "🏷️" },
    { key: "BarcodeTracker", label: "Barcode Tracker", icon: "📊" },
    { key: "RawMaterial", label: "Raw Materials", icon: "🧪" },
    { key: "ProductionBOM", label: "Production & BOM", icon: "🏭" },
    { key: "Warehouse", label: "Warehouse & WMS", icon: "🏢" },
    { key: "TransportDispatch", label: "Transport & Dispatch", icon: "🚛" },
    { key: "AIAnalytics", label: "AI Analytics", icon: "🤖" },
];

export const QC_DRAWER_ITEMS = [
    { key: "RawMaterial", label: "Raw Materials", icon: "🧪" },
    { key: "ProductsSKU", label: "Products & SKU", icon: "🏷️" },
    { key: "ProductionBOM", label: "Production & BOM", icon: "🏭" },
];

export const STORE_DRAWER_ITEMS = [
    { key: "ProductsSKU", label: "Products & SKU", icon: "🏷️" },
    { key: "BarcodeTracker", label: "Barcode Tracker", icon: "📊" },
    { key: "RawMaterial", label: "Raw Materials", icon: "🧪" },
    { key: "ProductionBOM", label: "Production & BOM", icon: "🏭" },
    { key: "Warehouse", label: "Warehouse & WMS", icon: "🏢" },
    { key: "TransportDispatch", label: "Transport & Dispatch", icon: "🚛" },
];

export const PACKING_DRAWER_ITEMS = [
    { key: "RawMaterial", label: "Raw Materials", icon: "🌿" },
    { key: "ProductsSKU", label: "Products & SKU", icon: "🏷️" },
    { key: "BarcodeTracker", label: "Barcode Tracker", icon: "📊" },
    { key: "ProductionBOM", label: "Production & BOM", icon: "🏭" },
    { key: "Warehouse", label: "Warehouse & WMS", icon: "🏢" },
];

export const NSM_DRAWER_ITEMS = [
    { key: "OrderManagement", label: "Order Management", icon: "📦" },
    { key: "PrimarySales", label: "Primary Sales", icon: "📈" },
    { key: "SecondarySales", label: "Secondary Sales", icon: "📊" },
    { key: "TertiarySales", label: "Tertiary Sales", icon: "🏬" },
    { key: "Distributor", label: "Distributor", icon: "🚚" },
    { key: "SuperStockList", label: "Super Stocklist", icon: "📋" },
    { key: "BestPlan", label: "Best Plans", icon: "⭐" },
    { key: "Wholesaler", label: "Wholesaler", icon: "🏭" },
    { key: "Dealer", label: "Dealer", icon: "🤝" },
    { key: "Retailer", label: "Retailer", icon: "🏪" },
    { key: "ModernTrade", label: "Modern Trade", icon: "🛒" },
    { key: "ChannelMgmt", label: "Channel Mgmt", icon: "🔀" },
    { key: "SfaDms", label: "SFA / DMS", icon: "📱" },
    { key: "TradePromotion", label: "Trade Promotion", icon: "🎁" },
    { key: "Claim", label: "Claims", icon: "📝" },
    { key: "Collection", label: "Collections", icon: "💰" },
    { key: "FinanceAccounts", label: "Finance & Accounts", icon: "🏦" },
    { key: "AIAnalytics", label: "AI Analytics", icon: "🤖" },
];

export const RSM_DRAWER_ITEMS = [
    { key: "PrimarySales", label: "Primary Sales", icon: "📈" },
    { key: "SecondarySales", label: "Secondary Sales", icon: "📊" },
    { key: "TertiarySales", label: "Tertiary Sales", icon: "🏬" },
    { key: "Distributor", label: "Distributor", icon: "🚚" },
    { key: "SuperStockList", label: "Super Stocklist", icon: "📋" },
    { key: "BestPlan", label: "Best Plans", icon: "⭐" },
    { key: "Wholesaler", label: "Wholesaler", icon: "🏭" },
    { key: "Dealer", label: "Dealer", icon: "🤝" },
    { key: "Retailer", label: "Retailer", icon: "🏪" },
    { key: "ModernTrade", label: "Modern Trade", icon: "🛒" },
    { key: "SfaDms", label: "SFA / DMS", icon: "📱" },
    { key: "TradePromotion", label: "Trade Promotion", icon: "🎁" },
    { key: "Claim", label: "Claims", icon: "📝" },
    { key: "Collection", label: "Collections", icon: "💰" },
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
    Categories: ProductionCategoriesScreen,
    ProductsSKU: ProductionProductsSkuScreen,
    BarcodeTracker: ProductionBarcodeTrackerScreen,
    RawMaterial: ProductionRawMaterialScreen,
    ProductionBOM: ProductionProductionBomScreen,
    Warehouse: WarehouseScreen,
    TransportDispatch: TransportDispatchScreen,
    AIAnalytics: AIAnalyticsScreen,
};

export const QC_STACK_SCREEN_MAP = {
    Notification: QcNotificationScreen,
    RawMaterial: QcRawMaterialScreen,
    ProductsSKU: QcProductsSkuScreen,
    ProductionBOM: QcProductionBomScreen,
};

export const STORE_STACK_SCREEN_MAP = {
    ProductsSKU: StoreProductsSkuScreen,
    BarcodeTracker: StoreBarcodeTrackerScreen,
    RawMaterial: StoreRawMaterialScreen,
    ProductionBOM: StoreProductionBomScreen,
    Warehouse: StoreWarehouseScreen,
    TransportDispatch: StoreTransportDispatchScreen,
    Notification: StoreNotificationScreen,
};

export const PACKING_STACK_SCREEN_MAP = {
    RawMaterial: PackingRawMaterialScreen,
    ProductsSKU: PackingProductsSkuScreen,
    BarcodeTracker: PackingBarcodeTrackerScreen,
    ProductionBOM: PackingProductionBomScreen,
    Warehouse: PackingWarehouseScreen,
    Notification: PackingNotificationScreen,
};

export const NSM_STACK_SCREEN_MAP = {
    Notification: NsmNotificationScreen,
    OrderManagement: SharedOrderManagementScreen,
    PrimarySales: SharedPrimarySalesScreen,
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
    AIAnalytics: AIAnalyticsScreen,
};

export const RSM_STACK_SCREEN_MAP = {
    Notification: RsmNotificationScreen,
    PrimarySales: SharedPrimarySalesScreen,
    SecondarySales: SecondarySalesScreen,
    TertiarySales: TertiarySalesScreen,
    Distributor: DistributorScreen,
    SuperStockList: SuperStockListScreen,
    BestPlan: BestPlanScreen,
    Wholesaler: WholesalerScreen,
    Dealer: DealerScreen,
    Retailer: RetailerScreen,
    ModernTrade: ModernTradeScreen,
    SfaDms: SfaDmsScreen,
    TradePromotion: TradePromotionScreen,
    Claim: ClaimScreen,
    Collection: CollectionScreen,
};

const ASM_SO_DRAWER_ITEMS = [
    { key: "OrderManagement", label: "Order Management", icon: "📦" },
    { key: "PrimarySales", label: "Primary Sales", icon: "📈" },
    { key: "SecondarySales", label: "Secondary Sales", icon: "📊" },
    { key: "TertiarySales", label: "Tertiary Sales", icon: "🏬" },
    { key: "Distributor", label: "Distributor", icon: "🚚" },
    { key: "SuperStockList", label: "Super Stocklist", icon: "📋" },
    { key: "BestPlan", label: "Best Plans", icon: "⭐" },
    { key: "Wholesaler", label: "Wholesaler", icon: "🏭" },
    { key: "Dealer", label: "Dealer", icon: "🤝" },
    { key: "Retailer", label: "Retailers", icon: "🏪" },
    { key: "ModernTrade", label: "Modern Trade", icon: "🛒" },
    { key: "SfaDms", label: "SFA / DMS", icon: "📱" },
    { key: "TradePromotion", label: "Trade Promotion", icon: "🎁" },
    { key: "Claim", label: "Claims", icon: "📝" },
    { key: "Collection", label: "Collections", icon: "💰" },
];

export const ASM_DRAWER_ITEMS = ASM_SO_DRAWER_ITEMS;
export const SO_DRAWER_ITEMS = ASM_SO_DRAWER_ITEMS;

const ASM_SO_STACK_SCREEN_MAP = {
    OrderManagement: SharedOrderManagementScreen,
    PrimarySales: SharedPrimarySalesScreen,
    SecondarySales: SecondarySalesScreen,
    TertiarySales: TertiarySalesScreen,
    Distributor: DistributorScreen,
    SuperStockList: SuperStockListScreen,
    BestPlan: BestPlanScreen,
    Wholesaler: WholesalerScreen,
    Dealer: DealerScreen,
    Retailer: RetailerScreen,
    ModernTrade: ModernTradeScreen,
    SfaDms: SfaDmsScreen,
    TradePromotion: TradePromotionScreen,
    Claim: ClaimScreen,
    Collection: CollectionScreen,
};

export const ADMIN_DRAWER_ITEMS = [
    { key: "RoleAudit", label: "Role Audit", icon: "📋" },
    { key: "Categories", label: "Categories", icon: "📂" },
    { key: "Notification", label: "Notifications", icon: "🔔" },
];

export const DISTRIBUTOR_DRAWER_ITEMS = [
    { key: "OrderManagement", label: "Order Management", icon: "📦" },
    { key: "PrimarySales", label: "Primary Sales", icon: "📈" },
    { key: "SecondarySales", label: "Secondary Sales", icon: "📊" },
    { key: "Distributor", label: "Distributor", icon: "🚚" },
    { key: "Claim", label: "Claims", icon: "📝" },
];

export const DEALER_DRAWER_ITEMS = [
    { key: "OrderManagement", label: "Order Management", icon: "📦" },
    { key: "Dealer", label: "Dealers", icon: "🤝" },
];

export const WHOLESALER_DRAWER_ITEMS = [
    { key: "OrderManagement", label: "Order Management", icon: "📦" },
    { key: "Wholesaler", label: "Wholesalers", icon: "🏭" },
    { key: "Claim", label: "Claims", icon: "📝" },
];

export const RETAILER_DRAWER_ITEMS = [];

export const VEHICLE_DRAWER_ITEMS = [];

export const ADMIN_STACK_SCREEN_MAP = {
    RoleAudit: AdminRoleAuditScreen,
    Categories: AdminCategoriesScreen,
    Notification: AdminNotificationScreen,
};

export const DISTRIBUTOR_STACK_SCREEN_MAP = {
    Notification: DistributorNotificationScreen,
    OrderManagement: SharedOrderManagementScreen,
    PrimarySales: SharedPrimarySalesScreen,
    SecondarySales: SecondarySalesScreen,
    Distributor: DistributorScreen,
    Claim: ClaimScreen,
};

export const DEALER_STACK_SCREEN_MAP = {
    Notification: DealerNotificationScreen,
    OrderManagement: SharedOrderManagementScreen,
    Dealer: DealerScreen,
};

export const WHOLESALER_STACK_SCREEN_MAP = {
    Notification: WholesalerNotificationScreen,
    OrderManagement: SharedOrderManagementScreen,
    Wholesaler: WholesalerScreen,
    Claim: ClaimScreen,
};

export const RETAILER_STACK_SCREEN_MAP = {
    Notification: RetailerNotificationScreen,
};

export const ASM_STACK_SCREEN_MAP = {
    Notification: AsmNotificationScreen,
    ...ASM_SO_STACK_SCREEN_MAP,
};

export const SO_STACK_SCREEN_MAP = {
    Notification: SoNotificationScreen,
    ...ASM_SO_STACK_SCREEN_MAP,
};

export const VEHICLE_STACK_SCREEN_MAP = {
    Notification: VehicleNotificationScreen,
};

export const TRANSPORT_DRAWER_ITEMS = VEHICLE_DRAWER_ITEMS;
export const TRANSPORT_STACK_SCREEN_MAP = VEHICLE_STACK_SCREEN_MAP;

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
    qc: {
        items: QC_DRAWER_ITEMS,
        stackMap: QC_STACK_SCREEN_MAP,
        userName: "QC Inspector",
        userRole: "Quality Control",
        profileInitial: "Q",
    },
    store: {
        items: STORE_DRAWER_ITEMS,
        stackMap: STORE_STACK_SCREEN_MAP,
        userName: "Store Keeper",
        userRole: "Warehouse",
        profileInitial: "W",
    },
    packing: {
        items: PACKING_DRAWER_ITEMS,
        stackMap: PACKING_STACK_SCREEN_MAP,
        userName: "Packing Supervisor",
        userRole: "Production Floor",
        profileInitial: "P",
    },
    nsm: {
        items: NSM_DRAWER_ITEMS,
        stackMap: NSM_STACK_SCREEN_MAP,
        userName: "National Sales Manager",
        userRole: "Sales Leadership",
        profileInitial: "N",
    },
    rsm: {
        items: RSM_DRAWER_ITEMS,
        stackMap: RSM_STACK_SCREEN_MAP,
        userName: "Regional Sales Manager",
        userRole: "Regional Sales",
        profileInitial: "R",
    },
    admin: {
        items: ADMIN_DRAWER_ITEMS,
        stackMap: ADMIN_STACK_SCREEN_MAP,
        userName: "Administrator",
        userRole: "Admin",
        profileInitial: "A",
    },
    distributor: {
        items: DISTRIBUTOR_DRAWER_ITEMS,
        stackMap: DISTRIBUTOR_STACK_SCREEN_MAP,
        userName: "Distributor",
        userRole: "Distribution Channel",
        profileInitial: "D",
    },
    dealer: {
        items: DEALER_DRAWER_ITEMS,
        stackMap: DEALER_STACK_SCREEN_MAP,
        userName: "Dealer",
        userRole: "Dealer Channel",
        profileInitial: "D",
    },
    wholesaler: {
        items: WHOLESALER_DRAWER_ITEMS,
        stackMap: WHOLESALER_STACK_SCREEN_MAP,
        userName: "Wholesaler",
        userRole: "Wholesale Channel",
        profileInitial: "W",
    },
    retailer: {
        items: RETAILER_DRAWER_ITEMS,
        stackMap: RETAILER_STACK_SCREEN_MAP,
        userName: "Retailer",
        userRole: "Retail Channel",
        profileInitial: "R",
    },
    asm: {
        items: ASM_DRAWER_ITEMS,
        stackMap: ASM_STACK_SCREEN_MAP,
        userName: "Area Sales Manager",
        userRole: "Field Sales",
        profileInitial: "A",
    },
    so: {
        items: SO_DRAWER_ITEMS,
        stackMap: SO_STACK_SCREEN_MAP,
        userName: "Sales Officer",
        userRole: "Field Sales",
        profileInitial: "S",
    },
    vehicle: {
        items: VEHICLE_DRAWER_ITEMS,
        stackMap: VEHICLE_STACK_SCREEN_MAP,
        userName: "Vehicle Operator",
        userRole: "Fleet & Logistics",
        profileInitial: "V",
    },
    transport: {
        items: TRANSPORT_DRAWER_ITEMS,
        stackMap: TRANSPORT_STACK_SCREEN_MAP,
        userName: "Transport",
        userRole: "Logistics",
        profileInitial: "T",
    },
};

export const getDrawerConfig = (role, isSubAdmin = false) => {
    const normalizedRole =
        role === "shift" ||
        role === "finance" ||
        role === "marketing" ||
        role === "machine" ||
        role === "production" ||
        role === "qc" ||
        role === "store" ||
        role === "packing" ||
        role === "nsm" ||
        role === "rsm" ||
        role === "admin" ||
        role === "distributor" ||
        role === "dealer" ||
        role === "wholesaler" ||
        role === "retailer" ||
        role === "asm" ||
        role === "so" ||
        role === "vehicle" ||
        role === "transport"
            ? role
            : "finance";
    const config = DRAWER_CONFIG[normalizedRole] || DRAWER_CONFIG.finance;
    return mergeDrawerConfigWithSubAdmin(config, normalizedRole, isSubAdmin);
};
