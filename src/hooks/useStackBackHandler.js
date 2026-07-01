import { useEffect } from "react";
import { BackHandler, Platform } from "react-native";

export function useStackBackHandler(onBack, enabled = true) {
    useEffect(() => {
        if (!enabled || Platform.OS !== "android" || typeof onBack !== "function") {
            return undefined;
        }

        const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
            onBack();
            return true;
        });

        return () => subscription.remove();
    }, [onBack, enabled]);
}
