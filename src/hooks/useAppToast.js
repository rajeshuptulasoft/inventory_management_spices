import { useCallback, useState } from "react";
import { ToastMessage } from "../components/commonComponents/ToastMessage";

export function useAppToast() {
    const [toast, setToast] = useState({ visible: false, message: "", type: "" });

    const showSuccess = useCallback((message) => {
        setToast({ visible: true, message, type: "success" });
    }, []);

    const showError = useCallback((message) => {
        setToast({ visible: true, message, type: "error" });
    }, []);

    const Toast = useCallback(
        () => (
            <ToastMessage
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                setVisible={setToast}
                bacgroundColor="#FFFFFF"
                textColor="#111827"
            />
        ),
        [toast]
    );

    return { showSuccess, showError, Toast, toast, setToast };
}
