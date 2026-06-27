// import { getStringByKey, storeStringByKey } from './Storage';
// import { POSTNETWORK } from './Network';
// import { BASE_URL } from '../constant/url';
// import { Vibration } from 'react-native';
// import firebase from '@react-native-firebase/app';
// import messaging from '@react-native-firebase/messaging';

// Firebase push notifications disabled until @react-native-firebase is installed.

// const isMessagingAvailable = () => {
//     try {
//         if (!firebase.apps.length) {
//             console.warn('⚠️ Firebase app not initialized');
//             return false;
//         }
//
//         if (!messaging || typeof messaging !== 'function') {
//             console.warn('⚠️ Messaging module not available');
//             return false;
//         }
//
//         const messagingInstance = messaging();
//         return messagingInstance && typeof messagingInstance.requestPermission === 'function';
//     } catch (error) {
//         console.warn('⚠️ Firebase native module not linked:', error.message);
//         return false;
//     }
// };

export const requestUserPermission = async () => {
    // Firebase disabled — no-op
};

// const postFcmdetails = async () => {
//     const url = `${BASE_URL}enterFCMTokenDetails?_format=json`;
//     const user = await getStringByKey('fcmtoken');
//
//     const obj = {
//         token: user
//     };
//
//     POSTNETWORK(url, obj).then(res => {
//         // console.log("responseeeeeee", res);
//     });
// };

// const getFCM = async () => {
//     try {
//         if (!isMessagingAvailable()) return;
//
//         const storedToken = await getStringByKey('fcmtoken');
//
//         if (storedToken) {
//             await postFcmdetails();
//         } else {
//             const fcmtoken = await messaging().getToken();
//
//             if (fcmtoken) {
//                 await storeStringByKey('fcmtoken', fcmtoken);
//                 await postFcmdetails();
//             }
//         }
//     } catch (error) {
//         // console.error('❌ Error in getFCM:', error);
//     }
// };

// const handleNavigation = (navigation) => {
//     if (!navigation || typeof navigation.navigate !== 'function') {
//         return;
//     }
//
//     navigation.navigate('SeekerNotifications');
// };

export const NotificationListener = (_navigation) => {
    // Firebase disabled — no-op
};
