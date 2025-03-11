import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import AccountTypeScreen from '../screens/auth/AccountTypeScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';
import CreatorHomeScreen from '../screens/creator/HomeScreen';
import ExplorerHomeScreen from '../screens/explorer/HomeScreen';
import SearchScreen from '../screens/shared/SearchScreen';
import SavedScreen from '../screens/shared/SavedScreen';
import ProfileScreen from '../screens/creator/ProfileScreen';
import EditProfileScreen from '../screens/creator/EditProfileScreen';
import NotificationsScreen from '../screens/creator/NotificationsScreen';
import UserProfileScreen from '../screens/shared/UserProfileScreen';
import VideosScreen from '../screens/creator/VideosScreen';
import CreateVideoScreen from '../screens/creator/CreateVideoScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ErrorBoundary from '../components/ErrorBoundary';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        animation: 'none',
        contentStyle: { backgroundColor: '#232526' },
        cardStyle: { backgroundColor: '#232526' },
        presentation: 'modal',
        animationEnabled: false
      }}
    >
      {/* Auth Screens */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="AccountType" component={AccountTypeScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />

      {/* Main Screens */}
      <Stack.Screen 
        name="CreatorHome" 
        component={CreatorHomeScreen}
      />
      <Stack.Screen name="ExplorerHome" component={ExplorerHomeScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Saved" component={SavedScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      
      {/* Video Screens */}
      <Stack.Screen 
        name="Videos" 
        component={VideosScreen}
        options={{
          headerShown: true,
          headerTitle: 'My Videos',
          headerStyle: {
            backgroundColor: '#232526',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen 
        name="CreateVideo" 
        component={CreateVideoScreen}
        options={{
          headerShown: true,
          headerTitle: 'Create Video',
          headerStyle: {
            backgroundColor: '#232526',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />

      {/* Settings */}
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
      />
    </Stack.Navigator>
  );
} 