import React, { useEffect, useState, useCallback, useRef, useLayoutEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, Modal } from 'react-native';
import { getProperties } from '../services/propertyService';
import { Property, PropertyFilterRequest } from '../types/property';
import { useNavigation } from '@react-navigation/native';
import PropertyFilters from '../components/PropertyFilters';
import { Ionicons } from '@expo/vector-icons';

interface PropertyFiltersRef {
  openModal: () => void;
}

export default function PropertiesScreen() {
  const navigation: any = useNavigation();
  const filterRef = useRef<PropertyFiltersRef>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filtering, setFiltering] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PropertyFilterRequest>({});
  const isFirstLoadRef = useRef(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => filterRef.current?.openModal()}
          style={{ marginRight: 12 }}
        >
        <Ionicons name="funnel-outline" size={22} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else if (!isFirstLoadRef.current) setFiltering(true);
    else setLoading(true);

    try {
      const effectiveFilters = filters && Object.keys(filters).length > 0 ? filters : undefined;
      const data = await getProperties(effectiveFilters);
      setProperties(data);
      setError(null);
    } catch (err: any) {
      console.error('Erro ao buscar propriedades', err);
      setError(err?.message || 'Erro ao carregar propriedades');
    } finally {
      if (isRefresh) setRefreshing(false);
      else if (!isFirstLoadRef.current) setFiltering(false);
      else {
        setLoading(false);
        isFirstLoadRef.current = false;
      }
    }
  }, [filters]);

  useEffect(() => {
    if (isFirstLoadRef.current) {
      load();
    } else {
      load();
    }
  }, [filters, load]);

  const handleApplyFilters = (newFilters: PropertyFilterRequest) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity onPress={() => load()} style={styles.retryButton}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Property }) => {
    const photo = item.photoUrls && item.photoUrls.length > 0 ? item.photoUrls[0] : 'https://via.placeholder.com/150';
    const price = item.priceInCents ? (item.priceInCents / 100) : 0;
    const priceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('PropertyDetails', { property: item })}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: photo }} 
          style={styles.photo}
        />
        <View style={styles.info}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.address?.city ?? ''} {item.address?.state ? `- ${item.address.state}` : ''}</Text>
          <Text style={styles.price}>{priceFormatted}</Text>
          <Text style={styles.meta}>{item.numberOfBedrooms ?? 0} quartos • {item.numberOfBathrooms ?? 0} banheiros • {item.numberOfRooms ?? 0} cômodos</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (properties.length === 0) {
    return (
      <View style={styles.container}>
        <PropertyFilters 
          ref={filterRef}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          onStartFiltering={() => setFiltering(true)}
          onStopFiltering={() => setFiltering(false)}
        />
        <View style={styles.center}>
          <Text>Nenhuma propriedade encontrada.</Text>
          <TouchableOpacity onPress={() => load(true)} style={styles.retryButton}>
            <Text style={styles.retryText}>Atualizar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PropertyFilters 
        ref={filterRef}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        onStartFiltering={() => setFiltering(true)}
        onStopFiltering={() => setFiltering(false)}
      />
      <FlatList
        data={properties}
        keyExtractor={(item, index) => item.propertyId ?? (item as any).id ?? String(index)}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ padding: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
      />
      
      {/* Modal de carregamento para filtragem */}
      <Modal
        visible={filtering}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Filtrando propriedades...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  error: { color: 'red', marginBottom: 12 },
  retryButton: { backgroundColor: '#2563EB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, marginTop: 12 },
  retryText: { color: '#fff' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#fafafa', borderRadius: 8 },
  photo: { width: 100, height: 100, borderRadius: 8, marginRight: 12, backgroundColor: '#eee' },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold' },
  subtitle: { color: '#666', marginTop: 4 },
  price: { marginTop: 6, fontWeight: '600' },
  meta: { marginTop: 4, color: '#666' },
  separator: { height: 10 },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 32,
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});