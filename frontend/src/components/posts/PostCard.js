import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { postsAPI } from '../../services/api';

const { width } = Dimensions.get('window');

export default function PostCard({ post, onPostUpdate }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localPost, setLocalPost] = useState(post);
  const likeScale = useRef(new Animated.Value(1)).current;
  const saveScale = useRef(new Animated.Value(1)).current;

  // Handle like animation
  const animateScale = (scale) => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLike = async () => {
    try {
      animateScale(likeScale);
      const updatedPost = await postsAPI.likePost(localPost._id);
      setLocalPost(updatedPost);
      if (onPostUpdate) onPostUpdate(updatedPost);
    } catch (error) {
      console.error('Like error:', error);
      Alert.alert('Error', 'Failed to like post');
    }
  };

  const handleSave = async () => {
    try {
      animateScale(saveScale);
      const updatedPost = await postsAPI.savePost(localPost._id);
      setLocalPost(updatedPost);
      if (onPostUpdate) onPostUpdate(updatedPost);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save post');
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const updatedPost = await postsAPI.addComment(localPost._id, { text: newComment });
      setLocalPost(updatedPost);
      setNewComment('');
      if (onPostUpdate) onPostUpdate(updatedPost);
    } catch (error) {
      console.error('Comment error:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const updatedPost = await postsAPI.deleteComment(localPost._id, commentId);
      setLocalPost(updatedPost);
      if (onPostUpdate) onPostUpdate(updatedPost);
    } catch (error) {
      console.error('Delete comment error:', error);
      Alert.alert('Error', 'Failed to delete comment');
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <Image 
        source={{ 
          uri: item.userId?.profileImage || 'https://via.placeholder.com/150'
        }} 
        style={styles.commentAvatar}
      />
      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>
          {item.userId?.username || 'Unknown User'}
        </Text>
        <Text style={styles.commentText}>{item.text}</Text>
      </View>
      {(user?.id === item.userId?._id || user?.id === localPost.userId?._id) && (
        <TouchableOpacity 
          style={styles.deleteComment}
          onPress={() => handleDeleteComment(item._id)}
        >
          <Ionicons name="close" size={16} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
      )}
    </View>
  );

  if (!localPost) return null;

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Profile Image */}
        <Image 
          source={{ uri: localPost.userId.profileImage }} 
          style={styles.profileImage} 
        />

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* User Info Header */}
          <View style={styles.userInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.fullName}>{localPost.userId.fullName}</Text>
              <Text style={styles.username}>@{localPost.userId.username}</Text>
            </View>
            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="ellipsis-horizontal" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </View>

          {/* Post Text */}
          {localPost.description && (
            <Text style={styles.description}>{localPost.description}</Text>
          )}

          {/* Post Image */}
          {localPost.image && (
            <Image 
              source={{ uri: localPost.image }} 
              style={styles.postImage}
              resizeMode="cover"
            />
          )}

          {/* Location and Weather */}
          <View style={styles.locationWeather}>
            <View style={styles.locationContainer}>
              <Ionicons name="location-sharp" size={14} color="#FF6B6B" />
              <Text style={styles.location}>{localPost.location.name}</Text>
            </View>
            <View style={styles.weatherContainer}>
              <Ionicons name="partly-sunny" size={14} color="#FFD93D" />
              <Text style={styles.temperature}>{localPost.weather.temp}°C</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setShowComments(true)}
            >
              <Ionicons 
                name="chatbubble-outline" 
                size={20} 
                color="rgba(255,255,255,0.7)" 
              />
              <Text style={styles.actionText}>{localPost.comments.length}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleLike}
            >
              <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                <Ionicons 
                  name={localPost.isLiked ? "heart" : "heart-outline"} 
                  size={20} 
                  color={localPost.isLiked ? "#FF6B6B" : "rgba(255,255,255,0.7)"} 
                />
              </Animated.View>
              <Text style={styles.actionText}>{localPost.likes.length}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setShowTips(!showTips)}
            >
              <Ionicons 
                name="bulb-outline" 
                size={20} 
                color={showTips ? "#FFD93D" : "rgba(255,255,255,0.7)"} 
              />
              <Text style={styles.actionText}>{localPost.travelTips.length}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleSave}
            >
              <Animated.View style={{ transform: [{ scale: saveScale }] }}>
                <Ionicons 
                  name={localPost.isSaved ? "bookmark" : "bookmark-outline"} 
                  size={20} 
                  color={localPost.isSaved ? "#FFD93D" : "rgba(255,255,255,0.7)"} 
                />
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Travel Tips Section */}
          {showTips && (
            <View style={styles.tipsSection}>
              <View style={styles.tipsSectionHeader}>
                <Ionicons name="bulb" size={18} color="#FFD93D" />
                <Text style={styles.tipsSectionTitle}>Travel Tips</Text>
              </View>
              {localPost.travelTips.length === 0 ? (
                <Text style={styles.noTips}>No travel tips available</Text>
              ) : (
                localPost.travelTips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Text style={styles.tipBullet}>•</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </View>

      {/* Comments Modal */}
      <Modal
        visible={showComments}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowComments(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowComments(false)}
              >
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={localPost.comments}
              renderItem={renderComment}
              keyExtractor={item => item._id}
              contentContainerStyle={styles.commentsList}
              ListEmptyComponent={
                <Text style={styles.noComments}>No comments yet</Text>
              }
            />

            <View style={styles.commentInput}>
              <TextInput
                style={styles.input}
                placeholder="Add a comment..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" style={styles.submitButton} />
              ) : (
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleComment}
                  disabled={!newComment.trim()}
                >
                  <Ionicons 
                    name="send" 
                    size={24} 
                    color={newComment.trim() ? "#FF6B6B" : "rgba(255,255,255,0.3)"} 
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
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
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 6,
  },
  actionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#232526',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  commentsList: {
    flexGrow: 1,
    paddingVertical: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
  },
  commentText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  deleteComment: {
    padding: 4,
  },
  noComments: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 20,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#ffffff',
    maxHeight: 100,
  },
  submitButton: {
    padding: 8,
  },
  tipsSection: {
    marginTop: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: 12,
  },
  tipsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsSectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    color: '#FFD93D',
    fontSize: 16,
    marginRight: 8,
    marginTop: -2,
  },
  tipText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
  },
  noTips: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    fontSize: 14,
  },
});