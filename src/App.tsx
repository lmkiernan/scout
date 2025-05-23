import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator }   from '@react-navigation/native-stack';
import { createBottomTabNavigator }      from '@react-navigation/bottom-tabs';
import { initializeApp }                 from 'firebase/app';
import { getAuth, onAuthStateChanged }   from 'firebase/auth';

import SignIn      from './screens/SignIn';
import Movies      from './screens/Movies';
import Books       from './screens/Books';
import Restaurants from './screens/Restaurants';
import Wine        from './screens/Wine';

initializeApp({
  apiKey:    'YOUR_API_KEY',
  authDomain:'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  appId:     'YOUR_APP_ID',
});

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => onAuthStateChanged(getAuth(), setUser), []);

  if (!user) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SignIn" component={SignIn} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Movies"      component={Movies} />
        <Tab.Screen name="Books"       component={Books} />
        <Tab.Screen name="Restaurants" component={Restaurants} />
        <Tab.Screen name="Wine"        component={Wine} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}