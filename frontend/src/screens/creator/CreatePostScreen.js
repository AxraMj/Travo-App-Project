import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { postAPI } from '../../services/api';

export default function CreatePostScreen({ navigation }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [postData, setPostData] = useState({
    image: null,
    location: {
      name: '',
      coordinates: {
        latitude: null,
        longitude: null
      }
    },
    weather: {
      temp: null,
      description: '',
      icon: ''
    },
    description: '',
    travelTips: ['']
  });

  // Pick image from library
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setPostData(prev => ({
          ...prev,
          image: result.assets[0].uri
        }));
      }
    } catch (error) {
      console.log('Image picking error:', error);
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    setIsLocationLoading(true);
    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        setIsLocationLoading(false);
        return;
      }

      // Get location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Reverse geocode to get address
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      // Get weather data
      const weatherData = await fetchWeatherData(latitude, longitude);

      // Update state
      setPostData(prev => ({
        ...prev,
        location: {
          name: `${address.city || address.region}, ${address.country}`,
          coordinates: { latitude, longitude }
        },
        weather: weatherData || {
          temp: null,
          description: '',
          icon: ''
        }
      }));
    } catch (error) {
      console.log('Location error:', error);
      Alert.alert('Location Error', 'Could not fetch location data');
    } finally {
      setIsLocationLoading(false);
    }
  };

  // Mock function to fetch weather data
  const fetchWeatherData = async (lat, lon) => {
    // In a real app, you would fetch this from a weather API
    // This is a placeholder
    return {
      temp: 28,
      description: 'Sunny',
      icon: 'partly-sunny'
    };
  };

  // Add travel tip
  const addTravelTip = () => {
    setPostData(prev => ({
      ...prev,
      travelTips: [...prev.travelTips, '']
    }));
  };

  // Update travel tip
  const updateTravelTip = (index, value) => {
    const updatedTips = [...postData.travelTips];
    updatedTips[index] = value;
    setPostData(prev => ({
      ...prev,
      travelTips: updatedTips
    }));
  };

  // Remove travel tip
  const removeTravelTip = (index) => {
    if (postData.travelTips.length === 1) {
      // Keep at least one tip field
      setPostData(prev => ({
        ...prev,
        travelTips: ['']
      }));
    } else {
      const updatedTips = postData.travelTips.filter((_, i) => i !== index);
      setPostData(prev => ({
        ...prev,
        travelTips: updatedTips
      }));
    }
  };

  // Submit post
  const handleSubmit = async () => {
    // Validate required fields
    if (!postData.image) {
      Alert.alert('Error', 'Please select an image');
      return;
    }

    if (!postData.location.name) {
      Alert.alert('Error', 'Please add a location');
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, you would upload the image to a server
      // and send the post data to your API
      
      // Mock success response
      setTimeout(() => {
        // Navigate back to home screen after successful submission
        navigation.replace('CreatorHome');
      }, 1500);
      
    } catch (error) {
      console.log('Post creation error:', error);
      Alert.alert('Error', 'Failed to create post');
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#232526', '#414345', '#232526']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={isLoading}
            style={styles.saveButton}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.saveText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Image Picker */}
          <TouchableOpacity 
            style={styles.imagePickerContainer}
            onPress={pickImage}
          >
            {postData.image ? (
              <Image 
                source={{ uri: postData.image }}
                style={styles.previewImage}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={50} color="rgba(255,255,255,0.7)" />
                <Text style={styles.imagePlaceholderText}>Tap to select an image</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Location Picker */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationContainer}>
              <View style={styles.locationInput}>
                {postData.location.name ? (
                  <Text style={styles.locationText}>{postData.location.name}</Text>
                ) : (
                  <Text style={styles.locationPlaceholder}>Add location</Text>
                )}
              </View>
              <TouchableOpacity 
                style={styles.locationButton}
                onPress={getCurrentLocation}
                disabled={isLocationLoading}
              >
                {isLocationLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Ionicons name="location-outline" size={24} color="#FF6B6B" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Weather Info (shown if available) */}
          {postData.weather.temp && (
            <View style={styles.weatherContainer}>
              <Ionicons name="partly-sunny" size={24} color="#FFD93D" />
              <Text style={styles.weatherText}>
                {postData.weather.temp}°C, {postData.weather.description}
              </Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Share details about your travel experience..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              multiline
              numberOfLines={4}
              value={postData.description}
              onChangeText={(text) => setPostData(prev => ({...prev, description: text}))}
            />
          </View>

          {/* Travel Tips */}
          <View style={styles.sectionContainer}>
            <View style={styles.tipsHeader}>
              <Text style={styles.sectionTitle}>Travel Tips</Text>
              <TouchableOpacity onPress={addTravelTip}>
                <Ionicons name="add-circle-outline" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            {postData.travelTips.map((tip, index) => (
              <View key={index} style={styles.tipInputContainer}>
                <TextInput
                  style={styles.tipInput}
                  placeholder="Add a travel tip..."
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={tip}
                  onChangeText={(text) => updateTravelTip(index, text)}
                />
                <TouchableOpacity onPress={() => removeTravelTip(index)}>
                  <Ionicons name="close-circle-outline" size={24} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
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
  saveButton: {
    padding: 8,
  },
  saveText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imagePickerContainer: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 10,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
  },
  locationText: {
    color: '#ffffff',
    fontSize: 16,
  },
  locationPlaceholder: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
  },
  locationButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  weatherText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 10,
  },
  descriptionInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
  },
  tipsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    marginRight: 10,
  },
}); 