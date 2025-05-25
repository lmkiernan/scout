import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { fetchFilmRatings } from '../lib/letterboxd';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MoviesStackParamList } from '../navigation/MovieStack';

export default function LetterboxdConnect() {
  const [username, setUsername] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<MoviesStackParamList>>();
  const route = useRoute<RouteProp<{ params: { onConnected?: (ratings: any) => void } }, 'params'>>();
  const onConnected = route.params?.onConnected;

  // In the future, you will use this username with fetchFilmRatings
  // For now, just display it

  const handleConnect = async () => {
    try {
      const ratings = await fetchFilmRatings(username);
      if (onConnected) {
        onConnected(ratings);
      }
      navigation.goBack();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      Alert.alert('Error', message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter your Letterboxd username:</Text>
      <TextInput
        style={styles.input}
        placeholder="Letterboxd username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button title="Connect" onPress={handleConnect} disabled={!username} />
      {username ? (
        <Text style={styles.display}>Username: {username}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 18,
    marginBottom: 12,
    color: '#222',
  },
  input: {
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f7f7f7',
  },
  display: {
    marginTop: 16,
    fontSize: 16,
    color: '#0c65bb',
  },
});
