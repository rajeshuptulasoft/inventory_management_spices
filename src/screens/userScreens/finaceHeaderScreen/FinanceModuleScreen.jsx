import React, { useCallback, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    BackHandler,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MyHeader } from "../../../components/commonComponents/MyHeader";
import { useFinanceNavigation } from "../../../navigations/AdminNavigationContext";
import { FIRASANS, FIRASANSSEMIBOLD } from "../../../constant/fontPath";
import { WHITE } from "../../../constant/color";

const SCREEN_BG = "#F3F4F6";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#6B7280";

const FinanceModuleScreen = ({ title, description }) => {
    const navigation = useFinanceNavigation();

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    useEffect(() => {
        if (Platform.OS !== "android") {
            return undefined;
        }

        const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
            navigation.goBack();
            return true;
        });

        return () => subscription.remove();
    }, [navigation]);

    return (
        <View style={styles.root}>
            <MyHeader
                showBack
                showCenterTitle
                title={title}
                backgroundColor={WHITE}
                onBackPress={handleBack}
            />

            <SafeAreaView style={styles.safeArea} edges={[]}>
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{title}</Text>
                        <Text style={styles.cardDescription}>{description}</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default FinanceModuleScreen;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: SCREEN_BG,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        padding: 16,
        flexGrow: 1,
    },
    card: {
        backgroundColor: WHITE,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    cardTitle: {
        fontFamily: FIRASANSSEMIBOLD,
        fontSize: 18,
        color: TEXT_DARK,
        marginBottom: 8,
    },
    cardDescription: {
        fontFamily: FIRASANS,
        fontSize: 14,
        color: TEXT_MUTED,
        lineHeight: 20,
    },
});
