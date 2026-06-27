import { getObjByKey } from "./Storage";
import { BASE_URL } from "../constant/url";

export const buildUrl = (path = "", query = "") => {
    const cleanPath = String(path).replace(/^\//, "");
    const base = `${BASE_URL}${cleanPath}`;
    if (!query) return base;
    const q = String(query).startsWith("?") ? query : `?${query}`;
    return `${base}${q}`;
};

export const extractApiData = (res) => {
    if (!res || res.error) return null;
    if (Array.isArray(res.data)) return res.data;
    if (res.data && typeof res.data === "object") return res.data;
    if (Array.isArray(res)) return res;
    return res.data ?? null;
};

/** Unwrap login response — API may nest { data: { accessToken, user } } or return flat fields. */
export const extractLoginPayload = (res) => {
    if (!res || res.error) return null;

    let payload = extractApiData(res);
    if (!payload || typeof payload !== "object") {
        if (res.accessToken || res.token || res.user) {
            payload = res;
        } else {
            return null;
        }
    }

    for (let depth = 0; depth < 3; depth += 1) {
        if (payload.accessToken || payload.token || payload.user) break;
        if (payload.data && typeof payload.data === "object") {
            payload = payload.data;
        } else {
            break;
        }
    }

    return payload;
};

export const resolveApiRoleName = (user = {}) => {
    if (!user || typeof user !== "object") return "";
    const role = user.role;
    if (typeof role === "string") return role;
    if (role?.role_name) return role.role_name;
    if (user.role_name) return user.role_name;
    if (user.roleName) return user.roleName;
    return "";
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

export const mapApiRoleToAppRole = (roleName, email = "") => {
    const role = String(roleName || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_")
        .replace(/-/g, "_");
    const mail = String(email || "").toLowerCase();

    if (mail.includes("machine") || role === "machine_operator") return "machine";
    if (
        role === "production_manager" ||
        role === "productionmanager" ||
        role === "production_mgr" ||
        role === "production"
    ) {
        return "production";
    }
    if (["accountant", "admin", "super_admin"].includes(role)) return "finance";
    if (["marketing_head", "marketing", "asm", "tm", "so"].includes(role)) return "marketing";
    if (role === "warehouse_manager" || role === "shift_supervisor") return "shift";
    return null;
};

const buildHeaders = async (token = false, extra = {}) => {
  let headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...extra,
  };

  if (token) {
    const loginRes = await getObjByKey("loginResponse");
    const authToken =
      loginRes?.token ||
      (typeof loginRes?.data === "string" ? loginRes.data : loginRes?.data?.token) ||
      loginRes?.data;
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
  try {
    const response = await fetch(url, options);
    return await parseResponseBody(response);
  } catch (error) {
    console.error("Network request failed:", error?.message || error);
    return {
      success: false,
      message: error?.message || "Network error",
      error: true,
    };
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
