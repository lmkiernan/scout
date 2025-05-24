import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Movies from '../screens/Movies';
import LetterboxdConnect from '../screens/LetterboxdConnect';

export type MoviesStackParamList = {
  Movies: undefined;
  LetterboxdConnect: undefined;
};

const Stack = createNativeStackNavigator<MoviesStackParamList>();

export default function MoviesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Movies" component={Movies} options={{ headerShown: false }} />
      <Stack.Screen
        name="LetterboxdConnect"
        component={LetterboxdConnect}
        options={{ presentation: 'modal', title: 'Connect Letterboxd' }}
      />
    </Stack.Navigator>
  );
}
