import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BottomTabBar({ state, navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => navigation.navigate('Home')}
      >
        <Ionicons 
          name={state.index === 0 ? "home" : "home-outline"} 
          size={24} 
          color={state.index === 0 ? "#ffffff" : "rgba(255,255,255,0.7)"} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => navigation.navigate('Map')}
      >
        <Ionicons 
          name={state.index === 1 ? "map" : "map-outline"} 
          size={24} 
          color={state.index === 1 ? "#ffffff" : "rgba(255,255,255,0.7)"} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => navigation.navigate('Search')}
      >
        <Ionicons 
          name={state.index === 2 ? "search" : "search-outline"} 
          size={24} 
          color={state.index === 2 ? "#ffffff" : "rgba(255,255,255,0.7)"} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => navigation.navigate('Saved')}
      >
        <Ionicons 
          name={state.index === 3 ? "bookmark" : "bookmark-outline"} 
          size={24} 
          color={state.index === 3 ? "#ffffff" : "rgba(255,255,255,0.7)"} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#232526',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 