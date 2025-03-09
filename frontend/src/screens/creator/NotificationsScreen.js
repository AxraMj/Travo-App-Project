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
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/config';
import { notificationsAPI } from '../../services/api/notifications';

export default function NotificationsScreen({ navigation }) {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      console.log('Fetching notifications...');
      const response = await notificationsAPI.getNotifications();
      console.log('Notifications received:', response);
      
      // Transform the grouped notifications into sections
      const sections = Object.entries(response.groups).map(([title, data]) => ({
        title,
        data
      }));

      setNotifications(sections);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to fetch notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Set up WebSocket connection for real-time updates
    console.log('Connecting to WebSocket...');
    const wsUrl = `ws://${API_URL.replace(/^https?:\/\//, '')}/ws?token=${token}`;
    console.log('WebSocket URL:', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setWsConnected(true);
    };
    
    ws.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      try {
        const { event: eventType, data } = JSON.parse(event.data);
        console.log('Parsed message:', { eventType, data });
        if (eventType === 'notification') {
          setNotifications(prev => {
            const todaySection = prev.find(section => section.title === 'Today');
            if (todaySection) {
              todaySection.data.unshift(data);
            } else {
              prev.unshift({ title: 'Today', data: [data] });
            }
            return [...prev];
          });
          setUnreadCount(count => count + 1);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsConnected(false);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setWsConnected(false);
    };

    return () => {
      console.log('Closing WebSocket connection');
      ws.close();
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (item) => {
    try {
      if (!item.read) {
        // Mark as read
        await notificationsAPI.markAsRead(item._id);
        setUnreadCount(count => Math.max(0, count - 1));

        // Update local state
        setNotifications(prev => 
          prev.map(section => ({
            ...section,
            data: section.data.map(n => 
              n._id === item._id ? { ...n, read: true } : n
            )
          }))
        );
      }

      // Navigate based on notification type
      switch (item.type) {
        case 'like':
        case 'comment':
          if (item.postId) {
            navigation.navigate('CreatorHome', {
              postId: item.postId._id
            });
          }
          break;
        case 'follow':
          navigation.navigate('Profile', {
            userId: item.triggeredBy._id
          });
          break;
        case 'mention':
          if (item.postId) {
            navigation.navigate('CreatorHome', {
              postId: item.postId._id,
              commentId: item.commentId
            });
          }
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
          return <Ionicons name="heart" size={20} color="#FF6B6B" />;
        case 'comment':
          return <Ionicons name="chatbubble" size={20} color="#4CD964" />;
        case 'follow':
          return <Ionicons name="person-add" size={20} color="#5856D6" />;
        case 'mention':
          return <Ionicons name="at" size={20} color="#FF9500" />;
        default:
          return <Ionicons name="notifications" size={20} color="#ffffff" />;
      }
    };

    return (
      <TouchableOpacity 
        style={[styles.notificationItem, !item.read && styles.unreadNotification]}
        onPress={() => handleNotificationPress(item)}
      >
        <Image 
          source={{ 
            uri: item.triggeredBy?.profileImage || 'https://via.placeholder.com/40'
          }} 
          style={styles.userAvatar}
        />
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.username}>{item.triggeredBy?.username || 'Unknown User'}</Text>
            {getNotificationIcon()}
          </View>
          <Text style={styles.notificationText}>
            {item.text}
          </Text>
        </View>
        {item.postId?.image && (
          <Image 
            source={{ uri: item.postId.image }} 
            style={styles.postThumbnail}
          />
        )}
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
      <Ionicons name="notifications-off-outline" size={48} color="rgba(255,255,255,0.5)" />
      <Text style={styles.emptyText}>No notifications yet</Text>
      <Text style={styles.emptySubText}>
        When someone interacts with your posts, you'll see it here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#232526', '#414345', '#232526']}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Notifications
            {unreadCount > 0 && (
              <Text style={styles.unreadCount}> ({unreadCount})</Text>
            )}
          </Text>
          {unreadCount > 0 && (
            <TouchableOpacity 
              style={styles.readAllButton}
              onPress={async () => {
                try {
                  await notificationsAPI.markAllAsRead();
                  setNotifications(prev => 
                    prev.map(section => ({
                      ...section,
                      data: section.data.map(n => ({ ...n, read: true }))
                    }))
                  );
                  setUnreadCount(0);
                } catch (error) {
                  console.error('Error marking all as read:', error);
                }
              }}
            >
              <Text style={styles.readAllText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>

        <SectionList
          sections={notifications}
          renderItem={renderNotification}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={item => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ffffff"
            />
          }
          ListEmptyComponent={loading ? (
            <ActivityIndicator color="#ffffff" size="large" style={styles.loader} />
          ) : (
            renderEmptyComponent()
          )}
          contentContainerStyle={styles.listContainer}
          stickySectionHeadersEnabled={true}
        />
      </LinearGradient>
      <StatusBar style="light" />
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
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  unreadCount: {
    color: '#4CD964',
  },
  readAllButton: {
    padding: 8,
  },
  readAllText: {
    color: '#4CD964',
    fontSize: 14,
  },
  sectionHeader: {
    backgroundColor: '#232526',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  unreadNotification: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    marginRight: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  username: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  notificationText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  postThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  loader: {
    marginTop: 40,
  },
}); 