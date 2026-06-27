import { useState, useEffect, useCallback, useMemo } from "react";
import { Alert, Platform } from "react-native";
import { getObjByKey, storeObjByKey } from "../utils/Storage";
import { getCurrentLocationString, promptOpenSettingsIfNeeded } from "../utils/AppPermissions";

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

export function useAttendanceTracking(storageKey, employee, initialRows = []) {
    const [rows, setRows] = useState([]);
    const [canCheckIn, setCanCheckIn] = useState(true);
    const [canCheckOut, setCanCheckOut] = useState(false);

    useEffect(() => {
        let mounted = true;

        (async () => {
            const saved = await getObjByKey(storageKey);
            const base = saved || {
                ...defaultState,
                rows: initialRows.length ? initialRows : [],
            };
            const synced = applyDayState(base);

            if (!mounted) return;

            setRows(synced.rows || []);
            setCanCheckIn(synced.canCheckIn);
            setCanCheckOut(synced.canCheckOut);

            if (
                !saved ||
                synced.todayStatus !== saved.todayStatus ||
                synced.lastActiveDate !== saved.lastActiveDate
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
        Alert.alert("Checked In", `Work started at ${time}`);
    }, [canCheckIn, rows, employee, persist]);

    const handleCheckOut = useCallback(async () => {
        if (!canCheckOut) return;

        const today = formatDateKey();
        const time = formatTime();
        const location = await resolveLocation();

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
        Alert.alert("Checked Out", `Work ended at ${time}`);
    }, [canCheckOut, rows, persist]);

    const summaryData = useMemo(() => {
        const today = formatDateKey();
        const todayRow = rows.find((row) => row.date === today);
        const withLocation = rows.filter((row) => row.checkInLocation).length;

        return {
            totalRecords: String(rows.length),
            presentToday: todayRow?.checkIn ? "1" : "0",
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
