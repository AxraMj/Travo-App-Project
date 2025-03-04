import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Text,
  RefreshControl,
  Image,
  Modal,
  Pressable 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import PostCard from '../../components/posts/PostCard';
import { useAuth } from '../../context/AuthContext';

export default function ExplorerHomeScreen({ navigation }) {
  const { user, logout, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('forYou');
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        await updateUserProfile({
          ...user,
          profileImage: result.assets[0].uri
        });
      }
    } catch (error) {
      console.log('Image picking error:', error);
    }
    setShowDropdown(false);
  };

  const fetchPosts = async () => {
    // TODO: Implement API call
    // For demonstration, using dummy data
    setPosts([
      {
        id: '1',
        user: {
          username: 'traveler1',
          profileImage: 'https://example.com/profile.jpg',
        },
        location: 'Bali, Indonesia',
        weather: {
          temp: 28,
          description: 'Sunny'
        },
        image: 'https://example.com/image.jpg',
        likes: 120,
        comments: 15,
        description: 'Beautiful sunset in Bali',
        travelTips: [
          'Best time to visit is during sunset',
          'Bring water and sunscreen',
        ]
      },
      // Add more dummy posts
    ]);
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const ProfileDropdown = () => (
    <Modal
      visible={showDropdown}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowDropdown(false)}
    >
      <Pressable 
        style={styles.dropdownOverlay}
        onPress={() => setShowDropdown(false)}
      >
        <View style={styles.dropdownMenu}>
          <TouchableOpacity 
            style={styles.dropdownItem}
            onPress={pickImage}
          >
            <Ionicons name="camera-outline" size={20} color="#ffffff" />
            <Text style={styles.dropdownText}>Change Profile Picture</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.dropdownItem, styles.logoutItem]}
            onPress={() => {
              setShowDropdown(false);
              handleLogout();
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#232526', '#414345', '#232526']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => setShowDropdown(true)}
            activeOpacity={0.7}
          >
            {user?.profileImage ? (
              <Image 
                source={{ uri: user.profileImage }} 
                style={styles.profileImage} 
              />
            ) : (
              <Ionicons name="person-circle" size={32} color="#ffffff" />
            )}
          </TouchableOpacity>

          <Image 
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <TouchableOpacity 
            style={styles.followingButton}
            onPress={() => navigation.navigate('Following')}
          >
            <Ionicons name="people-outline" size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ProfileDropdown />

        {/* Tabs */}
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

        {/* Posts List */}
        <FlatList
          data={posts}
          renderItem={({ item }) => <PostCard post={item} />}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#ffffff"
            />
          }
        />

        {/* Bottom Navigation */}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
  },
  logo: {
    width: 100,  // Adjust size as needed
    height: 70,  // Adjust size as needed
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  followingButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#ffffff',
  },
  tabText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#232526',
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 100,
    left: 20,
    backgroundColor: '#232526',
    borderRadius: 10,
    padding: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  dropdownText: {
    color: '#ffffff',
    marginLeft: 12,
    fontSize: 16,
  },
  logoutItem: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
  },
  logoutText: {
    color: '#FF6B6B',
    marginLeft: 12,
    fontSize: 16,
  },
}); 