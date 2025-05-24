import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Image } from 'react-native';
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
    <View style={styles.container}>
      <ScoutLogo style={styles.logo} />
      <TextInput
        placeholder="Name"
        autoCapitalize="words"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Button title="Submit" onPress={handle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, justifyContent:'center' },
  logo: { width: 160, height: 160, alignSelf: 'center', marginBottom: 30 },
  input: { height:40, borderWidth:1, marginBottom:10, padding:8 },
});