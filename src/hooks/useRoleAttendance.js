import { useEffect, useState } from "react";
import { useAttendanceTracking } from "./useAttendanceTracking";
import { getAttendanceStorageKey, getLoginSession } from "../utils/RoleStorage";

export function useRoleAttendance(fallbackRoleLabel = "Employee", feedback = {}) {
    const [storageKey, setStorageKey] = useState("attendance_finance");
    const [employee, setEmployee] = useState({
        name: fallbackRoleLabel,
        role: fallbackRoleLabel,
    });
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let mounted = true;

        (async () => {
            const session = await getLoginSession();
            if (!mounted) return;

            const role = session?.role || "finance";
            setStorageKey(getAttendanceStorageKey(role));
            setEmployee({
                name: session?.name || fallbackRoleLabel,
                role: session?.apiRole || session?.role || fallbackRoleLabel,
            });
            setReady(true);
        })();

        return () => {
            mounted = false;
        };
    }, [fallbackRoleLabel]);

    const tracking = useAttendanceTracking(storageKey, employee, [], feedback);

    return { ...tracking, ready, employee, storageKey };
}
