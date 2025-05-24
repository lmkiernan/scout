import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import ScoutLogo from '../components/ScoutLogo';

interface SignInProps {
  onSignIn?: (userData: { name: string; email: string; password: string }) => void;
}

export default function SignIn({ onSignIn }: SignInProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handle = () => {
    if (onSignIn) {
      onSignIn({ name, email, password });
    } else {
      Alert.alert('Entered Info', `Name: ${name}\nEmail: ${email}\nPassword: ${password}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header / Logo */}
      <View style={styles.header}>
        <ScoutLogo style={styles.logo} />
        <Text style={styles.subtitle}>Never go at it alone</Text>
      </View>

      {/* Form Card */}
      <View style={styles.formCard}>
        <TextInput
          placeholder="Name (just the first is fine)"
          placeholderTextColor="#999"
          autoCapitalize="words"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handle}>
          <Text style={styles.submitLabel}>Create account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 240,
    height: 240,
    marginBottom: -26,
  },
  subtitle: {
    color: '#0c65bb',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0,
    shadowRadius: 4,
    // Android elevation
    elevation: 3,
  },
  input: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#0c65bb',
    paddingVertical: 10,
    marginVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  submitButton: {
    backgroundColor: '#0c65bb',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  submitLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
