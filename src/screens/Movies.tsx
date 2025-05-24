import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MoviesStackParamList } from '../navigation/MovieStack';

export default function Movies({ isConnected = false }: { isConnected?: boolean }) {
  const navigation = useNavigation<NativeStackNavigationProp<MoviesStackParamList>>();

  const handleConnectPress = () => {
    navigation.navigate('LetterboxdConnect');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={require('../../assets/Letterboxd-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.heading}>
          {isConnected ? 'Refresh Your Letterboxd Data' : 'Connect Your Letterboxd'}
        </Text>
        <Text style={styles.subheading}>
          {isConnected
            ? 'Tap below to sync your latest movies and ratings.'
            : 'Import watched movies and ratings for personalized suggestions.'}
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleConnectPress}>
          <Text style={styles.buttonText}>
            {isConnected ? 'Refresh Data' : 'Connect Letterboxd'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
    tintColor: '#0c65bb',
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#0c65bb',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
