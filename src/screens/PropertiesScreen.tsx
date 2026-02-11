import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { getProperties } from '../services/propertyService';
import { getPropertiesByOwnerId } from '../services/propertyService';
import { Property } from '../types/property';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';

export default function PropertiesScreen() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigation: any = useNavigation();
  const route = useRoute<any>();
  const user_id = route.params?.user_id;
  const role = route.params?.role;
  
  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = user_id ? await getPropertiesByOwnerId(user_id) : await getProperties();
      setProperties(data);
      setError(null);
    } catch (err: any) {
      console.error('Erro ao buscar propriedades', err);
      setError(err?.message || 'Erro ao carregar propriedades');
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
      <View style={styles.card}>
        <Image source={{ uri: photo }} style={styles.photo} />
        <View style={styles.info}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.address?.city ?? ''} {item.address?.state ? `- ${item.address.state}` : ''}</Text>
          <Text style={styles.price}>{priceFormatted}</Text>
          <Text style={styles.meta}>{item.numberOfBedrooms ?? 0} quartos • {item.numberOfBathrooms ?? 0} banheiros • {item.numberOfRooms ?? 0} cômodos</Text>
        </View>
      </View>
    );
  };

  if (properties.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Nenhuma propriedade encontrada.</Text>
        <TouchableOpacity onPress={() => load(true)} style={styles.retryButton}>
          <Text style={styles.retryText}>Atualizar</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={properties}
        keyExtractor={(item, index) => item.propertyId ?? (item as any).id ?? String(index)}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ padding: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
      />
      {
        role === 'OWNER' && (
          <View style={{ margin: 12 }}>
            <Button
              icon="add-circle-outline"
              label="Novo Imóvel"
              onPress={() => navigation.navigate('CreateProperty')}
            />
          </View>
        )
      }
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: 'red', marginBottom: 12 },
  retryButton: { backgroundColor: '#2563EB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  retryText: { color: '#fff' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#fafafa', borderRadius: 8 },
  photo: { width: 100, height: 100, borderRadius: 8, marginRight: 12, backgroundColor: '#eee' },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold' },
  subtitle: { color: '#666', marginTop: 4 },
  price: { marginTop: 6, fontWeight: '600' },
  meta: { marginTop: 4, color: '#666' },
  separator: { height: 10 }
});