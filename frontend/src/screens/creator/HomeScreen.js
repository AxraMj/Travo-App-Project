import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Text,
  RefreshControl,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import PostCard from '../../components/posts/PostCard';
import VideoCard from '../../components/videos/VideoCard';
import HomeHeader from '../../components/navigation/HomeHeader';
import { useAuth } from '../../context/AuthContext';
import { postsAPI, videosAPI } from '../../services/api/';

export default function CreatorHomeScreen({ navigation }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('forYou');
  const [posts, setPosts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [followingPosts, setFollowingPosts] = useState([]);
  const [followingVideos, setFollowingVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchContent = async () => {
    try {
      setError(null);
      setLoading(true);
      const [forYouPosts, forYouVideos, followedPosts, followedVideos] = await Promise.all([
        postsAPI.getAllPosts(),
        videosAPI.getAllVideos(),
        postsAPI.getFollowedPosts(),
        videosAPI.getAllVideos() // Filter followed videos on client side
      ]);

      setPosts(forYouPosts);
      setVideos(forYouVideos);
      setFollowingPosts(followedPosts);
      // Filter videos from followed creators
      const followedCreatorVideos = followedVideos.filter(video => 
        followedPosts.some(post => post.userId === video.userId)
      );
      setFollowingVideos(followedCreatorVideos);
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('Failed to load content. Please check your internet connection and try again.');
      Alert.alert(
        'Error',
        'Failed to load content. Please check your internet connection and try again.',
        [
          { text: 'Retry', onPress: () => fetchContent() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchContent();
    setRefreshing(false);
  };

  const handlePostDelete = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
    setFollowingPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
  };

  const handlePostUpdate = (updatedPost) => {
    const updatePosts = (prevPosts) => 
      prevPosts.map(post => post._id === updatedPost._id ? updatedPost : post);
    
    setPosts(updatePosts);
    setFollowingPosts(updatePosts);
  };

  const handleVideoDelete = async (videoId) => {
    try {
      await videosAPI.deleteVideo(videoId);
      setVideos(prevVideos => prevVideos.filter(video => video._id !== videoId));
      setFollowingVideos(prevVideos => prevVideos.filter(video => video._id !== videoId));
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  const handleVideoUpdate = (updatedVideo) => {
    const updateVideos = (prevVideos) =>
      prevVideos.map(video => video._id === updatedVideo._id ? updatedVideo : video);
    
    setVideos(updateVideos);
    setFollowingVideos(updateVideos);
  };

  const renderContent = ({ item }) => {
    if (item.type === 'video') {
      return (
        <VideoCard
          video={item}
          onVideoUpdate={handleVideoUpdate}
          onVideoDelete={handleVideoDelete}
          isOwner={item.userId === user?.id}
        />
      );
    }
    return (
      <PostCard
        post={item}
        onPostUpdate={handlePostUpdate}
        onPostDelete={handlePostDelete}
      />
    );
  };

  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color="#ffffff" size="large" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchContent}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeTab === 'following') {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color="rgba(255,255,255,0.5)" />
          <Text style={styles.emptyText}>No content available</Text>
          <Text style={styles.emptySubText}>
            Follow some creators to see their content here
          </Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.exploreButtonText}>Explore Creators</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="images-outline" size={48} color="rgba(255,255,255,0.5)" />
        <Text style={styles.emptyText}>No content yet</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Text style={styles.createButtonText}>Create Your First Post</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const currentContent = activeTab === 'following'
    ? [...followingPosts.map(post => ({ ...post, type: 'post' })),
       ...followingVideos.map(video => ({ ...video, type: 'video' }))]
    : [...posts.map(post => ({ ...post, type: 'post' })),
       ...videos.map(video => ({ ...video, type: 'video' }))];

  // Sort by creation date, newest first
  currentContent.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#232526', '#414345', '#232526']}
        style={styles.container}
      >
        <HomeHeader navigation={navigation} isCreator={true} />

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'forYou' && styles.activeTab]}
            onPress={() => setActiveTab('forYou')}
          >
            <Text style={[styles.tabText, activeTab === 'forYou' && styles.activeTabText]}>
              For You
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, activeTab === 'following' && styles.activeTab]}
            onPress={() => setActiveTab('following')}
          >
            <Text style={[styles.tabText, activeTab === 'following' && styles.activeTabText]}>
              Following
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        ) : (
          <FlatList
            data={currentContent}
            renderItem={renderContent}
            keyExtractor={item => `${item.type}-${item._id}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
            ListEmptyComponent={renderEmptyComponent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#ffffff"
              />
            }
          />
        )}

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="home" size={24} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('Map')}
          >
            <Ionicons name="map-outline" size={24} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('Search')}
          >
            <Ionicons name="search-outline" size={24} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('Saved')}
          >
            <Ionicons name="bookmark-outline" size={24} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        <StatusBar style="light" />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#ffffff',
  },
  tabText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#ffffff',
  },
  contentContainer: {
    padding: 16,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#414345',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  exploreButton: {
    backgroundColor: '#414345',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  exploreButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#414345',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#232526',
  },
  navItem: {
    padding: 8,
  },
}); 