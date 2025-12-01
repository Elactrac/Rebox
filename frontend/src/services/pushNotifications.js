/**
 * Push Notification Service for ReBox PWA
 */

// VAPID public key - in production, get this from environment
const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || '';

/**
 * Check if push notifications are supported
 */
export const isPushSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

/**
 * Check if notifications are enabled
 */
export const isNotificationEnabled = () => {
  return Notification.permission === 'granted';
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported');
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = () => {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
};

/**
 * Subscribe to push notifications
 */
export const subscribeToPush = async () => {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported');
  }

  const permission = await requestNotificationPermission();
  if (!permission) {
    throw new Error('Notification permission denied');
  }

  const registration = await navigator.serviceWorker.ready;

  // Check for existing subscription
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    // Create new subscription
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  return subscription;
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPush = async () => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    await subscription.unsubscribe();
    return true;
  }

  return false;
};

/**
 * Get current push subscription
 */
export const getCurrentSubscription = async () => {
  if (!isPushSupported()) return null;

  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
};

/**
 * Show a local notification (not push)
 */
export const showLocalNotification = async (title, options = {}) => {
  if (!isNotificationEnabled()) {
    const granted = await requestNotificationPermission();
    if (!granted) return null;
  }

  const registration = await navigator.serviceWorker.ready;

  return registration.showNotification(title, {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'rebox-local',
    ...options,
  });
};

/**
 * Schedule a notification (using service worker)
 */
export const scheduleNotification = async (title, options = {}, delay = 0) => {
  if (delay === 0) {
    return showLocalNotification(title, options);
  }

  // For delayed notifications, we need to use the Notification Triggers API
  // which is still experimental. For now, use setTimeout
  return new Promise((resolve) => {
    setTimeout(async () => {
      const notification = await showLocalNotification(title, options);
      resolve(notification);
    }, delay);
  });
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async () => {
  const registration = await navigator.serviceWorker.ready;
  const notifications = await registration.getNotifications();
  notifications.forEach((notification) => notification.close());
};

/**
 * Convert VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  if (!base64String) {
    return new Uint8Array();
  }

  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Check if app is installed as PWA
 */
export const isAppInstalled = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
};

/**
 * Listen for app install prompt
 */
let deferredPrompt = null;

export const initInstallPrompt = () => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Dispatch custom event for UI to show install button
    window.dispatchEvent(new CustomEvent('pwaInstallAvailable'));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.dispatchEvent(new CustomEvent('pwaInstalled'));
  });
};

/**
 * Trigger app install
 */
export const promptInstall = async () => {
  if (!deferredPrompt) {
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;

  return outcome === 'accepted';
};

/**
 * Check if install prompt is available
 */
export const canInstall = () => {
  return deferredPrompt !== null;
};

// Initialize install prompt listener
if (typeof window !== 'undefined') {
  initInstallPrompt();
}

export default {
  isPushSupported,
  isNotificationEnabled,
  requestNotificationPermission,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentSubscription,
  showLocalNotification,
  scheduleNotification,
  clearAllNotifications,
  isAppInstalled,
  promptInstall,
  canInstall,
};
