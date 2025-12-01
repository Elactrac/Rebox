import { useState, useEffect, useCallback } from 'react';
import {
  isPushSupported,
  isNotificationEnabled,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentSubscription,
  showLocalNotification,
  isAppInstalled,
  canInstall,
  promptInstall,
} from '../services/pushNotifications';

/**
 * Custom hook for managing push notifications
 */
export const usePushNotifications = () => {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check initial state
  useEffect(() => {
    const checkState = async () => {
      setSupported(isPushSupported());
      setPermission(getNotificationPermission());

      if (isPushSupported()) {
        try {
          const sub = await getCurrentSubscription();
          setSubscription(sub);
        } catch (error) {
          console.error('Error getting subscription:', error);
        }
      }

      setLoading(false);
    };

    checkState();
  }, []);

  // Subscribe to notifications
  const subscribe = useCallback(async () => {
    if (!supported) return { success: false, error: 'Not supported' };

    setLoading(true);
    try {
      const sub = await subscribeToPush();
      setSubscription(sub);
      setPermission('granted');
      return { success: true, subscription: sub };
    } catch (error) {
      setPermission(getNotificationPermission());
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [supported]);

  // Unsubscribe from notifications
  const unsubscribe = useCallback(async () => {
    setLoading(true);
    try {
      await unsubscribeFromPush();
      setSubscription(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Send a local notification
  const notify = useCallback(async (title, options = {}) => {
    if (!supported || permission !== 'granted') {
      return { success: false, error: 'Notifications not enabled' };
    }

    try {
      await showLocalNotification(title, options);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [supported, permission]);

  return {
    supported,
    permission,
    subscription,
    loading,
    isEnabled: permission === 'granted' && subscription !== null,
    subscribe,
    unsubscribe,
    notify,
  };
};

/**
 * Custom hook for PWA install prompt
 */
export const usePWAInstall = () => {
  const [canInstallPWA, setCanInstallPWA] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(isAppInstalled());
    setCanInstallPWA(canInstall());

    const handleInstallAvailable = () => {
      setCanInstallPWA(true);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setCanInstallPWA(false);
    };

    window.addEventListener('pwaInstallAvailable', handleInstallAvailable);
    window.addEventListener('pwaInstalled', handleInstalled);

    return () => {
      window.removeEventListener('pwaInstallAvailable', handleInstallAvailable);
      window.removeEventListener('pwaInstalled', handleInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!canInstallPWA) return false;
    const result = await promptInstall();
    if (result) {
      setIsInstalled(true);
      setCanInstallPWA(false);
    }
    return result;
  }, [canInstallPWA]);

  return {
    canInstall: canInstallPWA,
    isInstalled,
    install,
  };
};

/**
 * Custom hook for online/offline status
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export default usePushNotifications;
