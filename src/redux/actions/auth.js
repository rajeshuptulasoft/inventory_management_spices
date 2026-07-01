import { deleteByKeys, storeObjByKey } from '../../utils/Storage';
import {
    LOGIN_RESPONSE_KEY,
    AUTH_ROLE_KEY,
    storeToken,
    storeTokenByKey,
    getToken,
    getTokenByKey,
    getStoredRole,
    clearAuthToken,
    getLoginSession,
} from '../../utils/RoleStorage';
import { AUTH_STATUS } from '../types';
import { GETNETWORK, POSTNETWORK } from '../../utils/Network';
import {
    extractApiData,
    isApiSuccess,
    mapApiRoleToAppRole,
    resolveApiRoleName,
    resolveLoginAppRole,
    resolveProfileUser,
    logScreenApi,
} from '../../utils/Network';
import { buildUrl } from '../../utils/Network';
import { resetToRoute } from '../../navigations/NavigationService';

let authCheckSeq = 0;

const getRoleTokenKey = (role) => `authToken_${role}`;

const buildSessionFromProfile = (profile, existing = {}) => {
    const profileUser = resolveProfileUser(profile) || profile;
    const email = (profileUser?.email || existing.email || '').toLowerCase();
    const apiRole = resolveApiRoleName(profileUser) || existing.apiRole;
    const role = resolveLoginAppRole(profileUser, email, profileUser) || mapApiRoleToAppRole(apiRole, email) || existing.role;
    const isSubAdmin =
        existing.isSubAdmin === true ||
        profileUser?.is_sub_admin === true ||
        email.includes('subadmin');

    return {
        ...existing,
        email,
        name: profileUser?.name || profileUser?.full_name || existing.name || email,
        role,
        apiRole,
        userId: profileUser?.id ?? existing.userId,
        isSubAdmin,
        token: existing.token,
        refreshToken: existing.refreshToken,
        user: profileUser,
    };
};

const isUnauthorizedResponse = (res) =>
    res?.httpStatus === 401 || res?.status === 401;

export const loginUser = (loginResponse) => {
    return async (dispatch) => {
        authCheckSeq += 1;
        const { role, token } = loginResponse;

        if (role && token) {
            await storeTokenByKey(getRoleTokenKey(role), token);
            await storeTokenByKey(AUTH_ROLE_KEY, role);
        }

        await storeObjByKey(LOGIN_RESPONSE_KEY, loginResponse);
        dispatch({
            type: AUTH_STATUS,
            payload: {
                isAuthenticated: true,
                role: loginResponse.role,
            },
        });

        resetToRoute('Main', { role: loginResponse.role });
        return { role: loginResponse.role };
    };
};

export const checkuserToken = () => {
    return async (dispatch) => {
        const seq = authCheckSeq + 1;
        authCheckSeq = seq;

        try {
            const stored = (await getLoginSession()) || {};
            const storedRole = (await getStoredRole()) || stored.role;
            const token = (await getToken(storedRole)) || stored.token;

            if (seq !== authCheckSeq) return false;

            if (!token || !storedRole) {
                dispatch({ type: AUTH_STATUS, payload: { isAuthenticated: false, role: null } });
                return false;
            }

            const localSession = {
                ...stored,
                token,
                role: storedRole,
            };

            await storeTokenByKey(getRoleTokenKey(storedRole), token);
            await storeTokenByKey(AUTH_ROLE_KEY, storedRole);
            await storeObjByKey(LOGIN_RESPONSE_KEY, localSession);

            dispatch({
                type: AUTH_STATUS,
                payload: { isAuthenticated: true, role: storedRole },
            });

            try {
                let res = await GETNETWORK(buildUrl('auth/profile'), true);
                logScreenApi('Auth', 'auth/profile', res, buildUrl('auth/profile'));
                if (seq !== authCheckSeq) return true;

                if (isUnauthorizedResponse(res) && localSession.refreshToken) {
                    const refreshRes = await POSTNETWORK(
                        buildUrl('auth/refresh'),
                        { refreshToken: localSession.refreshToken },
                        false
                    );
                    logScreenApi('Auth', 'auth/refresh', refreshRes, buildUrl('auth/refresh'));
                    if (seq !== authCheckSeq) return true;

                    const newToken =
                        refreshRes?.data?.accessToken ||
                        refreshRes?.data?.access_token ||
                        refreshRes?.accessToken;
                    if (newToken && isApiSuccess(refreshRes)) {
                        await storeTokenByKey(getRoleTokenKey(storedRole), newToken);
                        localSession.token = newToken;
                        res = await GETNETWORK(buildUrl('auth/profile'), true);
                        logScreenApi('Auth', 'auth/profile', res, buildUrl('auth/profile'));
                    }
                }
                if (seq !== authCheckSeq) return true;

                if (isUnauthorizedResponse(res)) {
                    await clearAuthToken();
                    await deleteByKeys([LOGIN_RESPONSE_KEY, 'fcmtoken']);
                    dispatch({ type: AUTH_STATUS, payload: { isAuthenticated: false, role: null } });
                    return false;
                }

                if (isApiSuccess(res)) {
                    const profile = extractApiData(res);
                    const session = buildSessionFromProfile(profile, localSession);
                    const activeRole = session.role || storedRole;

                    if (activeRole) {
                        await storeToken(activeRole, token);
                        await storeObjByKey(LOGIN_RESPONSE_KEY, { ...session, token, role: activeRole });
                        dispatch({
                            type: AUTH_STATUS,
                            payload: { isAuthenticated: true, role: activeRole },
                        });
                    }
                }
            } catch {
                // Offline or temporary error — keep persisted session
            }

            return true;
        } catch {
            if (seq !== authCheckSeq) return false;
            dispatch({ type: AUTH_STATUS, payload: { isAuthenticated: false, role: null } });
            return false;
        }
    };
};

export const logoutUser = () => {
    return async (dispatch) => {
        authCheckSeq += 1;
        await clearAuthToken();
        await deleteByKeys([LOGIN_RESPONSE_KEY, 'fcmtoken']);
        dispatch({
            type: AUTH_STATUS,
            payload: { isAuthenticated: false, role: null },
        });
        resetToRoute('Login');
    };
};
