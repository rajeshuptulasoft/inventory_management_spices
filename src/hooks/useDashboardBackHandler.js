import { useCallback, useEffect, useState } from "react";
import { BackHandler, Platform } from "react-native";
import { MyAlert } from "../components/commonComponents/MyAlert";

export function useDashboardBackHandler(title = "Close App", message = "Do you want to close the app?") {
    const [exitVisible, setExitVisible] = useState(false);

    useEffect(() => {
        if (Platform.OS !== "android") return undefined;

        const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
            setExitVisible(true);
            return true;
        });

        return () => subscription.remove();
    }, []);

    const closeExitAlert = useCallback(() => setExitVisible(false), []);

    const ExitAlert = useCallback(
        () => (
            <MyAlert
                visible={exitVisible}
                title={title}
                message={message}
                textLeft="Cancel"
                textRight="Close"
                onPressLeft={closeExitAlert}
                onPressRight={() => {
                    closeExitAlert();
                    BackHandler.exitApp();
                }}
                onRequestClose={closeExitAlert}
            />
        ),
        [exitVisible, title, message, closeExitAlert]
    );

    return { ExitAlert, setExitVisible };
}
