import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { UBUNTUBOLD } from "../../constant/fontPath";

const PRIMARY_BLUE = "#2563EB";
const ORANGE = "#EA580C";
const WHITE = "#FFFFFF";

const AttendanceActionButtons = ({ canCheckIn, canCheckOut, onCheckIn, onCheckOut }) => (
    <>
        {canCheckOut ? (
            <TouchableOpacity
                style={styles.checkOutButton}
                activeOpacity={0.9}
                onPress={onCheckOut}
            >
                <Text style={styles.checkOutLabel}>Check Out</Text>
            </TouchableOpacity>
        ) : null}

        <TouchableOpacity
            style={[styles.checkInFab, !canCheckIn && styles.disabled]}
            activeOpacity={0.9}
            onPress={onCheckIn}
            disabled={!canCheckIn}
        >
            <Text style={styles.fabIcon}>📍</Text>
        </TouchableOpacity>
    </>
);

export default AttendanceActionButtons;

const styles = StyleSheet.create({
    checkInFab: {
        position: "absolute",
        right: 20,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: PRIMARY_BLUE,
        justifyContent: "center",
        alignItems: "center",
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        zIndex: 2,
    },
    fabIcon: {
        fontSize: 26,
        lineHeight: 28,
        marginTop: -1,
    },
    checkOutButton: {
        position: "absolute",
        right: 20,
        bottom: 92,
        minWidth: 120,
        paddingVertical: 11,
        paddingHorizontal: 20,
        borderRadius: 24,
        backgroundColor: ORANGE,
        alignItems: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        zIndex: 2,
    },
    checkOutLabel: {
        fontFamily: UBUNTUBOLD,
        fontSize: 13,
        color: WHITE,
    },
    disabled: {
        opacity: 0.35,
    },
});
