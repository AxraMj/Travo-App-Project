import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CreatorHomeScreen from './screens/creator/HomeScreen';
import ExplorerHomeScreen from './screens/explorer/HomeScreen';
import ProfileScreen from './screens/creator/ProfileScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="CreatorHome" component={CreatorHomeScreen} />
        <Stack.Screen name="ExplorerHome" component={ExplorerHomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 