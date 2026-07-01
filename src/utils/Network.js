import { getToken, getLoginSession } from "./RoleStorage";
import { BASE_URL } from "../constant/url";

export const buildUrl = (path = "", query = "") => {
    let cleanPath = String(path).replace(/^\//, "");

    // BASE_URL already ends with /api/v1/ — strip duplicate prefixes from paths
    cleanPath = cleanPath
        .replace(/^api\/v1\//i, "")
        .replace(/^v1\//i, "")
        .replace(/^api\//i, "");

    const base = String(BASE_URL).replace(/\/?$/, "/");
    const url = `${base}${cleanPath}`;
    if (!query) return url;
    const q = String(query).startsWith("?") ? query : `?${query}`;
    return `${url}${q}`;
};

export const extractApiData = (res) => {
    if (!res || res.error) return null;
    if (Array.isArray(res.data)) return res.data;
    if (res.data && typeof res.data === "object") return res.data;
    if (Array.isArray(res)) return res;
    return res.data ?? null;
};

const TOKEN_FIELD_KEYS = [
    "accessToken",
    "access_token",
    "token",
    "jwt",
    "jwtToken",
    "authToken",
    "bearerToken",
];

const REFRESH_TOKEN_KEYS = ["refreshToken", "refresh_token"];

const deepFindStringValue = (obj, keys, depth = 0, seen = new Set()) => {
    if (!obj || typeof obj !== "object" || depth > 6) return null;
    if (seen.has(obj)) return null;
    seen.add(obj);

    for (const key of keys) {
        const value = obj[key];
        if (value && typeof value === "string" && value.length > 10) {
            return value;
        }
    }

    for (const value of Object.values(obj)) {
        if (value && typeof value === "object") {
            const found = deepFindStringValue(value, keys, depth + 1, seen);
            if (found) return found;
        }
    }

    return null;
};

const deepFindUserObject = (obj, depth = 0, seen = new Set()) => {
    if (!obj || typeof obj !== "object" || depth > 6) return null;
    if (seen.has(obj)) return null;
    seen.add(obj);

    if (obj.email && (obj.role || obj.role_name || obj.roleName || obj.role_id)) {
        return obj;
    }

    for (const value of Object.values(obj)) {
        if (value && typeof value === "object") {
            const found = deepFindUserObject(value, depth + 1, seen);
            if (found) return found;
        }
    }

    return null;
};

/** Unwrap login response — API may nest { data: { accessToken, user } } or return flat fields. */
export const extractLoginPayload = (res) => {
    if (!res || res.error) return null;

    let payload = extractApiData(res);
    if (!payload || typeof payload !== "object") {
        if (res.accessToken || res.token || res.user) {
            payload = res;
        } else {
            payload = deepFindUserObject(res) || deepFindStringValue(res, TOKEN_FIELD_KEYS) ? res : null;
            if (!payload) return null;
        }
    }

    for (let depth = 0; depth < 5; depth += 1) {
        if (
            TOKEN_FIELD_KEYS.some((key) => payload[key]) ||
            payload.user ||
            payload.email
        ) {
            break;
        }
        if (payload.data && typeof payload.data === "object") {
            payload = payload.data;
        } else {
            break;
        }
    }

    return payload;
};

export const resolveProfileUser = (data) => {
    if (!data || typeof data !== "object") return null;
    if (data.user && typeof data.user === "object") return data.user;
    if (data.email || data.role || data.role_name || data.role_id) return data;
    return data;
};

export const resolveApiRoleName = (user = {}) => {
    if (!user || typeof user !== "object") return "";
    const role = user.role || user.Role;
    if (typeof role === "string") return role;
    if (role?.role_name) return role.role_name;
    if (role?.code) return role.code;
    if (role?.name) return role.name;
    if (role?.slug) return role.slug;
    if (role?.title) return role.title;
    if (user.role_name) return user.role_name;
    if (user.roleName) return user.roleName;
    if (user.designation) return user.designation;
    if (user.type) return user.type;
    if (user.user_type) return user.user_type;
    if (Array.isArray(user.roles) && user.roles.length) {
        return resolveApiRoleName({ role: user.roles[0] });
    }
    return "";
};

export const collectRoleCandidates = (user = {}, email = "", payload = {}) => {
    const mail = String(email || "").toLowerCase();
    const candidates = [
        resolveApiRoleName(user),
        user?.role?.code,
        user?.role?.slug,
        user?.roleName,
        user?.designation,
        user?.department,
        user?.type,
        user?.user_type,
        typeof payload?.role === "string" ? payload.role : resolveApiRoleName({ role: payload?.role }),
        mail.includes("@") ? mail.split("@")[0] : mail,
    ];

    if (Array.isArray(user?.roles)) {
        user.roles.forEach((entry) => {
            candidates.push(resolveApiRoleName({ role: entry }));
        });
    }

    return [...new Set(candidates.filter(Boolean).map((value) => String(value).trim()))];
};

export const resolveLoginToken = (payload = {}, user = {}, res = null) => {
    const direct = TOKEN_FIELD_KEYS.map((key) => payload[key] || user?.[key]).find(
        (value) => value && String(value).length > 10
    );
    if (direct) return direct;

    return (
        deepFindStringValue(payload, TOKEN_FIELD_KEYS) ||
        deepFindStringValue(user, TOKEN_FIELD_KEYS) ||
        (res ? deepFindStringValue(res, TOKEN_FIELD_KEYS) : null)
    );
};

export const resolveRefreshToken = (payload = {}, user = {}, res = null) => {
    const direct = REFRESH_TOKEN_KEYS.map((key) => payload[key] || user?.[key]).find(
        (value) => value && String(value).length > 5
    );
    if (direct) return direct;

    return (
        deepFindStringValue(payload, REFRESH_TOKEN_KEYS) ||
        deepFindStringValue(user, REFRESH_TOKEN_KEYS) ||
        (res ? deepFindStringValue(res, REFRESH_TOKEN_KEYS) : null)
    );
};

export const extractApiList = (res) => {
    const data = extractApiData(res);
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.rows)) return data.rows;
    if (Array.isArray(data?.list)) return data.list;
    return [];
};

export const getApiMessage = (res, fallback = "Request failed") =>
    res?.message || res?.errors?.[0]?.message || fallback;

export const isApiSuccess = (res) =>
    res?.error !== true &&
    res?.success !== false &&
    res?.httpStatus !== 401 &&
    res?.status !== 401;

const formatApiEndpoint = (url = "") => {
    try {
        return String(url).replace(BASE_URL, "") || url;
    } catch {
        return url;
    }
};

/** Log full login API body in standard { success, message, data } shape for Metro console. */
export const logLoginResponse = (res) => {
    const loginBody = {
        success: res?.success !== false && isApiSuccess(res),
        message: res?.message || getApiMessage(res, res?.error ? "Login failed" : "Logged in"),
        data: res?.data ?? extractLoginPayload(res) ?? null,
    };
    console.log("Login Response:", JSON.stringify(loginBody, null, 4));
};

/** Log API result from any screen — use after GETNETWORK/POSTNETWORK/PUTNETWORK/DELETENETWORK. */
export const logScreenApi = (screen, action, res, url = "") => {
    const endpoint = url ? formatApiEndpoint(url) : "";
    const status = res?.httpStatus ?? res?.status ?? (isApiSuccess(res) ? "OK" : "ERR");
    const message = getApiMessage(
        res,
        res?.error ? "Network error" : isApiSuccess(res) ? "Success" : "Request failed"
    );
    const label = screen ? `[${screen}]` : "[API]";
    const actionLabel = action ? ` ${action}` : "";

    if (isApiSuccess(res)) {
        console.log(`${label}${actionLabel} SUCCESS | ${endpoint} (${status}) — ${message}`);
    } else {
        console.log(`${label}${actionLabel} ERROR | ${endpoint} (${status}) — ${message}`);
    }
};

const logApiResult = (method, url, result) => {
    logScreenApi("", `${method}`, result, url);
};

export const fmtInr = (value) => {
    const num = Number(value || 0);
    if (Number.isNaN(num)) return "₹0";
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num.toLocaleString("en-IN")}`;
};

export const capitalizeStatus = (status) => {
    const s = String(status || "active").toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
};

export const mapFmcgPartnerRow = (row, prefix = "PARTNER") => ({
    id: String(row.id),
    code: row.code || `${prefix}-${row.id}`,
    name: row.name || "",
    city: row.city || "",
    state: row.state || "",
    location: [row.city, row.state].filter(Boolean).join(", ") || row.address || "",
    gstin: row.gstin || "",
    pan: row.pan || "",
    credit: fmtInr(row.credit_limit),
    creditLimitRaw: String(row.credit_limit ?? 0),
    outstanding: fmtInr(row.outstanding ?? row.opening_balance ?? 0),
    status: capitalizeStatus(row.status),
    _raw: row,
});

export const mapCollectionRow = (row, distributors = []) => {
    const dist = distributors.find((d) => String(d.id) === String(row.distributor_id));
    return {
        id: String(row.id),
        receiptId: row.collection_number || row.receipt_no || `COL-${row.id}`,
        partyId: String(row.distributor_id ?? ""),
        partyName: dist?.name || row.party_name || "",
        rawAmount: String(row.amount ?? 0),
        amount: fmtInr(row.amount),
        mode: capitalizeStatus(row.payment_mode || row.mode || "cash"),
        reference: row.reference_no || row.reference || "",
        date: row.collection_date || row.date || "",
        invoiceId: String(row.invoice_id ?? "0"),
        status: capitalizeStatus(row.status),
        _raw: row,
    };
};

export const mapSalesOrderRow = (row) => ({
    id: String(row.id),
    orderId: row.order_number || `ORD-${row.id}`,
    distributor: row.distributor_name || row.distributor?.name || `#${row.distributor_id}`,
    distributorId: String(row.distributor_id ?? ""),
    amount: fmtInr(row.total_amount ?? row.grand_total ?? row.amount),
    rawAmount: String(row.total_amount ?? row.grand_total ?? row.amount ?? 0),
    status: capitalizeStatus(row.status),
    date: row.order_date || row.created_at?.slice?.(0, 10) || "",
    items: row.items?.length ?? row.line_count ?? 0,
    _raw: row,
});

export const resolveLoginAppRole = (user = {}, email = "", payload = {}) => {
    const primaryCandidates = [
        resolveApiRoleName(user),
        user?.role?.role_name,
        user?.Role?.role_name,
        user?.role?.code,
        user?.role?.slug,
        user?.roleName,
        typeof payload?.role === "string" ? payload.role : resolveApiRoleName({ role: payload?.role }),
    ];

    if (Array.isArray(user?.roles)) {
        user.roles.forEach((entry) => {
            primaryCandidates.push(resolveApiRoleName({ role: entry }));
        });
    }

    const secondaryCandidates = [
        user?.designation,
        user?.department,
        user?.type,
        user?.user_type,
        String(email || "").includes("@") ? String(email).split("@")[0] : email,
    ];

    const tryCandidates = (list) => {
        const unique = [...new Set(list.filter(Boolean).map((value) => String(value).trim()))];
        for (const candidate of unique) {
            let role = mapApiRoleToAppRole(candidate, email);
            if (!role) {
                role = mapApiRoleToAppRole(candidate.replace(/[^a-z0-9_]/gi, "_"), email);
            }
            if (role) return role;
        }
        return null;
    };

    return tryCandidates(primaryCandidates) || tryCandidates(secondaryCandidates);
};

export const mapApiRoleToAppRole = (roleName, email = "") => {
    const role = String(roleName || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_")
        .replace(/-/g, "_");
    const mail = String(email || "").toLowerCase();

    if (!role && !mail) return null;

    if (
        mail.includes("machine") ||
        role === "machine_operator" ||
        role === "machineoperator" ||
        role === "machine"
    ) {
        return "machine";
    }
    if (
        mail.includes("packing") ||
        role === "packing_supervisor" ||
        role === "packingsupervisor" ||
        role === "pack_supervisor" ||
        role === "packing"
    ) {
        return "packing";
    }
    if (
        mail.includes("qc") ||
        role === "qc_inspector" ||
        role === "qcinspector" ||
        role === "quality_inspector" ||
        role === "quality_control" ||
        role === "qc"
    ) {
        return "qc";
    }
    if (
        mail.includes("production") ||
        role === "production_manager" ||
        role === "productionmanager" ||
        role === "production_mgr" ||
        role === "production"
    ) {
        return "production";
    }
    if (
        mail.includes("finance") ||
        role === "finance_head" ||
        role === "finance" ||
        role === "accountant"
    ) {
        return "finance";
    }
    if (
        role === "admin" ||
        role === "super_admin" ||
        role === "sub_admin" ||
        role === "subadmin" ||
        mail.includes("admin")
    ) {
        return "admin";
    }
    if (
        mail.includes("distributor") ||
        role === "distributor"
    ) {
        return "distributor";
    }
    if (
        mail.includes("dealer") ||
        role === "dealer"
    ) {
        return "dealer";
    }
    if (
        mail.includes("wholesaler") ||
        role === "wholesaler"
    ) {
        return "wholesaler";
    }
    if (
        mail.includes("retailer") ||
        role === "retailer"
    ) {
        return "retailer";
    }
    if (
        mail.includes("vehicle") ||
        mail.includes("vechile") ||
        role === "vehicle" ||
        role === "vehicles" ||
        role === "driver"
    ) {
        return "vehicle";
    }
    if (
        mail.includes("transport") ||
        role === "transport" ||
        role === "logistics"
    ) {
        return "transport";
    }
    if (
        mail.includes("asm") ||
        role === "asm" ||
        role === "area_sales_manager"
    ) {
        return "asm";
    }
    if (
        mail.includes("territory") ||
        role === "tm" ||
        role === "territory_manager"
    ) {
        return "asm";
    }
    if (
        mail.includes("sales_officer") ||
        mail.includes("_so") ||
        role === "so" ||
        role === "sales_officer"
    ) {
        return "so";
    }
    if (
        mail.includes("regional_sales") ||
        mail.includes("_rsm") ||
        mail.endsWith("rsm@") ||
        role === "rsm" ||
        role === "regional_sales_manager" ||
        role === "regional_sales_mgr" ||
        role === "regional_sales" ||
        role.startsWith("regional_sales")
    ) {
        return "rsm";
    }
    if (
        mail.includes("nsm") ||
        role === "nsm" ||
        role === "national_sales_manager" ||
        role === "national_sales_mgr" ||
        role === "national_sales" ||
        role === "national_sales_head" ||
        role === "national_sales_executive" ||
        role.startsWith("national_sales")
    ) {
        return "nsm";
    }
    if (
        mail.includes("warehouse") ||
        mail.includes("storekeeper") ||
        mail.includes("store_keeper") ||
        role === "warehouse_manager" ||
        role === "store_keeper" ||
        role === "storekeeper" ||
        role === "store_manager" ||
        role === "warehouse"
    ) {
        return "store";
    }
    if (
        mail.includes("shift") ||
        role === "shift_supervisor" ||
        role === "shiftsupervisor"
    ) {
        return "shift";
    }
    if (
        mail.includes("marketing") ||
        ["marketing_head", "marketing"].includes(role)
    ) {
        return "marketing";
    }

    if (role.includes("admin")) return "admin";
    if (role.includes("distributor")) return "distributor";
    if (role.includes("dealer")) return "dealer";
    if (role.includes("wholesaler")) return "wholesaler";
    if (role.includes("retailer")) return "retailer";
    if (role.includes("vehicle") || role.includes("vechile")) return "vehicle";
    if (role.includes("transport")) return "transport";
    if (role === "asm" || role.includes("area_sales")) return "asm";
    if (role.includes("regional_sales") || role === "rsm") return "rsm";
    if (role.includes("national_sales") || role === "nsm") return "nsm";
    if (role === "so" || role.includes("sales_officer")) return "so";
    if (role.includes("packing")) return "packing";
    if (role.includes("warehouse") || role.includes("store_keeper") || role.includes("storekeeper")) return "store";
    if (role.includes("machine") && role.includes("operator")) return "machine";
    if (role.includes("qc") || role.includes("quality") || (role.includes("inspector") && !role.includes("packing"))) return "qc";
    if (role.includes("production")) return "production";
    if (role.includes("shift") && role.includes("supervisor")) return "shift";
    if (role.includes("finance") || role.includes("account")) return "finance";
    if (
        role.includes("marketing") ||
        (role.includes("sales") && !role.includes("national") && !role.includes("regional")) ||
        role.includes("distributor")
    ) {
        return "marketing";
    }

    return null;
};

const buildHeaders = async (token = false, extra = {}) => {
  let headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...extra,
  };

  if (token) {
    let authToken = await getToken();
    if (!authToken) {
      const session = await getLoginSession();
      authToken = session?.token || null;
    }
    if (authToken) {
      headers = { ...headers, Authorization: `Bearer ${authToken}` };
    }
  }

  return headers;
};

/** Parse fetch body safely — avoids crash when server returns HTML error pages. */
const parseResponseBody = async (response) => {
  const status = response.status;
  const contentType = (response.headers.get("content-type") || "").toLowerCase();

  let text = "";
  try {
    text = await response.text();
  } catch {
    return {
      success: false,
      status,
      message: "Failed to read server response",
    };
  }

  const trimmed = text.trim();

  if (!trimmed) {
    return {
      success: response.ok,
      status,
      message: response.ok ? "Empty response" : `Request failed (${status})`,
    };
  }

  const looksLikeJson =
    contentType.includes("application/json") ||
    trimmed.startsWith("{") ||
    trimmed.startsWith("[");

  if (looksLikeJson) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return { success: response.ok, httpStatus: status, data: parsed };
      }
      if (parsed && typeof parsed === "object") {
        return {
          ...parsed,
          httpStatus: status,
          status: parsed.status ?? (response.ok ? parsed.status : status),
        };
      }
      return { success: response.ok, httpStatus: status, data: parsed };
    } catch {
      return {
        success: false,
        status,
        message: "Invalid JSON from server",
      };
    }
  }

  // HTML / plain-text error (often starts with "<")
  return {
    success: false,
    status,
    message: response.ok
      ? "Unexpected response format from server"
      : `Request failed (${status})`,
  };
};

const request = async (url, options = {}) => {
  const method = options.method || "GET";
  try {
    const response = await fetch(url, options);
    return await parseResponseBody(response);
  } catch (error) {
    const result = {
      success: false,
      message: error?.message || "Network error",
      error: true,
    };
    logApiResult(method, url, result);
    console.error("Network request failed:", error?.message || error);
    return result;
  }
};

export const POSTNETWORK = async (url, payload, token = false) => {
  const headers = await buildHeaders(token);
  return request(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
};

export const POSTNETWORKFORM = async (url, payload, token = false) => {
  const headers = await buildHeaders(token, { "Content-Type": "multipart/form-data" });
  return request(url, {
    method: "POST",
    headers,
    body: payload,
    redirect: "follow",
  });
};

export const GETNETWORK = async (url, token = false) => {
  const headers = await buildHeaders(token);
  return request(url, {
    method: "GET",
    headers,
  });
};

/** GET with an explicit bearer token (used before role token is stored at login). */
export const GETNETWORK_WITH_TOKEN = async (url, bearerToken) => {
  if (!bearerToken) {
    return { success: false, message: "Missing auth token", error: true };
  }
  return request(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearerToken}`,
    },
  });
};

export const PUTNETWORK = async (url, payload, token = false) => {
  const headers = await buildHeaders(token);
  return request(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });
};

export const DELETENETWORK = async (url, token = false) => {
  const headers = await buildHeaders(token);
  return request(url, {
    method: "DELETE",
    headers,
  });
};

export const PATCHNETWORK = async (url, payload = {}, token = false) => {
  const headers = await buildHeaders(token);
  return request(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });
};
