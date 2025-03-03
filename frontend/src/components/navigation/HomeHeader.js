import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function HomeHeader({ navigation, isCreator = false }) {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.profileButton}
        onPress={() => navigation.navigate('Profile')}
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

      <View style={styles.rightButtons}>
        {isCreator ? (
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <Ionicons name="add-circle-outline" size={28} color="#ffffff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('Following')}
          >
            <Ionicons name="people-outline" size={28} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#232526',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
}); 