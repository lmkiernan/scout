import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Books() {
  return (
    <View style={styles.c}>
      <Text>Books Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  c: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  }
});