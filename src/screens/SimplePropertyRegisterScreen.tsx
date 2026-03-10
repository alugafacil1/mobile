import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
  Image, ActivityIndicator, FlatList, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { createSimpleProperty } from '../services/simplePropertyService';
import { SimplePropertyType, SimplePropertyRequest } from '../types/simpleProperty';
import { setPhotoCallback } from '../utils/photoCallbackRegistry';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_HEIGHT = 200;

// Formata CEP automaticamente: 99999999 → 99999-999
const formatCep = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
};

export default function SimplePropertyRegisterScreen({ navigation, route }: any) {
  const initialPhoto = route.params?.photoUri;
  const addressParams = route.params?.address;
  // Lat/lon vêm junto com o address do getCurrentLocation
  const locationCoords = route.params?.coords as { lat: number; lon: number } | undefined;

  const [photos, setPhotos] = useState<string[]>(initialPhoto ? [initialPhoto] : []);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const pendingPhotoRef = useRef<string | null>(null);

  // Campos do formulário
  const [propertyType, setPropertyType] = useState<SimplePropertyType | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [postalCode, setPostalCode] = useState(addressParams?.cep ?? '');
  const [street, setStreet] = useState(addressParams?.endereco ?? '');
  const [number, setNumber] = useState(addressParams?.numero ?? '');
  const [neighborhood, setNeighborhood] = useState(addressParams?.bairro ?? '');
  const [city, setCity] = useState(addressParams?.cidade ?? '');
  const [state, setState] = useState(addressParams?.estado ?? '');
  const [complement, setComplement] = useState('');
  const [loading, setLoading] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  useFocusEffect(
    useCallback(() => {
      if (pendingPhotoRef.current) {
        const uri = pendingPhotoRef.current;
        pendingPhotoRef.current = null;
        setPhotos((prev) => {
          const updated = [...prev, uri];
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: updated.length - 1, animated: true });
          }, 100);
          setCurrentPhotoIndex(updated.length - 1);
          return updated;
        });
      }
    }, [])
  );

  const propertyTypes: { label: string; value: SimplePropertyType }[] = [
    { label: 'Apartamento', value: 'APARTMENT' },
    { label: 'Casa', value: 'HOUSE' },
    { label: 'Kitnet/Studio', value: 'KITNET_STUDIO' },
  ];

  const handleAddPhoto = () => {
    Alert.alert('Adicionar foto', 'Escolha uma opção', [
      {
        text: 'Câmera',
        onPress: () => {
          setPhotoCallback((uri: string) => {
            pendingPhotoRef.current = uri;
          });
          navigation.navigate('CreateSimpleProperty', { skipLocation: true });
        },
      },
      {
        text: 'Galeria',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
          if (!result.canceled && result.assets[0]) {
            setPhotos((prev) => {
              const updated = [...prev, result.assets[0].uri];
              setTimeout(() => {
                flatListRef.current?.scrollToIndex({ index: updated.length - 1, animated: true });
              }, 100);
              setCurrentPhotoIndex(updated.length - 1);
              return updated;
            });
          }
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleRemovePhoto = (index: number) => {
    Alert.alert('Remover foto', 'Deseja remover esta foto?', [
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          setPhotos((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            setCurrentPhotoIndex(Math.min(currentPhotoIndex, Math.max(updated.length - 1, 0)));
            return updated;
          });
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!propertyType) {
      Alert.alert('Erro', 'Selecione o tipo do imóvel.');
      return;
    }
    if (!phoneNumber || !postalCode || !street || !number || !neighborhood || !city || !state) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }
    if (!locationCoords) {
      Alert.alert('Erro', 'Geolocalização não disponível. Tente novamente.');
      return;
    }

    setLoading(true);
    try {
      // As fotos devem ser URLs públicas — faça o upload antes e use as URLs retornadas.
      // Aqui as URIs locais são enviadas como placeholder; ajuste conforme seu serviço de upload.
      const payload: SimplePropertyRequest = {
        propertyType,
        phoneNumber,
        address: {
          street,
          neighborhood,
          city,
          state,
          postalCode,
          number,
          complement: complement || undefined,
        },
        geolocation: {
          latitude: locationCoords.lat,
          longitude: locationCoords.lon,
        },
        photoUrls: photos,
      };

      await createSimpleProperty(payload);

      Alert.alert('Sucesso', 'Imóvel cadastrado com sucesso!', [
        { text: 'OK', onPress: () => navigation.navigate('Main', { screen: 'Home' }) },
      ]);
    } catch (error) {
      console.error('Erro ao salvar imóvel:', error);
      Alert.alert('Erro', 'Falha ao salvar imóvel. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPropertyType(null);
    setPhoneNumber('');
    setPostalCode(''); setStreet(''); setNumber('');
    setNeighborhood(''); setCity(''); setState(''); setComplement('');
    setPhotos([]); setCurrentPhotoIndex(0);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cadastrar Imóvel</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Carrossel */}
        <View style={styles.carouselContainer}>
          {photos.length === 0 ? (
            <View style={styles.carouselPlaceholder}>
              <Ionicons name="image-outline" size={48} color="#bbb" />
              <Text style={styles.placeholderText}>Nenhuma foto adicionada</Text>
            </View>
          ) : (
            <>
              <FlatList
                ref={flatListRef}
                data={photos}
                keyExtractor={(_, i) => String(i)}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                  setCurrentPhotoIndex(index);
                }}
                renderItem={({ item, index }) => (
                  <View style={{ width: SCREEN_WIDTH, height: CAROUSEL_HEIGHT }}>
                    <Image source={{ uri: item }} style={styles.carouselImage} resizeMode="cover" />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => handleRemovePhoto(index)}
                    >
                      <Ionicons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {photos.length > 1 && currentPhotoIndex < photos.length - 1 && (
                <TouchableOpacity
                  style={styles.carouselArrow}
                  onPress={() => {
                    const next = currentPhotoIndex + 1;
                    flatListRef.current?.scrollToIndex({ index: next, animated: true });
                    setCurrentPhotoIndex(next);
                  }}
                >
                  <Ionicons name="chevron-forward" size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </>
          )}

          <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>

          {photos.length > 0 && (
            <View style={styles.pagination}>
              {photos.map((_, i) => (
                <View key={i} style={[styles.dot, i === currentPhotoIndex && styles.dotActive]} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.form}>

          {/* Tipo do imóvel — seleção única */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Tipo de imóvel</Text>
            {propertyTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={styles.checkboxRow}
                onPress={() => setPropertyType(type.value)}
                activeOpacity={0.7}
              >
                <Checkbox
                  value={propertyType === type.value}
                  onValueChange={() => setPropertyType(type.value)}
                  style={styles.checkbox}
                  color={propertyType === type.value ? '#2563EB' : undefined}
                />
                <Text style={styles.checkboxLabel}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Telefone */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Telefone para contato</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholderTextColor="#bbb"
            />
          </View>

          {/* CEP */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>CEP</Text>
            <TextInput
              style={styles.input}
              value={postalCode}
              onChangeText={(v) => setPostalCode(formatCep(v))}
              keyboardType="numeric"
              maxLength={9}
              placeholder="99999-999"
              placeholderTextColor="#bbb"
            />
          </View>

          {/* Endereço + Nº */}
          <View style={[styles.fieldGroup, styles.rowFields]}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.fieldLabel}>Endereço</Text>
              <TextInput style={styles.input} value={street} onChangeText={setStreet} placeholderTextColor="#bbb" />
            </View>
            <View style={{ width: 72 }}>
              <Text style={styles.fieldLabel}>Nº</Text>
              <TextInput style={styles.input} value={number} onChangeText={setNumber} keyboardType="numeric" placeholderTextColor="#bbb" />
            </View>
          </View>

          {/* Complemento */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Complemento <Text style={styles.optional}>(opcional)</Text></Text>
            <TextInput style={styles.input} value={complement} onChangeText={setComplement} placeholderTextColor="#bbb" />
          </View>

          {/* Bairro */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Bairro</Text>
            <TextInput style={styles.input} value={neighborhood} onChangeText={setNeighborhood} placeholderTextColor="#bbb" />
          </View>

          {/* Cidade */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Cidade</Text>
            <TextInput style={styles.input} value={city} onChangeText={setCity} placeholderTextColor="#bbb" />
          </View>

          {/* Estado */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Estado</Text>
            <TextInput style={styles.input} value={state} onChangeText={setState} placeholderTextColor="#bbb" />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Salvar</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.clearButton]} onPress={handleClear} disabled={loading}>
              <Text style={styles.clearButtonText}>Limpar</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: Platform.OS === 'android' ? 12 : 0,
    paddingBottom: 10, backgroundColor: '#fff',
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2,
  },
  backButton: { padding: 6 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#1a1a1a', marginLeft: 2 },
  scrollView: { flex: 1 },
  contentContainer: { paddingBottom: 48 },
  carouselContainer: {
    width: '100%', height: CAROUSEL_HEIGHT,
    backgroundColor: '#e9edf0', position: 'relative', overflow: 'hidden',
  },
  carouselImage: { width: SCREEN_WIDTH, height: CAROUSEL_HEIGHT },
  carouselPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#aaa', fontSize: 13, marginTop: 8 },
  addPhotoButton: {
    position: 'absolute', bottom: 24, left: 14,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4,
  },
  removePhotoButton: {
    position: 'absolute', top: 10, right: 10,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center',
  },
  carouselArrow: {
    position: 'absolute', right: 10, top: '38%',
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  pagination: {
    position: 'absolute', bottom: 8, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 5,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.45)' },
  dotActive: { backgroundColor: '#fff' },
  form: { paddingHorizontal: 16, paddingTop: 20 },
  fieldGroup: { marginBottom: 14 },
  rowFields: { flexDirection: 'row', alignItems: 'flex-end' },
  fieldLabel: { fontSize: 13, color: '#555', marginBottom: 5 },
  optional: { fontSize: 12, color: '#aaa' },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 15, color: '#1a1a1a', backgroundColor: '#fff',
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingVertical: 2 },
  checkbox: { width: 18, height: 18, borderRadius: 3, marginRight: 10 },
  checkboxLabel: { fontSize: 14, color: '#333' },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  actionButton: { flex: 1, paddingVertical: 13, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  saveButton: { backgroundColor: '#2563EB' },
  saveButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  clearButton: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  clearButtonText: { color: '#374151', fontSize: 15, fontWeight: '500' },
});