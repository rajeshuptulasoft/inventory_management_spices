import { getObjByKey, deleteByKeys, storeStringByKey, storeObjByKey } from '../../utils/Storage';
import { AUTH_STATUS } from '../types';

export const loginUser = (loginResponse) => {
    return async (dispatch) => {
        await storeObjByKey('loginResponse', loginResponse);
        dispatch({
            type: AUTH_STATUS,
            payload: true,
        });
    };
};

export const checkuserToken = () => {
    return async (dispatch) => {
        getObjByKey("loginResponse").then((res) => {
            res ? dispatch({
                type: AUTH_STATUS,
                payload: true,
            }) : dispatch({
                type: AUTH_STATUS,
                payload: false,
            })
        })
    
    };
}

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

