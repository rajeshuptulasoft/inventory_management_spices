import { AUTH_STATUS } from "../types";

const initialState = {
    isAuthenticated: false,
    role: null,
};

export default function authReducer(state = initialState, action) {
    switch (action.type) {
        case AUTH_STATUS:
            if (typeof action.payload === "boolean") {
                return {
                    ...state,
                    isAuthenticated: action.payload,
                    role: action.payload ? state.role : null,
                };
            }
            return {
                ...state,
                isAuthenticated: Boolean(action.payload?.isAuthenticated),
                role: action.payload?.role ?? (action.payload?.isAuthenticated ? state.role : null),
            };
        default:
            return state;
    }
}
