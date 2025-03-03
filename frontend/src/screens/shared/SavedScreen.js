import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

// Dummy data - replace with actual data from your backend
const savedItems = {
  destinations: [
    {
      id: '1',
      name: 'Bali',
      country: 'Indonesia',
      image: 'https://example.com/bali.jpg',
      savedDate: '2024-03-20',
    },
    // Add more destinations
  ],
  posts: [
    {
      id: '1',
      title: 'Sunset at Uluwatu',
      location: 'Uluwatu, Bali',
      image: 'https://example.com/uluwatu.jpg',
      author: {
        name: 'JohnDoe',
        profileImage: 'https://example.com/profile.jpg'
      },
      likes: 1234,
      savedDate: '2024-03-19',
    },
    // Add more posts
  ]
};

export default function SavedScreen({ navigation }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('destinations');

  const navigateToHome = () => {
    if (user?.accountType === 'creator') {
      navigation.navigate('CreatorHome');
    } else {
      navigation.navigate('ExplorerHome');
    }
  };

  const renderDestinationItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.destinationCard}
      onPress={() => navigation.navigate('DestinationDetail', { destination: item })}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.destinationImage}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.destinationGradient}
      >
        <View style={styles.destinationInfo}>
          <Text style={styles.destinationName}>{item.name}</Text>
          <Text style={styles.destinationCountry}>{item.country}</Text>
        </View>
      </LinearGradient>
      <TouchableOpacity 
        style={styles.unsaveButton}
        onPress={() => {/* Implement unsave functionality */}}
      >
        <Ionicons name="bookmark" size={24} color="#FF6B6B" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPostItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.postCard}
      onPress={() => navigation.navigate('PostDetail', { post: item })}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.postImage}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.postGradient}
      >
        <View style={styles.postInfo}>
          <View style={styles.authorInfo}>
            <Image 
              source={{ uri: item.author.profileImage }} 
              style={styles.authorImage}
            />
            <Text style={styles.authorName}>{item.author.name}</Text>
          </View>
          <View style={styles.postStats}>
            <Text style={styles.postLocation}>{item.location}</Text>
            <View style={styles.likesContainer}>
              <Ionicons name="heart" size={16} color="#FF6B6B" />
              <Text style={styles.likesCount}>{item.likes}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
      <TouchableOpacity 
        style={styles.unsaveButton}
        onPress={() => {/* Implement unsave functionality */}}
      >
        <Ionicons name="bookmark" size={24} color="#FF6B6B" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#232526', '#414345', '#232526']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Saved</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'destinations' && styles.activeTab]}
            onPress={() => setActiveTab('destinations')}
          >
            <Text style={[styles.tabText, activeTab === 'destinations' && styles.activeTabText]}>
              Destinations
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
              Posts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <FlatList
          data={activeTab === 'destinations' ? savedItems.destinations : savedItems.posts}
          renderItem={activeTab === 'destinations' ? renderDestinationItem : renderPostItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        />

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={navigateToHome}
          >
            <Ionicons name="home-outline" size={24} color="rgba(255,255,255,0.7)" />
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
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="bookmark" size={24} color="#ffffff" />
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
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B6B',
  },
  tabText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 16,
  },
  destinationCard: {
    height: 200,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  destinationImage: {
    width: '100%',
    height: '100%',
  },
  destinationGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    padding: 16,
  },
  destinationInfo: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  destinationName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  destinationCountry: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  postCard: {
    height: 250,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    padding: 16,
  },
  postInfo: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  authorName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postLocation: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesCount: {
    color: '#ffffff',
    marginLeft: 4,
  },
  unsaveButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
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
}); 