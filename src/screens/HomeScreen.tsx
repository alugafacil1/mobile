import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  RefreshControl, TouchableOpacity, TextInput, Image, Modal, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getProperties } from '../services/propertyService';
import { Property, PropertyFilterRequest } from '../types/property';
import Logo from '../../assets/logo.png';
import PropertyCard from '../components/PropertyCard';
import { toggleFavorite, getUserFavorites } from '../services/favoriteService';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../lib/auth/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import Slider from '@react-native-community/slider';

export default function HomeScreen({ route }: any) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const { user } = useAuth();
  const userId = user?.user_id;
  const navigation = useNavigation<any>();

  const [filterVisible, setFilterVisible] = useState(false);
  const [price, setPrice] = useState(5200);
  const [selectedBedrooms, setSelectedBedrooms] = useState<number | null>(null);
  const [selectedBathrooms, setSelectedBathrooms] = useState<number | null>(null);
  const [selectedGarage, setSelectedGarage] = useState<string>('Sem vaga');
  const [pets, setPets] = useState<string>('Sim');

  const [activeFilters, setActiveFilters] = useState<PropertyFilterRequest>({});
  const [locationFilter, setLocationFilter] = useState<{ lat: number; lon: number; radius: number } | null>(null);

  useEffect(() => {
    if (filterVisible) {
      if (activeFilters.maxPrice != null) setPrice(activeFilters.maxPrice);
      if (activeFilters.minBedrooms != null) setSelectedBedrooms(activeFilters.minBedrooms);
      if (activeFilters.minBathrooms != null) setSelectedBathrooms(activeFilters.minBathrooms);
      if (activeFilters.garage != null) setSelectedGarage(activeFilters.garage ? '2' : 'Sem vaga');
      if (activeFilters.petFriendly === true) setPets('Sim');
      else if (activeFilters.petFriendly === false) setPets('Não');
      else if (activeFilters.petFriendly !== undefined) setPets('Indiferente');
    }
  }, [filterVisible]);

  const load = useCallback(async (isRefresh = false, filters?: PropertyFilterRequest) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getProperties(filters);
      setProperties(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar imóveis');
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  const loadFavorites = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await getUserFavorites(userId);
      const mapped: { [key: string]: boolean } = {};
      data.forEach((fav: any) => { mapped[fav.property.propertyId] = true; });
      setFavorites(mapped);
    } catch (err) {
      console.error('Erro ao carregar favoritos:', err);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      const locFilter = route?.params?.locationFilter;

      if (locFilter) {
        const merged = { ...activeFilters, ...locFilter };
        setLocationFilter(locFilter);
        setActiveFilters(merged);
        load(false, merged);

        navigation.setParams({ locationFilter: undefined });
      } else {
        load(false, Object.keys(activeFilters).length > 0 ? activeFilters : undefined);
      }

      loadFavorites();
    }, [route?.params?.locationFilter])
  );

  const applyFilters = () => {
    const charFilters: PropertyFilterRequest = {
      maxPrice: price,
      minBedrooms: selectedBedrooms ?? undefined,
      minBathrooms: selectedBathrooms ?? undefined,
      garage: selectedGarage !== 'Sem vaga',
      petFriendly: pets === 'Sim' ? true : pets === 'Não' ? false : undefined,
    };

    const locFilter = locationFilter ?? (activeFilters.lat != null && activeFilters.lon != null && activeFilters.radius != null
      ? { lat: activeFilters.lat, lon: activeFilters.lon, radius: activeFilters.radius }
      : null);
    const merged = locFilter ? { ...charFilters, ...locFilter } : charFilters;
    setLocationFilter(locFilter);
    setActiveFilters(merged);
    setFilterVisible(false);
    load(false, merged);
  };

  const clearFilters = () => {
    setPrice(5200); setSelectedBedrooms(null);
    setSelectedBathrooms(null); setSelectedGarage('Sem vaga'); setPets('Sim');

    const locFilter = locationFilter ?? (activeFilters.lat != null && activeFilters.lon != null && activeFilters.radius != null
      ? { lat: activeFilters.lat, lon: activeFilters.lon, radius: activeFilters.radius }
      : null);
    const merged = locFilter ? { ...locFilter } : {};
    setLocationFilter(locFilter);
    setActiveFilters(merged);
    setFilterVisible(false);
    load(false, Object.keys(merged).length > 0 ? merged : undefined);
  };

  const clearLocationFilter = () => {
    const { lat, lon, radius, ...charOnly } = activeFilters as any;
    setLocationFilter(null);
    setActiveFilters(charOnly);
    load(false, Object.keys(charOnly).length > 0 ? charOnly : undefined);
  };

  const clearFilterTag = (key: keyof PropertyFilterRequest) => {
    const next = { ...activeFilters };
    delete next[key];
    setActiveFilters(next);
    load(false, Object.keys(next).length > 0 ? next : undefined);
  };

  const filterTags: { key: keyof PropertyFilterRequest; label: string }[] = [];
  if (activeFilters.maxPrice != null) filterTags.push({ key: 'maxPrice', label: `Até R$ ${activeFilters.maxPrice.toLocaleString('pt-BR')}` });
  if (activeFilters.minBedrooms != null) filterTags.push({ key: 'minBedrooms', label: `${activeFilters.minBedrooms}+ quartos` });
  if (activeFilters.minBathrooms != null) filterTags.push({ key: 'minBathrooms', label: `${activeFilters.minBathrooms}+ banheiros` });
  if (activeFilters.garage === true) filterTags.push({ key: 'garage', label: 'Com vaga' });
  if (activeFilters.petFriendly === true) filterTags.push({ key: 'petFriendly', label: 'Pet friendly' });
  if (activeFilters.petFriendly === false) filterTags.push({ key: 'petFriendly', label: 'Sem pets' });

  const handleToggleFavorite = async (propertyId: string) => {
    try {
      const isFavorited = await toggleFavorite(userId!, propertyId);
      setFavorites((prev) => ({ ...prev, [propertyId]: isFavorited }));
    } catch (err) {
      console.error('Erro ao alternar favorito:', err);
    }
  };

  const scrollToTop = () => flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

  const locFilterDisplay = locationFilter ?? (activeFilters.lat != null && activeFilters.lon != null && activeFilters.radius != null
    ? { lat: activeFilters.lat, lon: activeFilters.lon, radius: activeFilters.radius }
    : null);

  const renderItem = ({ item }: { item: Property }) => {
    const photo = item.photoUrls?.length! > 0 ? item.photoUrls![0] : 'https://via.placeholder.com/400';
    const priceValue = item.priceInCents ? item.priceInCents / 100 : 0;
    const priceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(priceValue);
    return (
      <PropertyCard
        propertyId={item.propertyId}
        image={photo}
        address={`${item.address?.street ?? ''}, ${item.address?.city ?? ''} - ${item.address?.state ?? ''}`}
        details={`${item.numberOfBedrooms ?? 0} Quartos • ${item.numberOfBathrooms ?? 0} Banheiros • ${item.numberOfRooms ?? 0} Cômodos`}
        price={`Aluguel ${priceFormatted}`}
        total={`Total ${priceFormatted}`}
        isFavorite={favorites[item.propertyId] || false}
        onToggleFavorite={handleToggleFavorite}
        onPress={() => navigation.navigate('PropertyDetails', { property: item })}
      />
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  if (error) return (
    <View style={styles.center}>
      <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text>
      <TouchableOpacity onPress={() => load()} style={styles.retryButton}>
        <Text style={{ color: '#fff' }}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <FlatList
        ref={flatListRef}
        data={properties}
        keyExtractor={(item, index) => item.propertyId ?? String(index)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true, Object.keys(activeFilters).length > 0 ? activeFilters : undefined)}
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Ionicons name="notifications-outline" size={24} />
              <Image source={Logo} style={styles.logoImage} />
              <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatar}>
                <Ionicons name="person" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchLeft}>
                <Ionicons name="search-outline" size={18} color="#9CA3AF" />
                <TextInput placeholder="Procurar imóveis..." placeholderTextColor="#9CA3AF" style={styles.searchInput} />
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Map')} style={styles.searchIconRight}>
                <Ionicons name="map" size={16} color="#2563EB" />
              </TouchableOpacity>
            </View>

            {(locFilterDisplay || filterTags.length > 0) && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterTagsContainer}
                style={styles.filterTagsScroll}
              >
                {locFilterDisplay && (
                  <View style={styles.filterTag}>
                    <Ionicons name="location" size={14} color="#fff" />
                    <Text style={styles.filterTagText}>Raio: {locFilterDisplay.radius} km</Text>
                    <TouchableOpacity onPress={clearLocationFilter} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="close" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
                {filterTags.map(({ key, label }) => (
                  <View key={key} style={styles.filterTag}>
                    <Text style={styles.filterTagText}>{label}</Text>
                    <TouchableOpacity onPress={() => clearFilterTag(key)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="close" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Imóveis Recentes</Text>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => setFilterVisible(true)}>
                  <Text style={styles.actionText}>Filter</Text>
                  <Ionicons name="filter" size={14} />
                </TouchableOpacity>
              </View>
            </View>

            {properties.length > 0 && (
              <Text style={{ marginBottom: 10, color: '#6B7280' }}>
                {properties.length} imóveis encontrados
              </Text>
            )}
          </>
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      />

      <Modal visible={filterVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar por</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <Ionicons name="close" size={20} />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionLabel}>Preço: R$ {price.toLocaleString('pt-BR')},00</Text>
            <Slider style={{ width: '100%', height: 40 }} minimumValue={2500} maximumValue={300000} value={price} onValueChange={setPrice} minimumTrackTintColor="#3B82F6" maximumTrackTintColor="#D1D5DB" thumbTintColor="#3B82F6" />
            <View style={styles.priceRow}>
              <Text style={styles.priceMin}>min. R$ 2.500,00</Text>
              <Text style={styles.priceMax}>max. R$ 300.000,00</Text>
            </View>

            <Text style={styles.sectionLabel}>Quartos</Text>
            <View style={styles.optionRow}>
              {[1, 2, 3, 4].map((num) => (
                <TouchableOpacity key={num} style={[styles.circleButton, selectedBedrooms === num && styles.selectedCircle]} onPress={() => setSelectedBedrooms(num)}>
                  <Text style={selectedBedrooms === num ? styles.selectedText : styles.circleText}>{num === 4 ? '4+' : num}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Banheiros</Text>
            <View style={styles.optionRow}>
              {[1, 2, 3, 4].map((num) => (
                <TouchableOpacity key={num} style={[styles.circleButton, selectedBathrooms === num && styles.selectedCircle]} onPress={() => setSelectedBathrooms(num)}>
                  <Text style={selectedBathrooms === num ? styles.selectedText : styles.circleText}>{num === 4 ? '4+' : num}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Vagas</Text>
            <View style={styles.optionRow}>
              {['Sem vaga', '2', '3', '4+'].map((item) => (
                <TouchableOpacity key={item} style={[styles.pillButton, selectedGarage === item && styles.selectedPill]} onPress={() => setSelectedGarage(item)}>
                  <Text style={selectedGarage === item ? styles.selectedText : styles.circleText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Aceita animais</Text>
            <View style={styles.optionRow}>
              {['Sim', 'Não', 'Indiferente'].map((item) => (
                <TouchableOpacity key={item} style={[styles.pillButton, pets === item && styles.selectedPill]} onPress={() => setPets(item)}>
                  <Text style={pets === item ? styles.selectedText : styles.circleText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.bottomButtons}>
              <TouchableOpacity style={styles.primaryButton} onPress={applyFilters}>
                <Text style={{ color: '#fff' }}>Filtrar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={clearFilters}>
                <Text style={{ color: '#2563EB' }}>Limpar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.floatingButton} onPress={scrollToTop}>
        <Ionicons name="chevron-up" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  retryButton: { backgroundColor: '#2563EB', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  logoImage: { width: 100, height: 70 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  searchLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  searchIconRight: { backgroundColor: '#DBEAFE', padding: 8, borderRadius: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  actions: { flexDirection: 'row', gap: 10 },
  actionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 4 },
  actionText: { fontSize: 12, fontWeight: '500' },
  floatingButton: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#2563EB', width: 55, height: 55, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#F9FAFB', padding: 20, borderTopLeftRadius: 25, borderTopRightRadius: 25, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#2563EB' },
  sectionLabel: { marginTop: 15, marginBottom: 8, fontWeight: '600', color: '#2563EB' },
  optionRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  circleButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },
  selectedCircle: { backgroundColor: '#3B82F6' },
  pillButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#3B82F6' },
  selectedPill: { backgroundColor: '#3B82F6' },
  circleText: { color: '#3B82F6' },
  selectedText: { color: '#fff' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  priceMin: { fontSize: 10, color: '#2563EB' },
  priceMax: { fontSize: 10, color: '#2563EB' },
  bottomButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 },
  primaryButton: { backgroundColor: '#3B82F6', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 6 },
  secondaryButton: { borderWidth: 1, borderColor: '#3B82F6', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 6 },
  locationFilterBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 16, gap: 8 },
  locationFilterText: { fontSize: 14, fontWeight: '500', color: '#fff', flex: 1 },
  clearFilterButton: { padding: 4 },
  filterTagsContainer: { flexDirection: 'row', gap: 8, marginBottom: 16, paddingVertical: 8 },
  filterTagsScroll: { minHeight: 44 },
  filterTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 20, gap: 6 },
  filterTagText: { fontSize: 14, fontWeight: '500', color: '#fff' },
});