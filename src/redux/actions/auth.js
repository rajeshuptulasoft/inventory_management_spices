import { getObjByKey, deleteByKeys, storeStringByKey, storeObjByKey } from '../../utils/Storage';
import { AUTH_STATUS } from '../types';
import { GETNETWORK } from '../../utils/Network';
import {
    extractApiData,
    extractLoginPayload,
    isApiSuccess,
    mapApiRoleToAppRole,
    resolveApiRoleName,
} from '../../utils/Network';
import { buildUrl } from '../../utils/Network';

let authCheckSeq = 0;

const buildSessionFromProfile = (profile, existing = {}) => {
    const email = (profile?.email || existing.email || '').toLowerCase();
    const apiRole = resolveApiRoleName(profile) || existing.apiRole;
    const role = mapApiRoleToAppRole(apiRole, email) || existing.role;
    const isSubAdmin =
        existing.isSubAdmin === true ||
        profile?.is_sub_admin === true ||
        email.includes('subadmin');

    return {
        ...existing,
        email,
        name: profile?.name || profile?.full_name || existing.name || email,
        role,
        apiRole,
        userId: profile?.id ?? existing.userId,
        isSubAdmin,
        token: existing.token,
        refreshToken: existing.refreshToken,
        user: profile,
    };
};

export const loginUser = (loginResponse) => {
    return async (dispatch) => {
        authCheckSeq += 1;
        await storeObjByKey('loginResponse', loginResponse);
        dispatch({
            type: AUTH_STATUS,
            payload: true,
        });
    };
};

export const checkuserToken = () => {
    return async (dispatch) => {
        const seq = authCheckSeq + 1;
        authCheckSeq = seq;

        try {
            const stored = await getObjByKey('loginResponse');
            if (seq !== authCheckSeq) return;

            if (!stored?.token) {
                dispatch({ type: AUTH_STATUS, payload: false });
                return;
            }

            const res = await GETNETWORK(buildUrl('v1/auth/profile'), true);
            if (seq !== authCheckSeq) return;

            if (!isApiSuccess(res)) {
                await deleteByKeys(['loginResponse', 'fcmtoken']);
                dispatch({ type: AUTH_STATUS, payload: false });
                return;
            }

            const profile = extractApiData(res);
            const session = buildSessionFromProfile(profile, stored);
            if (!session.role) {
                await deleteByKeys(['loginResponse', 'fcmtoken']);
                dispatch({ type: AUTH_STATUS, payload: false });
                return;
            }

            await storeObjByKey('loginResponse', session);
            if (seq !== authCheckSeq) return;
            dispatch({ type: AUTH_STATUS, payload: true });
        } catch {
            if (seq !== authCheckSeq) return;
            dispatch({ type: AUTH_STATUS, payload: false });
        }
    };
};

export const logoutUser = () => {
    return async (dispatch) => {
        await deleteByKeys(['loginResponse', 'fcmtoken']);
        await storeStringByKey('skipSplash', 'true');
        dispatch({
            type: AUTH_STATUS,
            payload: false,
        });
    };
};
