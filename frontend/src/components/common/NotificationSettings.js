import React, { useState } from 'react';
import { Bell, BellOff, Download, Wifi, WifiOff, Check } from 'lucide-react';
import { usePushNotifications, usePWAInstall, useOnlineStatus } from '../../hooks/usePushNotifications';
import toast from 'react-hot-toast';

const NotificationSettings = () => {
  const {
    supported,
    permission,
    isEnabled,
    loading,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const { canInstall, isInstalled, install } = usePWAInstall();
  const isOnline = useOnlineStatus();

  const handleToggleNotifications = async () => {
    if (isEnabled) {
      const result = await unsubscribe();
      if (result.success) {
        toast.success('Notifications disabled');
      } else {
        toast.error(result.error || 'Failed to disable notifications');
      }
    } else {
      const result = await subscribe();
      if (result.success) {
        toast.success('Notifications enabled');
      } else {
        toast.error(result.error || 'Failed to enable notifications');
      }
    }
  };

  const handleInstall = async () => {
    const result = await install();
    if (result) {
      toast.success('ReBox installed successfully!');
    }
  };

  return (
    <div className="notification-settings">
      <h3 className="settings-title">App Settings</h3>

      {/* Online Status */}
      <div className="setting-item">
        <div className="setting-info">
          <div className={`setting-icon ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
          </div>
          <div>
            <h4>Connection Status</h4>
            <p>{isOnline ? 'You are online' : 'You are offline - some features may be limited'}</p>
          </div>
        </div>
        <div className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      {/* Push Notifications */}
      <div className="setting-item">
        <div className="setting-info">
          <div className={`setting-icon ${isEnabled ? 'enabled' : ''}`}>
            {isEnabled ? <Bell size={20} /> : <BellOff size={20} />}
          </div>
          <div>
            <h4>Push Notifications</h4>
            <p>
              {!supported
                ? 'Push notifications are not supported in this browser'
                : permission === 'denied'
                ? 'Notifications are blocked. Enable them in browser settings.'
                : isEnabled
                ? 'Receive updates about pickups, rewards, and offers'
                : 'Enable notifications to stay updated'}
            </p>
          </div>
        </div>
        <button
          className={`toggle-btn ${isEnabled ? 'active' : ''}`}
          onClick={handleToggleNotifications}
          disabled={!supported || permission === 'denied' || loading}
        >
          {loading ? (
            <span className="loading-spinner" />
          ) : isEnabled ? (
            'Disable'
          ) : (
            'Enable'
          )}
        </button>
      </div>

      {/* PWA Install */}
      {!isInstalled && (
        <div className="setting-item install-prompt">
          <div className="setting-info">
            <div className="setting-icon install">
              <Download size={20} />
            </div>
            <div>
              <h4>Install ReBox App</h4>
              <p>
                {canInstall
                  ? 'Install ReBox on your device for faster access and offline support'
                  : 'Add ReBox to your home screen for a better experience'}
              </p>
            </div>
          </div>
          {canInstall && (
            <button className="install-btn" onClick={handleInstall}>
              Install
            </button>
          )}
        </div>
      )}

      {isInstalled && (
        <div className="setting-item installed">
          <div className="setting-info">
            <div className="setting-icon installed">
              <Check size={20} />
            </div>
            <div>
              <h4>ReBox Installed</h4>
              <p>You're using the ReBox app</p>
            </div>
          </div>
          <span className="installed-badge">Installed</span>
        </div>
      )}

      <style>{`
        .notification-settings {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .settings-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 1.5rem;
        }

        .setting-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 0;
          border-bottom: 1px solid var(--gray-100);
        }

        .setting-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .setting-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .setting-icon {
          width: 40px;
          height: 40px;
          border-radius: 0.5rem;
          background: var(--gray-100);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gray-500);
        }

        .setting-icon.enabled {
          background: rgba(34, 197, 94, 0.1);
          color: var(--primary);
        }

        .setting-icon.online {
          background: rgba(34, 197, 94, 0.1);
          color: var(--primary);
        }

        .setting-icon.offline {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .setting-icon.install {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .setting-icon.installed {
          background: rgba(34, 197, 94, 0.1);
          color: var(--primary);
        }

        .setting-info h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 0.25rem;
        }

        .setting-info p {
          font-size: 0.75rem;
          color: var(--gray-500);
          max-width: 300px;
        }

        .toggle-btn {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid var(--gray-300);
          background: white;
          color: var(--gray-700);
        }

        .toggle-btn:hover:not(:disabled) {
          background: var(--gray-50);
        }

        .toggle-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .toggle-btn.active:hover:not(:disabled) {
          background: var(--primary-dark);
        }

        .toggle-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .install-btn {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: #3b82f6;
          color: white;
        }

        .install-btn:hover {
          background: #2563eb;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-badge.online {
          background: rgba(34, 197, 94, 0.1);
          color: var(--primary);
        }

        .status-badge.offline {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .installed-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          background: rgba(34, 197, 94, 0.1);
          color: var(--primary);
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .install-prompt {
          background: rgba(59, 130, 246, 0.05);
          margin: 0 -1.5rem;
          padding: 1rem 1.5rem;
          border-bottom: none;
        }

        @media (max-width: 640px) {
          .setting-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .setting-info p {
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationSettings;
