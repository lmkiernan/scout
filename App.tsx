import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SignIn from './src/screens/SignIn';
import Movies from './src/screens/Movies';
import Books from './src/screens/Books';
import Restaurants from './src/screens/Restaurants';
import Wine from './src/screens/Wine';
import LetterboxdConnect from './src/screens/LetterboxdConnect';
import { Ionicons } from '@expo/vector-icons';
import ScoutLogo from './src/components/ScoutLogo';
import { supabase } from './src/lib/subabase';
import MoviesStack from './src/navigation/MovieStack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState<any>(null);

  // Check for session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        setUser(data.session.user);
      }
    };
    checkSession();

    // Optional: Listen for auth state changes (sign in/out)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Handler to simulate sign in (replace with real logic later)
  const handleSignIn = (userData: any) => {
    setUser(userData);
  };

  if (!user) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SignIn">
              {props => <SignIn {...props} onSignIn={handleSignIn} />}
            </Stack.Screen>
            <Stack.Screen
              name="LetterboxdConnect"
              component={LetterboxdConnect}
              options={{ presentation: 'modal', headerShown: true, title: 'Connect Letterboxd' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerTitle: () => (
              <ScoutLogo width={88} height={55} />
            ),
            headerTitleAlign: 'center',
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap = 'ellipse'; // default icon

              if (route.name === 'Movies') {
                iconName = focused ? 'film' : 'film-outline';
              } else if (route.name === 'Books') {
                iconName = focused ? 'book' : 'book-outline';
              } else if (route.name === 'Restaurants') {
                iconName = focused ? 'restaurant' : 'restaurant-outline';
              } else if (route.name === 'Wine') {
                iconName = focused ? 'wine' : 'wine-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#0c65bb',
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen name="Movies" component={MoviesStack} />
          <Tab.Screen name="Books" component={Books} />
          <Tab.Screen name="Restaurants" component={Restaurants} />
          <Tab.Screen name="Wine" component={Wine} />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}