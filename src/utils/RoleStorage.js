import {
    getObjByKey,
    storeObjByKey,
    storeStringByKey,
    getStringByKey,
    deleteByKeys,
} from "./Storage";

export const LOGIN_RESPONSE_KEY = "loginResponse";
export const SKIP_SPLASH_KEY = "skipSplash";
export const AUTH_ROLE_KEY = "authRole";
const TOKEN_PREFIX = "authToken_";

const getRoleTokenKey = (role) => `${TOKEN_PREFIX}${role}`;

/** Persist a string value in AsyncStorage (via Storage.js). */
export const storeTokenByKey = async (key, value) => {
    if (!key || value == null || value === "") return;
    await storeStringByKey(key, value);
};

/** Read a string value from AsyncStorage (via Storage.js). */
export const getTokenByKey = async (key) => {
    if (!key) return null;
    return getStringByKey(key);
};

export const storeToken = async (role, token) => {
    if (!role || !token) return;
    await storeTokenByKey(getRoleTokenKey(role), token);
    await storeTokenByKey(AUTH_ROLE_KEY, role);
};

export const getToken = async (role) => {
    const resolvedRole = role || (await getTokenByKey(AUTH_ROLE_KEY));
    if (resolvedRole) {
        const roleToken = await getTokenByKey(getRoleTokenKey(resolvedRole));
        if (roleToken) return roleToken;
    }

    const session = await getLoginSession();
    return session?.token || null;
};

export const getStoredRole = () => getTokenByKey(AUTH_ROLE_KEY);

export const clearAuthToken = async () => {
    const role = await getTokenByKey(AUTH_ROLE_KEY);
    const keys = [AUTH_ROLE_KEY];
    if (role) keys.push(getRoleTokenKey(role));
    await deleteByKeys(keys);
};

const ATTENDANCE_KEY_BY_ROLE = {
    finance: "attendance_finance",
    marketing: "attendance_marketing",
    shift: "attendance_shift",
    machine: "attendance_machine",
    production: "attendance_production",
    qc: "attendance_qc",
    store: "attendance_store",
    packing: "attendance_packing",
    nsm: "attendance_nsm",
    rsm: "attendance_rsm",
    admin: "attendance_admin",
    asm: "attendance_asm",
    so: "attendance_so",
    distributor: "attendance_distributor",
    dealer: "attendance_dealer",
    wholesaler: "attendance_wholesaler",
    retailer: "attendance_retailer",
    vehicle: "attendance_vehicle",
    transport: "attendance_transport",
};

export const getAttendanceStorageKey = (role) =>
    ATTENDANCE_KEY_BY_ROLE[role] || `attendance_${role || "finance"}`;

export const getRoleStorageKey = (role, suffix) =>
    `${String(role || "finance")}_${suffix}`;

export const getLoginSession = () => getObjByKey(LOGIN_RESPONSE_KEY);

export const saveLoginSession = (session) => storeObjByKey(LOGIN_RESPONSE_KEY, session);

export const getSkipSplash = () => getStringByKey(SKIP_SPLASH_KEY);

export const setSkipSplash = (value = "true") => storeStringByKey(SKIP_SPLASH_KEY, value);
