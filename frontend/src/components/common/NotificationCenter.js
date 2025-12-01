import React, { useState, useEffect, useRef } from 'react';
import { notificationAPI } from '../../services/api';
import { Bell, X, Check, CheckCheck, Trash2, Package, Truck, Gift, ShoppingBag, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Listen for real-time socket notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    const handleNotificationUpdate = (update) => {
      setNotifications(prev =>
        prev.map(n => n.id === update.id ? { ...n, ...update } : n)
      );
      if (update.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('notification:updated', handleNotificationUpdate);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:updated', handleNotificationUpdate);
    };
  }, [socket]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getAll({ limit: 10 });
      setNotifications(response.data.data.notifications);
      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      await notificationAPI.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.delete(id);
      const notification = notifications.find(n => n.id === id);
      setNotifications(notifications.filter(n => n.id !== id));
      if (!notification.isRead) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    const iconProps = { size: 18 };
    switch (type) {
      case 'PACKAGE':
        return <Package {...iconProps} />;
      case 'PICKUP':
        return <Truck {...iconProps} />;
      case 'REWARD':
        return <Gift {...iconProps} />;
      case 'OFFER':
        return <ShoppingBag {...iconProps} />;
      case 'SYSTEM':
        return <AlertCircle {...iconProps} />;
      default:
        return <Bell {...iconProps} />;
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  return (
    <div className="notification-center" ref={dropdownRef}>
      <button 
        className="notification-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
        {isConnected && (
          <span className="connection-indicator connected" title="Real-time updates active" />
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead} 
                  className="btn-text"
                  disabled={loading}
                  title="Mark all as read"
                >
                  <CheckCheck size={16} />
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)} 
                className="btn-text"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <Bell size={48} />
                <p>No notifications yet</p>
                <span>We'll notify you when something happens</span>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{formatTime(notification.createdAt)}</div>
                  </div>
                  <div className="notification-item-actions">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="btn-icon"
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="btn-icon btn-danger"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        .notification-center {
          position: relative;
        }

        .notification-btn {
          position: relative;
          background: none;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          color: var(--gray-700);
          border-radius: 0.5rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notification-btn:hover {
          background: var(--gray-100);
          color: var(--gray-900);
        }

        .notification-badge {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          background: var(--danger);
          color: white;
          font-size: 0.625rem;
          font-weight: 700;
          padding: 0.125rem 0.375rem;
          border-radius: 999px;
          min-width: 1.125rem;
          text-align: center;
        }

        .connection-indicator {
          position: absolute;
          bottom: 0.25rem;
          right: 0.25rem;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 2px solid white;
        }

        .connection-indicator.connected {
          background: #10B981;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .notification-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          width: 380px;
          max-height: 500px;
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border: 1px solid var(--gray-200);
          display: flex;
          flex-direction: column;
          z-index: 1000;
        }

        .notification-header {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--gray-200);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .notification-header h3 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
          color: var(--gray-900);
        }

        .notification-actions {
          display: flex;
          gap: 0.25rem;
        }

        .btn-text {
          background: none;
          border: none;
          padding: 0.25rem;
          cursor: pointer;
          color: var(--gray-600);
          display: flex;
          align-items: center;
          border-radius: 0.375rem;
          transition: all 0.2s;
        }

        .btn-text:hover {
          color: var(--gray-900);
          background: var(--gray-100);
        }

        .btn-text:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .notification-list {
          overflow-y: auto;
          max-height: 420px;
        }

        .notification-item {
          padding: 0.875rem 1.25rem;
          border-bottom: 1px solid var(--gray-100);
          display: flex;
          gap: 0.75rem;
          transition: background 0.2s;
          position: relative;
        }

        .notification-item:hover {
          background: var(--gray-50);
        }

        .notification-item.unread {
          background: rgba(16, 185, 129, 0.05);
        }

        .notification-item.unread::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: var(--primary);
        }

        .notification-icon {
          flex-shrink: 0;
          width: 2rem;
          height: 2rem;
          border-radius: 0.5rem;
          background: var(--gray-100);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-title {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--gray-900);
          margin-bottom: 0.25rem;
        }

        .notification-message {
          font-size: 0.8125rem;
          color: var(--gray-600);
          line-height: 1.4;
          margin-bottom: 0.25rem;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .notification-time {
          font-size: 0.75rem;
          color: var(--gray-400);
        }

        .notification-item-actions {
          display: flex;
          gap: 0.25rem;
          flex-shrink: 0;
          align-items: flex-start;
        }

        .btn-icon {
          background: none;
          border: none;
          padding: 0.25rem;
          cursor: pointer;
          color: var(--gray-400);
          display: flex;
          align-items: center;
          border-radius: 0.25rem;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background: var(--gray-100);
          color: var(--gray-700);
        }

        .btn-icon.btn-danger:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
        }

        .empty-state {
          padding: 3rem 1.5rem;
          text-align: center;
          color: var(--gray-400);
        }

        .empty-state svg {
          opacity: 0.3;
          margin-bottom: 1rem;
        }

        .empty-state p {
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--gray-600);
          margin-bottom: 0.25rem;
        }

        .empty-state span {
          font-size: 0.8125rem;
        }

        @media (max-width: 480px) {
          .notification-dropdown {
            width: calc(100vw - 2rem);
            right: -1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationCenter;
