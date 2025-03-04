import React, { useState, useEffect } from 'react';
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
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { guideAPI, profileAPI } from '../../services/api';

const { width } = Dimensions.get('window');
const POST_SIZE = width / 3;

const GuideCard = ({ guide, onLike, onDislike }) => (
  <View style={styles.guideCard} key={guide._id}>
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
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getProfile(user.id);
      console.log('Profile Data:', response);
      setProfileData(response);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfileData();
    });
    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  const handleSubmitGuide = async () => {
    if (!guideText.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      
      const newGuide = await guideAPI.createGuide({
        text: guideText.trim()
      });
      
      // Format the guide for display
      const formattedGuide = {
        _id: newGuide._id,
        text: newGuide.text,
        username: user.username,
        userImage: user.profileImage,
        likes: 0,
        dislikes: 0,
        hasLiked: false,
        hasDisliked: false
      };
      
      setGuides(prevGuides => [formattedGuide, ...prevGuides]);
      setGuideText('');
      setIsCreatingGuide(false);
      
    } catch (error) {
      console.error('Guide creation error:', error);
      Alert.alert(
        'Error',
        'Failed to create guide. Please try again.'
      );
    } finally {
      setIsLoading(false);
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
            {guides.map((guide) => (
              <GuideCard
                key={guide._id}
                guide={guide}
                onLike={() => handleLike(guide._id)}
                onDislike={() => handleDislike(guide._id)}
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
    if (profileData?.stats?.totalPosts === 0) {
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
        data={guides}
        renderItem={renderPost}
        keyExtractor={item => item._id}
        numColumns={3}
        scrollEnabled={false}
        style={styles.postsGrid}
      />
    );
  };

  // Get the user data either from the profile response or the auth context
  const userData = profileData?.user || user;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#232526', '#414345', '#232526']}
        style={styles.container}
      >
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ffffff"
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{userData?.fullName || 'Profile'}</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('EditProfile', {
                currentProfile: {
                  fullName: userData?.fullName || '',
                  username: userData?.username || '',
                  bio: profileData?.bio || '',
                  location: profileData?.location || '',
                  profileImage: userData?.profileImage || null,
                  socialLinks: profileData?.socialLinks || {}
                }
              })}
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={20} color="#ffffff" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <Image 
              source={{ uri: userData?.profileImage }}
              style={styles.profileImage}
            />
            <Text style={styles.name}>{userData?.fullName}</Text>
            <Text style={styles.username}>@{userData?.username}</Text>
            
            {profileData?.bio && (
              <Text style={styles.bio}>{profileData.bio}</Text>
            )}
            
            {profileData?.location && (
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={16} color="#FF6B6B" />
                <Text style={styles.location}>{profileData.location}</Text>
              </View>
            )}

            {/* Stats */}
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {profileData?.stats?.totalPosts || 0}
                </Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {profileData?.followers?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {profileData?.following?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>

            {/* Social Links */}
            {profileData?.socialLinks && Object.keys(profileData.socialLinks).length > 0 && (
              <View style={styles.socialLinks}>
                {profileData.socialLinks.instagram && (
                  <TouchableOpacity style={styles.socialButton}>
                    <Ionicons name="logo-instagram" size={24} color="#ffffff" />
                  </TouchableOpacity>
                )}
                {profileData.socialLinks.twitter && (
                  <TouchableOpacity style={styles.socialButton}>
                    <Ionicons name="logo-twitter" size={24} color="#ffffff" />
                  </TouchableOpacity>
                )}
                {profileData.socialLinks.facebook && (
                  <TouchableOpacity style={styles.socialButton}>
                    <Ionicons name="logo-facebook" size={24} color="#ffffff" />
                  </TouchableOpacity>
                )}
              </View>
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#232526',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#ffffff',
    marginLeft: 4,
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  profileInfo: {
    alignItems: 'center',
    padding: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  name: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  username: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginBottom: 12,
  },
  bio: {
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 32,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  location: {
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 4,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  socialButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
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