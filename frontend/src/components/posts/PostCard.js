import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function PostCard({ post }) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image 
            source={{ uri: post.user.profileImage }} 
            style={styles.profileImage} 
          />
          <View>
            <Text style={styles.username}>{post.user.username}</Text>
            <Text style={styles.location}>
              <Ionicons name="location" size={14} color="#ffffff" />
              {post.location}
            </Text>
          </View>
        </View>
        <View style={styles.weatherInfo}>
          <Text style={styles.temperature}>{post.weather.temp}°C</Text>
          <Text style={styles.weatherDesc}>{post.weather.description}</Text>
        </View>
      </View>

      <Image 
        source={{ uri: post.image }} 
        style={styles.postImage} 
      />

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setIsLiked(!isLiked)}
        >
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={24} 
            color={isLiked ? "#ff4444" : "#ffffff"} 
          />
          <Text style={styles.actionText}>{post.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={24} color="#ffffff" />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="bookmark-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>{post.description}</Text>
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Travel Tips:</Text>
          {post.travelTips.map((tip, index) => (
            <Text key={index} style={styles.tip}>
              • {tip}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
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
  },
  username: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  location: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  weatherInfo: {
    alignItems: 'flex-end',
  },
  temperature: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  weatherDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  postImage: {
    width: width,
    height: width,
  },
  actions: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    color: '#ffffff',
    marginLeft: 5,
  },
  content: {
    padding: 15,
  },
  description: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 10,
  },
  tipsContainer: {
    marginTop: 10,
  },
  tipsTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tip: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 3,
  },
}); 