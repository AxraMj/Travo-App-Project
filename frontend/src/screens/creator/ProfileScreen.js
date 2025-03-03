import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');
const POST_SIZE = width / 3;

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');

  // Dummy data - replace with actual data from your backend
  const stats = {
    posts: 42,
    followers: 1234,
    following: 321,
    countries: 15
  };

  const posts = [];

  const renderPost = ({ item }) => (
    <TouchableOpacity style={styles.postContainer}>
      {item.image ? (
        <Image 
          source={{ uri: item.image }} 
          style={styles.postImage}
        />
      ) : (
        <View style={styles.placeholderContainer}>
          <Ionicons name="image-outline" size={32} color="rgba(255,255,255,0.5)" />
        </View>
      )}
      <View style={styles.postOverlay}>
        <Ionicons name="location" size={16} color="#ffffff" />
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (posts.length === 0) {
      return (
        <View style={styles.noPostsContainer}>
          {activeTab === 'posts' ? (
            <>
              <Ionicons name="images-outline" size={50} color="rgba(255,255,255,0.5)" />
              <Text style={styles.noPostsText}>No posts yet</Text>
              <Text style={styles.noPostsSubText}>Share your travel adventures with the world!</Text>
            </>
          ) : (
            <>
              <Ionicons name="book-outline" size={50} color="rgba(255,255,255,0.5)" />
              <Text style={styles.noPostsText}>No guides yet</Text>
              <Text style={styles.noPostsSubText}>Share your travel tips and recommendations!</Text>
              <TouchableOpacity 
                style={styles.createGuideButton}
                onPress={() => navigation.navigate('CreateGuide')}
              >
                <Ionicons name="pencil" size={20} color="#ffffff" />
                <Text style={styles.createGuideText}>Create Guide</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      );
    }
    return (
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        numColumns={3}
        scrollEnabled={false}
        style={styles.postsGrid}
      />
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#232526', '#414345', '#232526']}
        style={styles.container}
      >
        <ScrollView>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Profile Info */}
          <View style={styles.profileContent}>
            <View style={styles.profileImageContainer}>
              {user?.profileImage ? (
                <Image 
                  source={{ uri: user.profileImage }} 
                  style={styles.profileImage} 
                />
              ) : (
                <Ionicons name="person-circle" size={80} color="#ffffff" />
              )}
            </View>

            <Text style={styles.username}>{user?.username || 'Username'}</Text>
            <Text style={styles.bio}>Travel Creator | Adventure Seeker</Text>
            <Text style={styles.location}>
              <Ionicons name="location" size={16} color="#ffffff" /> Based in New York
            </Text>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.countries}</Text>
                <Text style={styles.statLabel}>Countries</Text>
              </View>
            </View>

            {/* Edit Profile Button */}
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Modified Content Tabs section with just Posts and Guides */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
              onPress={() => setActiveTab('posts')}
            >
              <Ionicons 
                name="grid-outline" 
                size={24} 
                color={activeTab === 'posts' ? '#ffffff' : 'rgba(255,255,255,0.7)'} 
              />
              <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>Posts</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'guides' && styles.activeTab]}
              onPress={() => setActiveTab('guides')}
            >
              <Ionicons 
                name="book-outline" 
                size={24} 
                color={activeTab === 'guides' ? '#ffffff' : 'rgba(255,255,255,0.7)'} 
              />
              <Text style={[styles.tabText, activeTab === 'guides' && styles.activeTabText]}>Guides</Text>
            </TouchableOpacity>
          </View>

          {/* Posts Grid */}
          {renderContent()}
        </ScrollView>
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
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 8,
  },
  profileContent: {
    alignItems: 'center',
    paddingTop: 20,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  username: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bio: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 8,
  },
  location: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  tabText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#ffffff',
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  postsGrid: {
    width: '100%',
  },
  postContainer: {
    width: POST_SIZE,
    height: POST_SIZE,
    padding: 1,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postOverlay: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    borderRadius: 4,
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPostsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  noPostsText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  noPostsSubText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  createGuideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  createGuideText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 