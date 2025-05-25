import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MoviesStackParamList } from '../navigation/MovieStack';
import type { FilmRatingMap } from '../lib/letterboxd';
import { getLetterboxdUsername, getLetterboxdRawImport } from '../lib/subabase';
import { supabase } from '../lib/subabase';
import { askChatGPTAboutLetterboxd } from '../lib/openai';

export default function Movies({ isConnected = false }: { isConnected?: boolean }) {
  const navigation = useNavigation<NativeStackNavigationProp<MoviesStackParamList>>();
  const route = useRoute<RouteProp<MoviesStackParamList, 'MoviesHome'>>();
  const [ratings, setRatings] = useState<FilmRatingMap | undefined>(route.params?.ratings);
  const [letterboxdUsername, setLetterboxdUsername] = useState<string | null>(null);
  const [gptOutput, setGptOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsername = async () => {
      const user = await supabase.auth.getUser();
      const userId = user?.data?.user?.id;
      if (userId) {
        try {
          const username = await getLetterboxdUsername(userId);
          setLetterboxdUsername(username);
        } catch (e) {
          // handle error or set to null
          setLetterboxdUsername(null);
        }
      }
    };
    fetchUsername();
  }, []);

  const handleConnectPress = () => {
    navigation.navigate('LetterboxdConnect', {
      onConnected: (ratings: FilmRatingMap) => {
        setRatings(ratings);
      }
    });
  };

  const handleAskGPT = async () => {
    setLoading(true);
    try {
      const user = await supabase.auth.getUser();
      const userId = user?.data?.user?.id;
      if (!userId) throw new Error('No user');
      const raw = await getLetterboxdRawImport(userId);
      if (!raw) throw new Error('No Letterboxd data found');
      const apiKey = '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';
      const prompt = 'Give me 10 movies that assuredly do not appear on this list that I should watch next and a description of to why based on the movies that I have seen and rated highly from my Letterboxd data!';
      const response = await askChatGPTAboutLetterboxd(raw, prompt, apiKey);
      setGptOutput(response);
    } catch (e) {
      setGptOutput(String(e));
    }
    setLoading(false);
  };

  if (letterboxdUsername) {
    if (gptOutput) {
      return (
        <ScrollView style={styles.scroll}>
          <Text style={styles.heading}>Your Movie Suggestions</Text>
          <Text style={{ marginTop: 24, fontSize: 16, color: '#333' }}>{gptOutput}</Text>
        </ScrollView>
      );
    }
    return (
      <ScrollView style={styles.scroll}>
        <Text style={styles.heading}>Connected Letterboxd Account</Text>
        <Text style={{ fontSize: 18, color: '#0c65bb', marginTop: 16 }}>
          {letterboxdUsername}
        </Text>
        <TouchableOpacity
          style={[styles.button, { marginTop: 32 }]}
          onPress={handleAskGPT}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Thinking...' : 'Get Movie Suggestions'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.scroll}>
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
    </ScrollView>
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
  scroll: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f7f7f7',
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
