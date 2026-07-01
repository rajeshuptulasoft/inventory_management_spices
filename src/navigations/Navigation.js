import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import LoginNavigation from "./LoginNavigation";
import { navigationRef } from "./NavigationService";
import { requestAppPermissions } from "../utils/AppPermissions";

const AppNavigator = () => {
  useEffect(() => {
    requestAppPermissions();
  }, []);

  return <LoginNavigation />;
};

const Navigation = () => {
  return (
    <Provider store={store}>
      <NavigationContainer ref={navigationRef}>
        <AppNavigator />
      </NavigationContainer>
    </Provider>
  );
};

export default Navigation;
