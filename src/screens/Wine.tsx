import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Wine() {
  return (
    <View style={styles.c}>
      <Text>Wine Screen</Text>
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