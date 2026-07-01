import {
    Alert,
    Linking,
    PermissionsAndroid,
    Platform,
    TurboModuleRegistry,
} from "react-native";
import Geolocation from "@react-native-community/geolocation";
import { requestUserPermission } from "./PushNotification";

const LOCATION_ENABLER_MODULE = "AndroidLocationEnabler";

const getLocationEnabler = () => {
    if (Platform.OS !== "android") {
        return null;
    }

    // Package loads TurboModuleRegistry.getEnforcing at import time — check first.
    if (!TurboModuleRegistry.get(LOCATION_ENABLER_MODULE)) {
        return null;
    }

    try {
        return require("react-native-android-location-enabler");
    } catch {
        return null;
    }
};

const openAndroidLocationSettings = () =>
    Linking.openURL(
        "intent:#Intent;action=android.settings.LOCATION_SOURCE_SETTINGS;end"
    ).catch(() => Linking.openSettings());

const promptEnableLocationFallback = () =>
    new Promise((resolve) => {
        Alert.alert(
            "Improve location accuracy?",
            "For a better experience, turn on device location, which uses Google's location service.",
            [
                { text: "No thanks", style: "cancel", onPress: () => resolve(false) },
                {
                    text: "Turn on",
                    onPress: () => {
                        openAndroidLocationSettings().finally(() => resolve(true));
                    },
                },
            ],
            { cancelable: false }
        );
    });

/**
 * Shows the Google Play Services location dialog (Turn on / No thanks)
 * when device location or location accuracy is disabled.
 */
export const ensureDeviceLocationEnabled = async () => {
    if (Platform.OS !== "android") {
        return true;
    }

    const locationEnabler = getLocationEnabler();
    if (!locationEnabler) {
        await promptEnableLocationFallback();
        return await requestAndroidLocationPermissions();
    }

    try {
        const { isLocationEnabled, promptForEnableLocationIfNeeded } = locationEnabler;

        await promptForEnableLocationIfNeeded({
            interval: 10000,
            waitForAccurate: true,
        });

        await requestAndroidLocationPermissions();
        return await isLocationEnabled();
    } catch {
        return false;
    }
};

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
