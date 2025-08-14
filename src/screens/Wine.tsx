import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import WineSearchModal from './WineSearchModal';

export default function Wine() {
  const [modalOpen, setModalOpen] = useState(false);
  const [pickedName, setPickedName] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      {/* Header with add button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalOpen(true)}>
          <Text style={styles.plusSymbol}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Selected wine display */}
      {pickedName && <Text style={styles.selectedWine}>Selected: {pickedName}</Text>}

      {/* Centered sommelier image */}
      <View style={styles.imageContainer}>
        <Image 
          source={require('../../assets/somelier.png')} 
          style={styles.sommelierImage}
          resizeMode="contain"
          onError={(error) => console.log('Image loading error:', error)}
          onLoad={() => console.log('Image loaded successfully')}
        />
      </View>

      {/* Wine Menu URL Text Field */}
      <View style={styles.urlContainer}>
        <Text style={styles.urlLabel}>Wine Menu URL</Text>
        <TextInput
          style={styles.urlInput}
          placeholder="Enter wine menu URL..."
          placeholderTextColor="#9ca3af"
        />
      </View>

      <WineSearchModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelectName={(name) => {
          setPickedName(name);
          setModalOpen(false);
        }}
        title="Find a standardized name"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0c65bb',
    width: 44,
    height: 44,
    borderRadius: 22,
    marginTop: 10, // Bring button down by 10px
  },
  plusSymbol: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 28,
    marginTop: -2, // Fine-tune vertical centering
  },
  addText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedWine: {
    marginTop: 8,
    fontSize: 16,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // White background
    margin: 20,
    borderRadius: 10,
    minHeight: 300, // Ensure minimum height
  },
  sommelierImage: {
    width: 200,
    height: 200,
    maxWidth: '100%',
    maxHeight: '100%',
  },
  urlContainer: {
    width: '90%',
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  urlLabel: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 5,
  },
  urlInput: {
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 0,
  },
});
