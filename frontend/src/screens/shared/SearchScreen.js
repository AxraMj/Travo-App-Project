import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const categories = [
  { id: '1', name: 'Beach', icon: 'umbrella-outline' },
  { id: '2', name: 'Mountain', icon: 'triangle-outline' },
  { id: '3', name: 'City', icon: 'business-outline' },
  { id: '4', name: 'Cultural', icon: 'museum-outline' },
  { id: '5', name: 'Adventure', icon: 'compass-outline' },
  { id: '6', name: 'Food', icon: 'restaurant-outline' },
];

const popularDestinations = [
  {
    id: '1',
    name: 'Bali',
    country: 'Indonesia',
    image: 'https://example.com/bali.jpg',
    rating: 4.8,
    posts: 1234
  },
  // Add more destinations
];

const recentSearches = [
  'Paris, France',
  'Tokyo, Japan',
  'New York, USA',
  // Add more recent searches
];

export default function SearchScreen({ navigation }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.categoryItem,
        activeCategory === item.id && styles.categoryItemActive
      ]}
      onPress={() => setActiveCategory(item.id)}
    >
      <View style={styles.categoryIcon}>
        <Ionicons 
          name={item.icon} 
          size={24} 
          color={activeCategory === item.id ? '#ffffff' : '#FF6B6B'} 
        />
      </View>
      <Text style={[
        styles.categoryText,
        activeCategory === item.id && styles.categoryTextActive
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

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
          <View>
            <Text style={styles.destinationName}>{item.name}</Text>
            <Text style={styles.destinationCountry}>{item.country}</Text>
          </View>
          <View style={styles.destinationStats}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <Text style={styles.postsCount}>{item.posts} posts</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const navigateToHome = () => {
    if (user?.accountType === 'creator') {
      navigation.navigate('CreatorHome');
    } else {
      navigation.navigate('ExplorerHome');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#232526', '#414345', '#232526']}
        style={styles.container}
      >
        {/* Search Header */}
        <View style={styles.searchHeader}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search destinations, experiences..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Recent Searches */}
          {isSearchFocused && searchQuery.length === 0 && (
            <View style={styles.recentSearches}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              {recentSearches.map((search, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.recentSearchItem}
                  onPress={() => setSearchQuery(search)}
                >
                  <Ionicons name="time-outline" size={20} color="rgba(255,255,255,0.5)" />
                  <Text style={styles.recentSearchText}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Categories */}
          {!isSearchFocused && (
            <>
              <Text style={styles.sectionTitle}>Explore Categories</Text>
              <FlatList
                data={categories}
                renderItem={renderCategoryItem}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesList}
              />

              {/* Popular Destinations */}
              <View style={styles.popularSection}>
                <Text style={styles.sectionTitle}>Popular Destinations</Text>
                <FlatList
                  data={popularDestinations}
                  renderItem={renderDestinationItem}
                  keyExtractor={item => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.destinationsList}
                />
              </View>

              {/* Trending Experiences */}
              <View style={styles.trendingSection}>
                <Text style={styles.sectionTitle}>Trending Experiences</Text>
                {/* Add trending experiences content */}
              </View>
            </>
          )}
        </ScrollView>

        {/* Add Bottom Navigation */}
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
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="search" size={24} color="#ffffff" />
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
  searchHeader: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 8,
    marginRight: 8,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  categoriesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryItemActive: {
    transform: [{scale: 1.1}],
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 14,
  },
  categoryTextActive: {
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  destinationCard: {
    width: width * 0.7,
    height: 200,
    marginRight: 16,
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
    justifyContent: 'flex-end',
    padding: 12,
  },
  destinationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  destinationName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  destinationCountry: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  destinationStats: {
    alignItems: 'flex-end',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#ffffff',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  postsCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  recentSearches: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  recentSearchText: {
    color: '#ffffff',
    marginLeft: 12,
    fontSize: 16,
  },
  popularSection: {
    marginTop: 24,
  },
  destinationsList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  trendingSection: {
    marginTop: 24,
    paddingBottom: 24,
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