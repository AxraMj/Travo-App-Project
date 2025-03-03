import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  Dimensions,
  Animated 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function PostCard({ post }) {
  const [isLiked, setIsLiked] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [likeScale] = useState(new Animated.Value(1));

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

  return (
    <View style={styles.container}>
      {/* User Info Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.userInfo}>
          <Image 
            source={{ uri: post.user.profileImage }} 
            style={styles.profileImage} 
          />
          <View>
            <Text style={styles.username}>{post.user.username}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-sharp" size={14} color="#FF6B6B" />
              <Text style={styles.location}>{post.location}</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <View style={styles.weatherContainer}>
          <Ionicons name="partly-sunny" size={20} color="#FFD93D" />
          <Text style={styles.temperature}>{post.weather.temp}°C</Text>
        </View>
      </View>

      {/* Post Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: post.image }} 
          style={styles.postImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)']}
          style={styles.imageGradient}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleLike}
          >
            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={28} 
                color={isLiked ? "#FF6B6B" : "#ffffff"} 
              />
            </Animated.View>
            <Text style={styles.actionText}>{post.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={26} color="#ffffff" />
            <Text style={styles.actionText}>{post.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="location" size={26} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        <View style={styles.rightActions}>
          <TouchableOpacity 
            style={styles.tipsButton}
            onPress={() => setShowTips(!showTips)}
          >
            <Ionicons 
              name="bulb-outline" 
              size={26} 
              color="#FFD93D" 
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="bookmark-outline" size={26} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Description */}
      <View style={styles.content}>
        <Text style={styles.description}>{post.description}</Text>
      </View>

      {/* Travel Tips */}
      {showTips && (
        <View style={styles.tipsContainer}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color="#FFD93D" />
            <Text style={styles.tipsTitle}>Travel Tips</Text>
          </View>
          {post.travelTips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  username: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  location: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginLeft: 2,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 6,
    borderRadius: 12,
  },
  temperature: {
    color: '#ffffff',
    marginLeft: 4,
    fontWeight: '500',
  },
  imageContainer: {
    width: '100%',
    height: width - 32, // Account for horizontal margin
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    color: '#ffffff',
    marginLeft: 4,
    fontSize: 14,
  },
  tipsButton: {
    marginRight: 20,
  },
  content: {
    padding: 12,
  },
  description: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
  },
  tipsContainer: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    margin: 12,
    marginTop: 0,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipsTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  tipText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});