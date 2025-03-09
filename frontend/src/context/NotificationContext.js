import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';
import { notificationsAPI } from '../services/api';
import api from '../services/api/config';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { token, user } = useAuth();
  const [wsConnected, setWsConnected] = useState(false);

  const fetchUnreadCount = async () => {
    if (!user || !token) return;

    try {
      console.log('Fetching unread notifications count...');
      const response = await notificationsAPI.getNotifications();
      console.log('Unread count response:', response);
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  useEffect(() => {
    let ws = null;

    const connectWebSocket = () => {
      if (!user || !token) return;

      // Extract base URL from API config
      const baseURL = api.defaults.baseURL;
      const serverURL = baseURL.replace('/api', '').replace('http://', '');
      const wsUrl = `ws://${serverURL}/ws?token=${token}`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          console.log('WebSocket message received:', event.data);
          const { event: eventType, data } = JSON.parse(event.data);
          if (eventType === 'notification') {
            console.log('New notification received');
            setUnreadCount(prev => prev + 1);
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setWsConnected(false);
        // Try to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };
    };

    // Initial fetch and connection
    fetchUnreadCount();
    connectWebSocket();

    // Cleanup
    return () => {
      if (ws) {
        console.log('Closing WebSocket connection');
        ws.close();
      }
    };
  }, [user, token]);

  const markAsRead = async (notificationId) => {
    try {
      console.log('Marking notification as read:', notificationId);
      await notificationsAPI.markAsRead(notificationId);
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      console.log('Marking all notifications as read');
      await notificationsAPI.markAllAsRead();
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  return (
    <NotificationContext.Provider value={{
      unreadCount,
      setUnreadCount,
      fetchUnreadCount,
      markAsRead,
      markAllAsRead,
      wsConnected,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 