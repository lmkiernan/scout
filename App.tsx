import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SignIn from './src/screens/SignIn';
import Movies from './src/screens/Movies';
import Books from './src/screens/Books';
import Restaurants from './src/screens/Restaurants';
import Wine from './src/screens/Wine';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState<any>(null);

  // Handler to simulate sign in (replace with real logic later)
  const handleSignIn = (userData: any) => {
    setUser(userData);
  };

  if (!user) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SignIn">
            {props => <SignIn {...props} onSignIn={handleSignIn} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Movies" component={Movies} />
        <Tab.Screen name="Books" component={Books} />
        <Tab.Screen name="Restaurants" component={Restaurants} />
        <Tab.Screen name="Wine" component={Wine} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}