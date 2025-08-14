import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ScrollView
} from 'react-native';
import { supabase } from '../lib/subabase';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectName: (name: string) => void;
  title?: string;
};

export default function WineSearchModal({
  visible,
  onClose,
  onSelectName,
  title = 'Add New Wine',
}: Props) {
  const [wineName, setWineName] = useState('');
  const [year, setYear] = useState('');
  const [rating, setRating] = useState('');
  const [wineType, setWineType] = useState('');
  const [saving, setSaving] = useState(false);

  const wineTypes = [
    'Red Wine',
    'White Wine', 
    'Rosé Wine',
    'Sparkling Wine',
    'Dessert Wine',
    'Fortified Wine',
    'Orange Wine',
    'Other'
  ];

  const redWineSubtypes = [
    'Cabernet Sauvignon',
    'Merlot',
    'Pinot Noir',
    'Syrah/Shiraz',
    'Malbec',
    'Zinfandel',
    'Sangiovese',
    'Nebbiolo',
    'Tempranillo',
    'Grenache',
    'Petit Verdot',
    'Carmenère',
    'Barbera',
    'Dolcetto',
    'Pinotage',
    'Other Red'
  ];

  const whiteWineSubtypes = [
    'Chardonnay',
    'Sauvignon Blanc',
    'Pinot Grigio/Pinot Gris',
    'Riesling',
    'Semillon',
    'Viognier',
    'Chenin Blanc',
    'Albariño',
    'Gewürztraminer',
    'Muscat',
    'Pinot Blanc',
    'Marsanne',
    'Roussanne',
    'Torrontés',
    'Grüner Veltliner',
    'Other White'
  ];

  const [selectedWineType, setSelectedWineType] = useState('');
  const [selectedSubtype, setSelectedSubtype] = useState('');

  const handleWineTypeSelect = (type: string) => {
    setSelectedWineType(type);
    setSelectedSubtype('');
    setWineType(type);
  };

  const handleSubtypeSelect = (subtype: string) => {
    setSelectedSubtype(subtype);
    setWineType(subtype);
  };

  const handleSave = async () => {
    if (!wineName.trim()) return;

    setSaving(true);
    try {
      // Get current user
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error('No user found');

      // Build wine name with year if provided
      const wineNameWithYear = year.trim() ? `${wineName.trim()} (${year.trim()})` : wineName.trim();
      const wineRating = rating.trim() ? parseFloat(rating) : null;

      console.log('Saving wine:', { wineNameWithYear, wineRating, wineType, userId: user.id });

      // Insert wine into database
      const { data, error } = await supabase
        .from('wines')
        .insert({
          user_id: user.id,
          wine: wineNameWithYear,
          wine_type: wineType || null,
          rating: wineRating
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Wine saved successfully:', data);

      // Reset form and close modal
      onSelectName(wineNameWithYear);
      setWineName('');
      setYear('');
      setRating('');
      setWineType('');
      setSelectedWineType('');
      setSelectedSubtype('');
      onClose();
    } catch (err: any) {
      console.error('Error saving wine:', err);
      Alert.alert('Save failed', err?.message ?? 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>

          <TextInput
            style={styles.input}
            placeholder="Wine name (e.g., Barolo, Opus One)"
            value={wineName}
            onChangeText={setWineName}
            autoFocus
          />
          <TextInput
            style={styles.input}
            placeholder="Year (optional)"
            value={year}
            onChangeText={setYear}
            keyboardType="numeric"
            maxLength={4}
          />
          <TextInput
            style={styles.input}
            placeholder="Rating out of 5 (optional)"
            value={rating}
            onChangeText={setRating}
            keyboardType="numeric"
            maxLength={3}
          />

          <Text style={styles.label}>Wine Type (optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wineTypeContainer}>
            {wineTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.wineTypeButton,
                  wineType === type && styles.wineTypeButtonSelected
                ]}
                onPress={() => handleWineTypeSelect(type)}
              >
                <Text style={[
                  styles.wineTypeText,
                  wineType === type && styles.wineTypeTextSelected
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedWineType && (
            <>
              <Text style={styles.label}>Subtype (optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wineTypeContainer}>
                {selectedWineType === 'Red Wine' && redWineSubtypes.map((subtype) => (
                  <TouchableOpacity
                    key={subtype}
                    style={[
                      styles.wineTypeButton,
                      wineType === subtype && styles.wineTypeButtonSelected
                    ]}
                    onPress={() => handleSubtypeSelect(subtype)}
                  >
                    <Text style={[
                      styles.wineTypeText,
                      wineType === subtype && styles.wineTypeTextSelected
                    ]}>
                      {subtype}
                    </Text>
                  </TouchableOpacity>
                ))}
                {selectedWineType === 'White Wine' && whiteWineSubtypes.map((subtype) => (
                  <TouchableOpacity
                    key={subtype}
                    style={[
                      styles.wineTypeButton,
                      wineType === subtype && styles.wineTypeButtonSelected
                    ]}
                    onPress={() => handleSubtypeSelect(subtype)}
                  >
                    <Text style={[
                      styles.wineTypeText,
                      wineType === subtype && styles.wineTypeTextSelected
                    ]}>
                      {subtype}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveBtn, (!wineName.trim() || saving) && styles.saveBtnDisabled]}
              disabled={!wineName.trim() || saving}
            >
              <Text style={styles.saveTxt}>{saving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', paddingHorizontal: 16 },
  sheet: { backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 6, elevation: 6, maxHeight: '85%' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 20, color: '#111827', textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, marginBottom: 16, backgroundColor: '#f9fafb' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  cancelBtn: { backgroundColor: '#6b7280', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, flex: 1, marginRight: 8 },
  cancelTxt: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  saveBtn: { backgroundColor: '#0c65bb', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, flex: 1, marginLeft: 8 },
  saveTxt: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  saveBtnDisabled: { backgroundColor: '#d1d5db', opacity: 0.7 },
  label: { fontSize: 14, fontWeight: '600', color: '#4b5563', marginBottom: 8, marginTop: 16 },
  wineTypeContainer: { flexDirection: 'row', marginBottom: 16 },
  wineTypeButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  wineTypeButtonSelected: {
    backgroundColor: '#0c65bb',
    borderColor: '#0c65bb',
  },
  wineTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  wineTypeTextSelected: {
    color: '#fff',
  },
});
