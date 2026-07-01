import { useState, useEffect, useCallback, useMemo } from "react";
import { Platform } from "react-native";
import { getObjByKey, storeObjByKey } from "../utils/Storage";
import { getCurrentLocationString, promptOpenSettingsIfNeeded } from "../utils/AppPermissions";
import {
    buildUrl,
    GETNETWORK,
    POSTNETWORK,
    extractApiData,
    extractApiList,
    isApiSuccess,
    logScreenApi,
} from "../utils/Network";

const ATTENDANCE_SCREEN_BY_KEY = {
    attendance_finance: "FinanceAttendanceScreen",
    attendance_marketing: "MarketingAttendanceScreen",
    attendance_shift: "ShiftAttendanceScreen",
    attendance_machine: "MachineAttendanceScreen",
    attendance_production: "ProductionAttendanceScreen",
    attendance_qc: "QcAttendanceScreen",
    attendance_store: "StoreAttendanceScreen",
    attendance_packing: "PackingAttendanceScreen",
    attendance_nsm: "NsmAttendanceScreen",
    attendance_rsm: "RsmAttendanceScreen",
    attendance_admin: "AdminAttendanceScreen",
    attendance_asm: "AsmAttendanceScreen",
    attendance_so: "SoAttendanceScreen",
    attendance_distributor: "DistributorAttendanceScreen",
    attendance_dealer: "DealerAttendanceScreen",
    attendance_wholesaler: "WholesalerAttendanceScreen",
    attendance_retailer: "RetailerAttendanceScreen",
    attendance_vehicle: "VehicleAttendanceScreen",
    attendance_transport: "TransportAttendanceScreen",
};

const IST_TIMEZONE = "Asia/Kolkata";

const formatDateKey = (date = new Date()) =>
    new Intl.DateTimeFormat("en-CA", {
        timeZone: IST_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);

const formatTime = (date = new Date()) =>
    new Intl.DateTimeFormat("en-IN", {
        timeZone: IST_TIMEZONE,
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    })
        .format(date)
        .toLowerCase();

const getMockLocation = () => {
    const lat = (20.25996 + Math.random() * 0.01).toFixed(5);
    const lng = (85.78834 + Math.random() * 0.01).toFixed(5);
    return `${lat}, ${lng}`;
};

const resolveLocation = async () => {
    const gps = await getCurrentLocationString();
    if (gps) return gps;
    if (Platform.OS === "android") {
        promptOpenSettingsIfNeeded(
            "Location permission is required for GPS attendance check-in/out."
        );
    }
    return getMockLocation();
};

const capitalizeStatus = (status) => {
    const s = String(status || "present").toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const mapAttendanceRow = (row, employee, index = 0) => {
    const checkIn = row.check_in_time || row.check_in || row.checkIn || "-";
    const checkOut = row.check_out_time || row.check_out || row.checkOut || "-";
    const checkInLat = row.check_in_latitude ?? row.latitude;
    const checkInLng = row.check_in_longitude ?? row.longitude;

    return {
        id: String(row.id ?? `attendance-${index}`),
        date:
            row.attendance_date?.slice?.(0, 10) ||
            row.date?.slice?.(0, 10) ||
            formatDateKey(),
        name: row.user_name || row.name || employee.name,
        role: employee.role,
        checkIn,
        checkInLocation:
            row.check_in_location ||
            row.checkInLocation ||
            (checkInLat != null && checkInLng != null ? `${checkInLat}, ${checkInLng}` : row.location || ""),
        checkOut,
        checkOutLocation:
            row.check_out_location ||
            row.checkOutLocation ||
            (row.check_out_latitude != null && row.check_out_longitude != null
                ? `${row.check_out_latitude}, ${row.check_out_longitude}`
                : ""),
        status: capitalizeStatus(
            row.status || (checkOut && checkOut !== "-" ? "completed" : checkIn && checkIn !== "-" ? "present" : "absent")
        ),
    };
};

const resolveTodayStatus = (todayRow = {}) => {
    const checkIn = todayRow.check_in_time || todayRow.check_in || todayRow.checkIn;
    const checkOut = todayRow.check_out_time || todayRow.check_out || todayRow.checkOut;

    if (checkOut && checkOut !== "-") return "completed";
    if (checkIn && checkIn !== "-") return "checked_in";
    return "none";
};

const defaultState = {
    lastActiveDate: null,
    todayStatus: "none",
    rows: [],
};

const applyDayState = (state) => {
    const today = formatDateKey();
    let { todayStatus, lastActiveDate } = state;

    if (lastActiveDate !== today) {
        todayStatus = "none";
        lastActiveDate = today;
    }

    return {
        ...state,
        todayStatus,
        lastActiveDate,
        canCheckIn: todayStatus === "none",
        canCheckOut: todayStatus === "checked_in",
    };
};

const buildCheckInPayload = (location, time, today) => {
    const [lat, lng] = String(location).split(",").map((v) => v.trim());
    return {
        latitude: Number(lat) || 0,
        longitude: Number(lng) || 0,
        location,
        attendance_date: today,
        date: today,
        check_in_time: time,
    };
};

const buildCheckOutPayload = (location, time, today) => {
    const [lat, lng] = String(location).split(",").map((v) => v.trim());
    return {
        latitude: Number(lat) || 0,
        longitude: Number(lng) || 0,
        location,
        attendance_date: today,
        date: today,
        check_out_time: time,
    };
};

export function useAttendanceTracking(storageKey, employee, initialRows = [], feedback = {}) {
    const [rows, setRows] = useState([]);
    const [canCheckIn, setCanCheckIn] = useState(true);
    const [canCheckOut, setCanCheckOut] = useState(false);

    useEffect(() => {
        let mounted = true;

        (async () => {
            let seedRows = initialRows;
            let todayStatus = "none";

            const screen =
                feedback.screenName || ATTENDANCE_SCREEN_BY_KEY[storageKey] || "AttendanceScreen";

            try {
                const [listRes, todayRes] = await Promise.all([
                    GETNETWORK(buildUrl("attendance"), true),
                    GETNETWORK(buildUrl("attendance/today"), true),
                ]);

                logScreenApi(screen, "attendance", listRes, buildUrl("attendance"));
                logScreenApi(screen, "attendance/today", todayRes, buildUrl("attendance/today"));

                if (mounted && isApiSuccess(listRes)) {
                    const apiRows = extractApiList(listRes);
                    if (apiRows.length) {
                        seedRows = apiRows.map((row, index) => mapAttendanceRow(row, employee, index));
                    }
                }

                if (mounted && isApiSuccess(todayRes)) {
                    const todayData = extractApiData(todayRes) || {};
                    todayStatus = resolveTodayStatus(todayData);

                    if (todayData && (todayData.id || todayData.check_in || todayData.check_in_time)) {
                        const todayRow = mapAttendanceRow(todayData, employee, 0);
                        const withoutToday = seedRows.filter((row) => row.date !== todayRow.date);
                        seedRows = [todayRow, ...withoutToday];
                    }
                }
            } catch {
                // Keep local attendance if API is unavailable
            }

            const saved = await getObjByKey(storageKey);
            const base = saved || {
                ...defaultState,
                rows: seedRows.length ? seedRows : [],
            };

            const synced = applyDayState({
                ...base,
                rows: seedRows.length ? seedRows : base.rows || [],
                todayStatus: todayStatus !== "none" ? todayStatus : base.todayStatus,
                lastActiveDate: formatDateKey(),
            });

            if (!mounted) return;

            setRows(synced.rows || []);
            setCanCheckIn(synced.canCheckIn);
            setCanCheckOut(synced.canCheckOut);

            if (
                !saved ||
                synced.todayStatus !== saved.todayStatus ||
                synced.lastActiveDate !== saved.lastActiveDate ||
                (seedRows.length && seedRows.length !== (saved.rows || []).length)
            ) {
                await storeObjByKey(storageKey, synced);
            }
        })();

        return () => {
            mounted = false;
        };
        // initialRows only seeds first-time storage for a role
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storageKey]);

    const persist = useCallback(
        async (nextState) => {
            await storeObjByKey(storageKey, nextState);
        },
        [storageKey]
    );

    const handleCheckIn = useCallback(async () => {
        if (!canCheckIn) return;

        const today = formatDateKey();
        const time = formatTime();
        const location = await resolveLocation();
        const screen =
            feedback.screenName || ATTENDANCE_SCREEN_BY_KEY[storageKey] || "AttendanceScreen";

        try {
            const checkInRes = await POSTNETWORK(
                buildUrl("attendance/check-in"),
                buildCheckInPayload(location, time, today),
                true
            );
            logScreenApi(screen, "attendance/check-in", checkInRes, buildUrl("attendance/check-in"));
        } catch {
            // Local attendance still works if API fails
        }

        const newRow = {
            id: `attendance-${today}-${Date.now()}`,
            date: today,
            name: employee.name,
            role: employee.role,
            checkIn: time,
            checkInLocation: location,
            checkOut: "-",
            checkOutLocation: "",
            status: "Present",
        };

        const nextRows = [newRow, ...rows.filter((row) => row.date !== today)];
        const nextState = {
            lastActiveDate: today,
            todayStatus: "checked_in",
            rows: nextRows,
        };

        setRows(nextRows);
        setCanCheckIn(false);
        setCanCheckOut(true);
        await persist(nextState);
        feedback.onCheckIn?.(`Checked in at ${time}`);
    }, [canCheckIn, rows, employee, persist, feedback, storageKey]);

    const handleCheckOut = useCallback(async () => {
        if (!canCheckOut) return;

        const today = formatDateKey();
        const time = formatTime();
        const location = await resolveLocation();
        const screen =
            feedback.screenName || ATTENDANCE_SCREEN_BY_KEY[storageKey] || "AttendanceScreen";

        try {
            const checkOutRes = await POSTNETWORK(
                buildUrl("attendance/check-out"),
                buildCheckOutPayload(location, time, today),
                true
            );
            logScreenApi(screen, "attendance/check-out", checkOutRes, buildUrl("attendance/check-out"));
        } catch {
            // Local attendance still works if API fails
        }

        const nextRows = rows.map((row) =>
            row.date === today
                ? {
                      ...row,
                      checkOut: time,
                      checkOutLocation: location,
                      status: "Completed",
                  }
                : row
        );

        const nextState = {
            lastActiveDate: today,
            todayStatus: "completed",
            rows: nextRows,
        };

        setRows(nextRows);
        setCanCheckIn(false);
        setCanCheckOut(false);
        await persist(nextState);
        feedback.onCheckOut?.(`Checked out at ${time}`);
    }, [canCheckOut, rows, persist, feedback, storageKey]);

    const summaryData = useMemo(() => {
        const today = formatDateKey();
        const todayRow = rows.find((row) => row.date === today);
        const withLocation = rows.filter((row) => row.checkInLocation).length;

        return {
            totalRecords: String(rows.length),
            presentToday: todayRow?.checkIn && todayRow.checkIn !== "-" ? "1" : "0",
            withLocation: String(withLocation),
        };
    }, [rows]);

    return {
        rows,
        canCheckIn,
        canCheckOut,
        handleCheckIn,
        handleCheckOut,
        summaryData,
    };
}
