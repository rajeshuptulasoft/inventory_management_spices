import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider, useDispatch, useSelector } from "react-redux";
import { checkuserToken } from "../redux/actions/auth";
import { store } from "../redux/store";
import LoginNavigation from "./LoginNavigation";
import AuthNavigation from "./AuthNavigation";
import { navigationRef } from "./NavigationService";
import { requestAppPermissions } from "../utils/AppPermissions";

const AppNavigator = () => {
  const dispatch = useDispatch();
  const authStatus = useSelector((state) => state.authStatus);

  useEffect(() => {
    dispatch(checkuserToken());
  }, [dispatch]);

  useEffect(() => {
    requestAppPermissions();
  }, []);

  return authStatus ? <AuthNavigation /> : <LoginNavigation />;
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
