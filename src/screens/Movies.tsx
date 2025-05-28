import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image, ScrollView, Animated, Dimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MoviesStackParamList } from '../navigation/MovieStack';
import type { FilmRatingMap } from '../lib/letterboxd';
import { getLetterboxdUsername, getLetterboxdRawImport, saveMovieSuggestion, getAllMovieSuggestions, getMovieByTitle, addMovie } from '../lib/subabase';
import { supabase } from '../lib/subabase';
import { askChatGPTAboutLetterboxd } from '../lib/openai';
import { getOmdbPoster } from '../lib/watchmode';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

function extractFirstJsonArray(text: string): string | null {
  const cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '');
  const match = cleaned.match(/\[\s*{[\s\S]*?}\s*\]/);
  return match ? match[0] : null;
}

export default function Movies({ isConnected = false }: { isConnected?: boolean }) {
  const navigation = useNavigation<NativeStackNavigationProp<MoviesStackParamList>>();
  const route = useRoute<RouteProp<MoviesStackParamList, 'MoviesHome'>>();
  const [ratings, setRatings] = useState<FilmRatingMap | undefined>(route.params?.ratings);
  const [letterboxdUsername, setLetterboxdUsername] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{ title: string; reason: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [watchProviders, setWatchProviders] = useState<string[]>([]);

  useEffect(() => {
    const fetchUsernameAndSuggestions = async () => {
      const user = await supabase.auth.getUser();
      const userId = user?.data?.user?.id;
      if (userId) {
        try {
          const username = await getLetterboxdUsername(userId);
          setLetterboxdUsername(username);
          if (username) {
            setLoading(true);
            try {
              const all = await getAllMovieSuggestions(userId);
              setSuggestions(all);
              setCurrentIndex(0);
            } catch {}
            setLoading(false);
          }
        } catch (e) {
          setLetterboxdUsername(null);
        }
      }
    };
    fetchUsernameAndSuggestions();
  }, []);

  useEffect(() => {
    const fetchMetadata = async () => {
      const suggestion = suggestions[currentIndex];
      if (!suggestion) return;
      try {
        // 1. Try to get the movie from Supabase
        let movie = await getMovieByTitle(suggestion.title);
        if (movie && movie.poster) {
          setPosterUrl(movie.poster);
          console.log('Movie found in Supabase:', movie);
        } else {
          // 2. If not found, fetch poster from OMDb
          const posterUrl = await getOmdbPoster(suggestion.title);
          console.log('OMDb posterUrl:', posterUrl, 'for', suggestion.title);
          // 3. Upsert (insert or update) the movie
          try {
            const { data, error } = await supabase
              .from('movies')
              .upsert([{ title: suggestion.title, poster: posterUrl, metadata: {} }], { onConflict: 'title' })
              .select()
              .single();
            if (error) throw error;
            setPosterUrl(data.poster);
            console.log('Movie upserted to Supabase:', data);
          } catch (addErr) {
            // If upsert fails (e.g. due to race), fetch the movie again and use its poster
            console.log('Error upserting movie, trying to fetch again:', addErr);
            movie = await getMovieByTitle(suggestion.title);
            setPosterUrl(movie?.poster ?? posterUrl);
          }
        }
      } catch (err) {
        setPosterUrl(null);
        console.log('Error in fetchMetadata:', err);
      }
    };
    if (suggestions.length > 0) fetchMetadata();
  }, [suggestions, currentIndex]);

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
      const prompt = `Give me 10 movies I should watch next based on my Letterboxd data. Make sure that there are no movies that I have already watched and strictly that none of them appear on my inputted JSON. For each, provide a title and a short, very personalized reason (based ONLY on my Letterboxd data), and output as a JSON array like this:
      [
        {"title": "Movie Title", "reason": "Why you recommend it"},
        ...
      ]`;
      const response = await askChatGPTAboutLetterboxd(raw, prompt);
      let suggestionsArr: { title: string; reason: string }[] = [];
      let jsonStr = response;
      const extracted = extractFirstJsonArray(response);
      if (extracted) jsonStr = extracted;
      try {
        suggestionsArr = JSON.parse(jsonStr);
      } catch (e) {
        console.log('Failed to parse suggestions:', e, response);
      }
      for (const suggestion of suggestionsArr) {
        const { error } = await saveMovieSuggestion(userId, suggestion.title, suggestion.reason);
        if (error) console.log('Supabase insert error:', error);
      }
      const all = await getAllMovieSuggestions(userId);
      setSuggestions(all);
      setCurrentIndex(0);
    } catch (e) {
      setSuggestions([]);
      setCurrentIndex(0);
    }
    setLoading(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (suggestions.length > 0 ? (prev + 1) % suggestions.length : 0));
  };

  const handleYes = () => {
    const suggestion = suggestions[currentIndex];
    if (suggestion) {
      console.log('Yes pressed', suggestion.title);
    }
  };

  if (letterboxdUsername) {
    if (loading) {
      return (
        <View style={styles.container}>
          <Text style={styles.heading}>Loading your movie suggestion...</Text>
        </View>
      );
    }
    if (suggestions.length > 0) {
      const suggestion = suggestions[currentIndex];
      return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <PanGestureHandler
            onHandlerStateChange={({ nativeEvent }) => {
              if (nativeEvent.state === State.END && nativeEvent.translationX > 60) {
                handleNext();
              }
            }}
          >
            <View style={styles.posterContainer}>
              {posterUrl && (
                <Image
                  key={posterUrl}
                  source={{ uri: posterUrl as string }}
                  style={styles.poster}
                  resizeMode="cover"
                />
              )}
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 24 }}>{suggestion.title}</Text>
              <Text style={[styles.reasonText]}>{suggestion.reason}</Text>
            </View>
          </PanGestureHandler>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.smallButton} onPress={handleYes}>
              <Text style={styles.buttonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.smallButton} onPress={() => console.log('Seen Before pressed')}>
              <Text style={styles.buttonText}>Seen Before</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }
    return (
      <ScrollView style={styles.scroll}>
        <Text style={styles.heading}>Connected Letterboxd Account</Text>
        <Text style={{ fontSize: 18, color: '#0c65bb', marginTop: 16 }}>{letterboxdUsername}</Text>
        <TouchableOpacity style={[styles.button, { marginTop: 32 }]} onPress={handleAskGPT} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Thinking...' : 'Get Movie Suggestions'}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.scroll}>
      <View style={styles.card}>
        <Image source={require('../../assets/Letterboxd-logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.heading}>
          {isConnected ? 'Refresh Your Letterboxd Data' : 'Connect Your Letterboxd'}
        </Text>
        <Text style={styles.subheading}>
          {isConnected
            ? 'Tap below to sync your latest movies and ratings.'
            : 'Import watched movies and ratings for personalized suggestions.'}
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleConnectPress}>
          <Text style={styles.buttonText}>{isConnected ? 'Refresh Data' : 'Connect Letterboxd'}</Text>
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
    backgroundColor: '#f7f7f7',
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 32,
    minHeight: '100%',
  },
  posterContainer: {
    width: '100%',
    alignItems: 'center',
  },
  poster: {
    width: 240,
    height: 360,
    borderRadius: 8,
    marginBottom: 16,
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginTop: 40,
    marginBottom: 16,
  },
  smallButton: {
    backgroundColor: '#0c65bb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  reasonText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 24,
    textAlign: 'center',
  },
});
