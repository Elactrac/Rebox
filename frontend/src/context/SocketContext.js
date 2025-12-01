import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Connect to socket server
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 
                      process.env.REACT_APP_API_URL?.replace('/api', '') || 
                      'http://localhost:5000';
    
    const newSocket = io(socketUrl, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
    });

    // Handle new notifications
    newSocket.on('notification:new', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      toast(notification.message || notification.title, {
        icon: getNotificationIcon(notification.type),
        duration: 5000,
      });
    });

    // Handle notification updates
    newSocket.on('notification:updated', (update) => {
      setNotifications(prev => 
        prev.map(n => n.id === update.id ? { ...n, ...update } : n)
      );
      if (update.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    });

    // Pickup status updates
    newSocket.on('pickup:scheduled', (data) => {
      toast.success(`Pickup scheduled: ${data.trackingCode}`, {
        icon: '📦',
      });
    });

    newSocket.on('pickup:confirmed', (data) => {
      toast.success('Your pickup has been confirmed!', {
        icon: '✅',
      });
    });

    newSocket.on('pickup:in_transit', (data) => {
      toast.success('Recycler is on the way!', {
        icon: '🚚',
      });
    });

    newSocket.on('pickup:completed', (data) => {
      toast.success(`Pickup completed! +${data.points} points`, {
        icon: '🎉',
        duration: 6000,
      });
    });

    // Reward updates
    newSocket.on('reward:earned', (data) => {
      toast.success(`You earned ${data.points} points!`, {
        icon: '⭐',
      });
    });

    newSocket.on('reward:level_up', (data) => {
      toast.success(`Level up! You're now ${data.level}!`, {
        icon: '🏆',
        duration: 8000,
      });
    });

    // Offer updates
    newSocket.on('offer:received', (data) => {
      toast.success('New buyback offer received!', {
        icon: '💰',
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  // Join a pickup room for real-time updates
  const joinPickup = useCallback((pickupId) => {
    if (socket) {
      socket.emit('join:pickup', pickupId);
    }
  }, [socket]);

  // Leave a pickup room
  const leavePickup = useCallback((pickupId) => {
    if (socket) {
      socket.emit('leave:pickup', pickupId);
    }
  }, [socket]);

  // Mark notification as read
  const markNotificationRead = useCallback((notificationId) => {
    if (socket) {
      socket.emit('notification:read', notificationId);
    }
  }, [socket]);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const value = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    setUnreadCount,
    joinPickup,
    leavePickup,
    markNotificationRead,
    clearNotifications,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Helper function to get notification icons
const getNotificationIcon = (type) => {
  switch (type?.toUpperCase()) {
    case 'PICKUP':
      return '📦';
    case 'REWARD':
      return '⭐';
    case 'OFFER':
      return '💰';
    case 'SYSTEM':
      return 'ℹ️';
    default:
      return '🔔';
  }
};

export default SocketContext;
