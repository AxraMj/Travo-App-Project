import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { videosAPI } from '../../services/api';

const { width } = Dimensions.get('window');

export default function CreateVideoScreen({ navigation }) {
  const [video, setVideo] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const videoAsset = result.assets[0];
        
        // Get video file info
        const fileInfo = await FileSystem.getInfoAsync(videoAsset.uri);
        
        // Check file size (max 100MB)
        if (fileInfo.size > 100 * 1024 * 1024) {
          Alert.alert('Error', 'Video size must be less than 100MB');
          return;
        }

        setVideo({
          uri: videoAsset.uri,
          duration: videoAsset.duration || 0,
          type: 'video/mp4'
        });
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      // Reverse geocode to get address
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      setLocation({
        name: address ? `${address.city || ''}, ${address.country || ''}`.trim() : 'Unknown Location',
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!video || !title || !location) {
        Alert.alert('Missing fields', 'Please fill in all required fields');
        return;
      }

      setLoading(true);

      // Convert video to base64
      const base64 = await FileSystem.readAsStringAsync(video.uri, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Create form data
      const videoData = {
        title,
        description,
        location,
        video: base64,
        duration: video.duration
      };

      // Upload video
      await videosAPI.createVideo(videoData);

      // Navigate back to videos screen
      navigation.goBack();
    } catch (error) {
      console.error('Error uploading video:', error);
      Alert.alert('Error', 'Failed to upload video. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <LinearGradient
      colors={['#232526', '#414345', '#232526']}
      style={styles.container}
    >
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity 
          style={styles.uploadContainer}
          onPress={pickVideo}
          disabled={loading}
        >
          {video ? (
            <Video
              source={{ uri: video.uri }}
              style={styles.videoPreview}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="cloud-upload-outline" size={48} color="#ffffff" />
              <Text style={styles.uploadText}>Select Video</Text>
              <Text style={styles.uploadSubtext}>Max 1 minute, 100MB</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter video title"
              placeholderTextColor="rgba(255,255,255,0.5)"
              maxLength={100}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter video description"
              placeholderTextColor="rgba(255,255,255,0.5)"
              multiline
              numberOfLines={4}
              maxLength={1000}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location *</Text>
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>
                {locationLoading ? 'Getting location...' : 
                  location ? location.name : 'Location not available'}
              </Text>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={getCurrentLocation}
                disabled={loading || locationLoading}
              >
                <Ionicons 
                  name="refresh" 
                  size={24} 
                  color={loading || locationLoading ? 'rgba(255,255,255,0.5)' : '#ffffff'} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {loading && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
            <Text style={styles.progressText}>{uploadProgress}%</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>Upload Video</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  uploadContainer: {
    width: '100%',
    height: width * 0.5625, // 16:9 aspect ratio
    backgroundColor: '#414345',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  videoPreview: {
    width: '100%',
    height: '100%',
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  uploadSubtext: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 4,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#414345',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#414345',
    borderRadius: 8,
    padding: 12,
  },
  locationText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  refreshButton: {
    padding: 4,
  },
  progressContainer: {
    backgroundColor: '#414345',
    borderRadius: 8,
    height: 4,
    marginVertical: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1DA1F2',
  },
  progressText: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#1DA1F2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 