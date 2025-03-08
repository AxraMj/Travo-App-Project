import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function PostCard({ post }) {
  const [isLiked, setIsLiked] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const likeScale = useState(new Animated.Value(1))[0];
  const tipsHeight = useRef(new Animated.Value(0)).current;

  // Add null check and default values
  const {
    userId = {},
    image,
    description = '',
    location = { name: 'Unknown Location' },
    weather = { temp: 0, description: 'Unknown' },
    likes = [],
    comments = [],
    travelTips = []
  } = post || {};

  // Safely access user data with username as fallback
  const username = userId?.username || 'username';
  const fullName = userId?.fullName || username;
  const profileImage = userId?.profileImage || 'https://via.placeholder.com/40';

  const handleLike = () => {
    setIsLiked(!isLiked);
    Animated.sequence([
      Animated.spring(likeScale, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleShowTips = () => {
    setShowTips(!showTips);
    Animated.timing(tipsHeight, {
      toValue: !showTips ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  if (!post) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Profile Image */}
        <Image 
          source={{ uri: profileImage }} 
          style={styles.profileImage} 
        />

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* User Info Header */}
          <View style={styles.userInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.fullName}>{fullName}</Text>
              <Text style={styles.username}>@{username}</Text>
            </View>
            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="ellipsis-horizontal" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </View>

          {/* Post Text */}
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}

          {/* Post Image */}
          {image && (
            <Image 
              source={{ uri: image }} 
              style={styles.postImage}
              resizeMode="cover"
            />
          )}

          {/* Location and Weather */}
          <View style={styles.locationWeather}>
            <View style={styles.locationContainer}>
              <Ionicons name="location-sharp" size={14} color="#FF6B6B" />
              <Text style={styles.location}>{location.name}</Text>
            </View>
            <View style={styles.weatherContainer}>
              <Ionicons name="partly-sunny" size={14} color="#FFD93D" />
              <Text style={styles.temperature}>{weather.temp}°C</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={20} color="rgba(255,255,255,0.7)" />
              <Text style={styles.actionText}>{comments.length}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleLike}
            >
              <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                <Ionicons 
                  name={isLiked ? "heart" : "heart-outline"} 
                  size={20} 
                  color={isLiked ? "#FF6B6B" : "rgba(255,255,255,0.7)"} 
                />
              </Animated.View>
              <Text style={styles.actionText}>{likes.length}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="bookmark-outline" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, showTips && styles.activeActionButton]}
              onPress={handleShowTips}
            >
              <Ionicons 
                name={showTips ? "bulb" : "bulb-outline"}
                size={20} 
                color={travelTips.length > 0 ? "#FFD93D" : "rgba(255,255,255,0.7)"} 
              />
              <Text style={[
                styles.actionText,
                showTips && { color: "#FFD93D" }
              ]}>{travelTips.length}</Text>
            </TouchableOpacity>
          </View>

          {/* Travel Tips Section */}
          <Animated.View 
            style={[
              styles.tipsSection,
              {
                maxHeight: tipsHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 500]
                }),
                opacity: tipsHeight
              }
            ]}
          >
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={16} color="#FFD93D" />
              <Text style={styles.tipsTitle}>Travel Tips</Text>
            </View>
            
            {travelTips.length > 0 ? (
              travelTips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Ionicons name="chevron-forward" size={16} color="#FFD93D" />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))
            ) : (
              <View style={styles.noTipsContainer}>
                <Text style={styles.noTipsText}>No travel tips available</Text>
              </View>
            )}
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 12,
  },
  contentContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  mainContent: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fullName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  username: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  moreButton: {
    padding: 4,
  },
  description: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: width * 0.5,
    borderRadius: 8,
    marginBottom: 10,
  },
  locationWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 8,
    borderRadius: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    color: '#FF6B6B',
    fontSize: 13,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  temperature: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 6,
  },
  activeActionButton: {
    backgroundColor: 'rgba(255, 217, 61, 0.1)',
    borderRadius: 20,
  },
  actionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  tipsSection: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: 12,
    overflow: 'hidden',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  tipsTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 6,
  },
  tipText: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  noTipsContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  noTipsText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
});