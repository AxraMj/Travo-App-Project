import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../../context/NotificationContext';
import { notificationsAPI } from '../../services/api/notifications';

export default function NotificationsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { markAllAsRead, markAsRead } = useNotifications();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getNotifications();
      setNotifications(formatNotifications(response.groups));
      // Mark all notifications as read when screen is opened
      await markAllAsRead();
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const formatNotifications = (groups) => {
    return Object.entries(groups).map(([title, data]) => ({
      title,
      data
    }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification) => {
    try {
      // Mark the notification as read if it isn't already
      if (!notification.read) {
        await markAsRead(notification._id);
      }

      // Navigate based on notification type
      switch (notification.type) {
        case 'like':
        case 'comment':
          // Navigate to the post
          if (notification.postId) {
            navigation.navigate('Post', { postId: notification.postId });
          }
          break;
        case 'follow':
          // Navigate to the user's profile
          if (notification.triggeredBy) {
            navigation.navigate('UserProfile', { userId: notification.triggeredBy._id });
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error handling notification press:', error);
    }
  };

  const renderNotification = ({ item }) => {
    const getNotificationIcon = () => {
      switch (item.type) {
        case 'like':
          return 'heart';
        case 'comment':
          return 'chatbubble';
        case 'follow':
          return 'person-add';
        default:
          return 'notifications';
      }
    };

    return (
      <TouchableOpacity
        style={styles.notificationItem}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationContent}>
          {item.triggeredBy?.profileImage ? (
            <Image
              source={{ uri: item.triggeredBy.profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <View style={[styles.profileImage, styles.defaultProfileImage]}>
              <Ionicons name="person" size={20} color="#666" />
            </View>
          )}
          <View style={styles.notificationText}>
            <Text style={styles.username}>
              {item.triggeredBy?.username || 'Someone'}
            </Text>
            <Text style={styles.message}>{item.text}</Text>
          </View>
          <Ionicons
            name={getNotificationIcon()}
            size={24}
            color={item.read ? '#666' : '#FF3B30'}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-outline" size={48} color="#666" />
      <Text style={styles.emptyText}>No notifications yet</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#232526', '#414345']}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerRight} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : (
          <SectionList
            sections={notifications}
            keyExtractor={(item) => item._id}
            renderItem={renderNotification}
            renderSectionHeader={renderSectionHeader}
            ListEmptyComponent={renderEmptyComponent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#fff"
              />
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flexGrow: 1,
  },
  sectionHeader: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: '600',
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  defaultProfileImage: {
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    flex: 1,
    marginRight: 12,
  },
  username: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    color: 'rgba(255,255,255,0.8)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#666',
    marginTop: 12,
    fontSize: 16,
  },
}); 