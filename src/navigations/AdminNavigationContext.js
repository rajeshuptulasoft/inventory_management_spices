import React, { createContext, useContext } from "react";

const AppNavigationContext = createContext(null);

export const AppNavigationProvider = ({ value, children }) => (
    <AppNavigationContext.Provider value={value}>{children}</AppNavigationContext.Provider>
);

export const AdminNavigationProvider = AppNavigationProvider;

export const useNavigation = () => {
    const navigation = useContext(AppNavigationContext);
    if (!navigation) {
        return {
            openDrawer: () => {},
            closeDrawer: () => {},
            navigate: () => {},
            goBack: () => {},
            onLogout: () => {},
        };
    }
    return navigation;
};

export const useFinanceNavigation = useNavigation;
