import React from "react";
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Platform,
    Pressable,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BLACK, WHITE } from "../../constant/color";
import { UBUNTUBOLD } from "../../constant/fontPath";
import { BACK } from "../../constant/imagePath";

export const MyHeader = ({
    backgroundColor = WHITE,
    height = 70,
    showCenterTitle = false,
    title = "",
    showBack = false,
    onBackPress = () => {},
}) => {
    if (showBack) {
        return (
            <>
                <StatusBar
                    backgroundColor={backgroundColor}
                    barStyle="dark-content"
                    translucent={Platform.OS === "android"}
                />
                <SafeAreaView edges={["top"]} style={{ backgroundColor }}>
                    <View style={[styles.container, { backgroundColor, height }]}>
                        <Pressable onPress={onBackPress} style={styles.backContainer}>
                            <Image source={BACK} style={styles.backIcon} resizeMode="contain" />
                        </Pressable>

                        {showCenterTitle ? (
                            <View style={styles.centerTitleContainer}>
                                <Text allowFontScaling={false} style={styles.centerTitle}>
                                    {title}
                                </Text>
                            </View>
                        ) : null}

                        <View style={styles.backContainer} />
                    </View>
                </SafeAreaView>
            </>
        );
    }

    if (showCenterTitle) {
        return (
            <>
                <StatusBar
                    backgroundColor={backgroundColor}
                    barStyle="dark-content"
                    translucent={Platform.OS === "android"}
                />
                <SafeAreaView edges={["top"]} style={{ backgroundColor }}>
                    <View style={[styles.container, { backgroundColor, height }]}>
                        <View style={styles.centerTitleContainer}>
                            <Text allowFontScaling={false} style={styles.centerTitle}>
                                {title}
                            </Text>
                        </View>
                    </View>
                </SafeAreaView>
            </>
        );
    }

    return null;
};

export default MyHeader;

const styles = StyleSheet.create({
    container: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    backContainer: {
        width: 44,
        justifyContent: "center",
        alignItems: "center",
    },
    backIcon: {
        width: 24,
        height: 24,
    },
    centerTitleContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    centerTitle: {
        fontSize: 18,
        fontFamily: UBUNTUBOLD,
        color: BLACK,
    },
});
