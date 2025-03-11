import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { videosAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const VideoCard = ({
  video,
  onVideoUpdate,
  onVideoDelete,
  isOwner,
  containerStyle
}) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(video.likes.includes(user.id));

  const handlePlayPause = async () => {
    try {
      if (!videoRef.current) return;

      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
        // Increment views when video starts playing
        await videosAPI.incrementViews(video._id);
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Video playback error:', error);
      setError('Failed to play video');
    }
  };

  const handleUserPress = () => {
    navigation.navigate('UserProfile', { userId: video.userId._id });
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onVideoDelete(video._id)
        }
      ]
    );
  };

  const handleLike = async () => {
    try {
      setIsLoading(true);
      const updatedVideo = await videosAPI.likeVideo(video._id);
      setIsLiked(!isLiked);
      onVideoUpdate(updatedVideo);
    } catch (error) {
      console.error('Like error:', error);
      Alert.alert('Error', 'Failed to update like');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* User Info */}
      <TouchableOpacity style={styles.userInfo} onPress={handleUserPress}>
        <Image
          source={{ uri: video.userId.profileImage }}
          style={styles.profileImage}
        />
        <View style={styles.userTextContainer}>
          <Text style={styles.username}>{video.userId.username}</Text>
          <Text style={styles.location}>{video.location.name}</Text>
        </View>
        {isOwner && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Video Player */}
      <TouchableOpacity
        style={styles.videoContainer}
        onPress={handlePlayPause}
        activeOpacity={0.9}
      >
        <Video
          ref={videoRef}
          source={{ uri: video.videoUrl }}
          style={styles.video}
          resizeMode="cover"
          isLooping
          onError={() => setError('Failed to load video')}
        />
        
        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <View style={styles.playOverlay}>
            <Ionicons name="play" size={48} color="#ffffff" />
          </View>
        )}

        {/* Duration */}
        <View style={styles.durationContainer}>
          <Text style={styles.durationText}>
            {formatDuration(video.duration)}
          </Text>
        </View>

        {/* Error Overlay */}
        {error && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Video Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{video.title}</Text>
        {video.description && (
          <Text style={styles.description} numberOfLines={2}>
            {video.description}
          </Text>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Ionicons name="eye-outline" size={20} color="#ffffff" />
          <Text style={styles.statText}>{formatViews(video.views)}</Text>
        </View>

        <TouchableOpacity
          style={styles.stat}
          onPress={handleLike}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={20}
                color={isLiked ? "#FF3B30" : "#ffffff"}
              />
              <Text style={styles.statText}>
                {formatViews(video.likes.length)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
    overflow: 'hidden',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  location: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
  videoContainer: {
    width: '100%',
    height: width * 0.5625, // 16:9 aspect ratio
    backgroundColor: '#000000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationContainer: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 4,
  },
});

export default VideoCard;