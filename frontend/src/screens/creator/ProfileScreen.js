import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  TextInput,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');
const POST_SIZE = width / 3;

const GuideCard = ({ guide, onLike, onDislike }) => (
  <View style={styles.guideCard}>
    <View style={styles.guideHeader}>
      <Image 
        source={{ uri: guide.userImage }} 
        style={styles.guideUserImage}
        defaultSource={<Ionicons name="person-circle" size={32} color="#ffffff" />}
      />
      <Text style={styles.guideUsername}>{guide.username}</Text>
    </View>
    
    <Text style={styles.guideText}>{guide.text}</Text>
    
    <View style={styles.guideActions}>
      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={() => onLike(guide.id)}
      >
        <Ionicons 
          name={guide.hasLiked ? "heart" : "heart-outline"} 
          size={24} 
          color={guide.hasLiked ? "#ff4444" : "#ffffff"} 
        />
        <Text style={styles.actionCount}>{guide.likes}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={() => onDislike(guide.id)}
      >
        <Ionicons 
          name={guide.hasDisliked ? "thumbs-down" : "thumbs-down-outline"} 
          size={24} 
          color={guide.hasDisliked ? "#4444ff" : "#ffffff"} 
        />
        <Text style={styles.actionCount}>{guide.dislikes}</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [isCreatingGuide, setIsCreatingGuide] = useState(false);
  const [guideText, setGuideText] = useState('');
  const [guides, setGuides] = useState([]);

  // Dummy data - replace with actual data from your backend
  const stats = {
    posts: 42,
    followers: 1234,
    following: 321,
    countries: 15
  };

  const posts = [];

  const handleSubmitGuide = async () => {
    if (!guideText.trim()) return;

    try {
      // TODO: Replace with your actual API call
      const newGuide = {
        id: Date.now().toString(), // Replace with actual ID from backend
        text: guideText,
        username: user?.username || 'Username',
        userImage: user?.profileImage,
        likes: 0,
        dislikes: 0,
        hasLiked: false,
        hasDisliked: false,
        createdAt: new Date().toISOString()
      };

      // Add to database
      // await authAPI.createGuide(newGuide);

      // Update local state
      setGuides(prevGuides => [newGuide, ...prevGuides]);
      setGuideText('');
      setIsCreatingGuide(false);
    } catch (error) {
      console.error('Error creating guide:', error);
      Alert.alert('Error', 'Failed to create guide. Please try again.');
    }
  };

  const handleLike = async (guideId) => {
    try {
      // TODO: Replace with your actual API call
      // await authAPI.likeGuide(guideId);

      setGuides(prevGuides => prevGuides.map(guide => {
        if (guide.id === guideId) {
          if (guide.hasLiked) {
            return { ...guide, hasLiked: false, likes: guide.likes - 1 };
          }
          return { 
            ...guide, 
            hasLiked: true, 
            likes: guide.likes + 1,
            hasDisliked: false,
            dislikes: guide.hasDisliked ? guide.dislikes - 1 : guide.dislikes
          };
        }
        return guide;
      }));
    } catch (error) {
      console.error('Error liking guide:', error);
    }
  };

  const handleDislike = async (guideId) => {
    try {
      // TODO: Replace with your actual API call
      // await authAPI.dislikeGuide(guideId);

      setGuides(prevGuides => prevGuides.map(guide => {
        if (guide.id === guideId) {
          if (guide.hasDisliked) {
            return { ...guide, hasDisliked: false, dislikes: guide.dislikes - 1 };
          }
          return { 
            ...guide, 
            hasDisliked: true, 
            dislikes: guide.dislikes + 1,
            hasLiked: false,
            likes: guide.hasLiked ? guide.likes - 1 : guide.likes
          };
        }
        return guide;
      }));
    } catch (error) {
      console.error('Error disliking guide:', error);
    }
  };

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

  const renderGuideContent = () => {
    if (isCreatingGuide) {
      return (
        <View style={styles.createGuideForm}>
          <TextInput
            style={styles.guideInput}
            placeholder="Share your travel tips..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={guideText}
            onChangeText={setGuideText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.submitButton, !guideText.trim() && styles.submitButtonDisabled]}
            onPress={handleSubmitGuide}
            disabled={!guideText.trim()}
          >
            <Text style={styles.submitText}>Post</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.guidesContainer}>
        {guides.length === 0 ? (
          <View style={styles.noPostsContainer}>
            <Ionicons name="book-outline" size={50} color="rgba(255,255,255,0.5)" />
            <Text style={styles.noPostsText}>No guides yet</Text>
            <Text style={styles.noPostsSubText}>Share your travel tips and recommendations!</Text>
          </View>
        ) : (
          <View>
            {guides.map(guide => (
              <GuideCard 
                key={guide.id}
                guide={guide}
                onLike={handleLike}
                onDislike={handleDislike}
              />
            ))}
          </View>
        )}
        
        {/* Floating create button */}
        <TouchableOpacity 
          style={styles.floatingCreateButton}
          onPress={() => setIsCreatingGuide(true)}
        >
          <Ionicons name="pencil" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    );
  };

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
            renderGuideContent()
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
  guidesContainer: {
    padding: 16,
  },
  guideCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guideUserImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  guideUsername: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  guideText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  guideActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    color: '#ffffff',
    fontSize: 14,
  },
  floatingCreateButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1DA1F2', // Twitter blue color
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  createGuideForm: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    margin: 16,
  },
  guideInput: {
    color: '#ffffff',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 