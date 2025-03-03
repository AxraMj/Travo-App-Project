import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import AccountTypeScreen from './src/screens/auth/AccountTypeScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ProfileSetupScreen from './src/screens/auth/ProfileSetupScreen';
import CreatorHomeScreen from './src/screens/creator/HomeScreen';
import ExplorerHomeScreen from './src/screens/explorer/HomeScreen';
import SearchScreen from './src/screens/shared/SearchScreen';
import SavedScreen from './src/screens/shared/SavedScreen';
import { AuthProvider } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
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
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="AccountType" component={AccountTypeScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          <Stack.Screen name="CreatorHome" component={CreatorHomeScreen} />
          <Stack.Screen name="ExplorerHome" component={ExplorerHomeScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Saved" component={SavedScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
