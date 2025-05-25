import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MoviesStackParamList } from '../navigation/MovieStack';
import type { FilmRatingMap } from '../lib/letterboxd';
import { getLetterboxdUsername, getLetterboxdRawImport, saveMovieSuggestion, getFirstMovieSuggestion } from '../lib/subabase';
import { supabase } from '../lib/subabase';
import { askChatGPTAboutLetterboxd } from '../lib/openai';
import { GEMINI_API_KEY } from '@env'; // Add to your .env

declare module '@env' {
  export const GEMINI_API_KEY: string;
}

function extractFirstJsonArray(text: string): string | null {
  const match = text.match(/\[\s*{[\s\S]*?}\s*\]/);
  return match ? match[0] : null;
}

export default function Movies({ isConnected = false }: { isConnected?: boolean }) {
  const navigation = useNavigation<NativeStackNavigationProp<MoviesStackParamList>>();
  const route = useRoute<RouteProp<MoviesStackParamList, 'MoviesHome'>>();
  const [ratings, setRatings] = useState<FilmRatingMap | undefined>(route.params?.ratings);
  const [letterboxdUsername, setLetterboxdUsername] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<{ title: string; reason: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsernameAndSuggestion = async () => {
      const user = await supabase.auth.getUser();
      const userId = user?.data?.user?.id;
      if (userId) {
        try {
          const username = await getLetterboxdUsername(userId);
          setLetterboxdUsername(username);
          if (username) {
            setLoading(true);
            try {
              const s = await getFirstMovieSuggestion(userId);
              setSuggestion(s ?? null);
            } catch {}
            setLoading(false);
          }
        } catch (e) {
          setLetterboxdUsername(null);
        }
      }
    };
    fetchUsernameAndSuggestion();
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
      const prompt = `Give me 10 movies I should watch next based on my Letterboxd data. For each, provide a title and a short reason, and output as a JSON array like this:
      [
        {"title": "Movie Title", "reason": "Why you recommend it"},
        ...
      ]`;
      const response = await askChatGPTAboutLetterboxd(raw, prompt);
      console.log('LLM response:', response);
      let suggestions: { title: string; reason: string }[] = [];
      let jsonStr = response;
      const extracted = extractFirstJsonArray(response);
      if (extracted) jsonStr = extracted;
      try {
        suggestions = JSON.parse(jsonStr);
        console.log('Parsed suggestions:', suggestions);
      } catch (e) {
        console.log('Failed to parse suggestions:', e, response);
      }
      for (const suggestion of suggestions) {
        const { error } = await saveMovieSuggestion(userId, suggestion.title, suggestion.reason);
        if (error) console.log('Supabase insert error:', error);
      }
      // After saving, fetch the first suggestion again
      const s = await getFirstMovieSuggestion(userId);
      setSuggestion(s ?? null);
    } catch (e) {
      setSuggestion(null);
    }
    setLoading(false);
  };

  if (letterboxdUsername) {
    if (loading) {
      return (
        <View style={styles.container}>
          <Text style={styles.heading}>Loading your movie suggestion...</Text>
        </View>
      );
    }
    if (suggestion) {
      return (
        <ScrollView style={styles.scroll}>
          <Text style={styles.heading}>Your First Movie Suggestion</Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 24 }}>{suggestion.title}</Text>
          <Text style={{ marginTop: 16, fontSize: 16, color: '#333' }}>{suggestion.reason}</Text>
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
