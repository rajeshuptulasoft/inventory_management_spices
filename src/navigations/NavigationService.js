import { createNavigationContainerRef } from '@react-navigation/native';

// ✅ Create a global navigation reference
export const navigationRef = createNavigationContainerRef();

// ✅ Function to navigate from anywhere (like PushNotification.js)
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    console.log('⚠️ Navigation not ready');
  }
}

export function resetToRoute(name, params) {
  const runReset = () => {
    if (!navigationRef.isReady()) {
      return false;
    }
    navigationRef.reset({
      index: 0,
      routes: params ? [{ name, params }] : [{ name }],
    });
    return true;
  };

  if (runReset()) {
    return;
  }

  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    if (runReset() || attempts >= 30) {
      clearInterval(timer);
    }
  }, 100);
}