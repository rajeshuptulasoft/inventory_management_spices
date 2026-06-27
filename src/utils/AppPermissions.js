import { Alert, Linking, PermissionsAndroid, Platform } from "react-native";
import Geolocation from "@react-native-community/geolocation";
import { requestUserPermission } from "./PushNotification";

export const requestAndroidLocationPermissions = async () => {
    if (Platform.OS !== "android") {
        return true;
    }

    try {
        const results = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);

        const fineGranted =
            results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED;
        const coarseGranted =
            results[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED;

        return fineGranted || coarseGranted;
    } catch {
        return false;
    }
};

export const requestAndroidNotificationPermission = async () => {
    if (Platform.OS !== "android") {
        return true;
    }

    if (Platform.Version >= 33) {
        try {
            const result = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
            return result === PermissionsAndroid.RESULTS.GRANTED;
        } catch {
            return false;
        }
    }

    return true;
};

export const requestAppPermissions = async () => {
    await requestAndroidLocationPermissions();
    await requestAndroidNotificationPermission();
    await requestUserPermission();
};

export const getCurrentLocationString = async () => {
    const hasPermission = await requestAndroidLocationPermissions();
    if (!hasPermission && Platform.OS === "android") {
        return null;
    }

    return new Promise((resolve) => {
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                resolve(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
            },
            () => resolve(null),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    });
};

export const promptOpenSettingsIfNeeded = (message) => {
    Alert.alert("Permission Required", message, [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
    ]);
};
