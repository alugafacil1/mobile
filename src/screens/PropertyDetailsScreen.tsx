import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Dimensions,
  FlatList,
} from 'react-native';
import { Property } from '../types/property';

const { width } = Dimensions.get('window');

interface PropertyDetailsScreenProps {
  route: {
    params: {
      property: Property;
    };
  };
  navigation: any;
}

const translatePropertyType = (type: string): string => {
  const translations: Record<string, string> = {
    APARTMENT: 'Apartamento',
    HOUSE: 'Casa',
    COMMERCIAL: 'Comercial',
  };
  return translations[type] || type;
};

const translatePropertyStatus = (status: string): string => {
  const translations: Record<string, string> = {
    ACTIVE: 'Ativo',
    PAUSED: 'Pausado',
    PLACED: 'Anunciado',
  };
  return translations[status] || status;
};

export default function PropertyDetailsScreen({ route, navigation }: PropertyDetailsScreenProps) {
  const { property } = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRef = useRef<FlatList>(null);

  const photos = property.photoUrls && property.photoUrls.length > 0 
    ? property.photoUrls 
    : ['https://via.placeholder.com/400x200'];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentImageIndex(index);
  };

  const price = property.priceInCents ? (property.priceInCents / 100) : 0;
  const priceFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);

  const renderCarouselImage = ({ item }: { item: string }) => (
    <View style={styles.carouselItemContainer}>
      <Image 
        source={{ uri: item }} 
        style={styles.carouselImage}
      />
    </View>
  );

  const renderIndicator = (index: number) => (
    <View
      key={index}
      style={[
        styles.indicator,
        index === currentImageIndex && styles.indicatorActive,
      ]}
    />
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Carrossel de imagens */}
      <View style={styles.carouselContainer}>
        <FlatList
          ref={scrollRef}
          data={photos}
          renderItem={renderCarouselImage}
          keyExtractor={(_, index) => String(index)}
          horizontal
          pagingEnabled
          scrollEventThrottle={16}
          onScroll={handleScroll}
          showsHorizontalScrollIndicator={false}
        />
        {/* Indicadores */}
        <View style={styles.indicators}>
          {photos.map((_, index) => renderIndicator(index))}
        </View>
      </View>

      {/* Informações principais */}
      <View style={styles.content}>
        <Text style={styles.title}>{property.title}</Text>
        <Text style={styles.price}>{priceFormatted}</Text>

        {property.address && (
          <Text style={styles.location}>
            {property.address.street} {property.address.number}
            {property.address.complement && `, ${property.address.complement}`}
            {'\n'}
            {property.address.city} - {property.address.neighborhood}
          </Text>
        )}

        {property.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>
        )}

        {/* Características */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Características</Text>
          <View style={styles.featuresGrid}>
            {property.numberOfBedrooms !== undefined && (
              <View style={styles.featureItem}>
                <Text style={styles.featureValue}>{property.numberOfBedrooms}</Text>
                <Text style={styles.featureLabel}>Quartos</Text>
              </View>
            )}
            {property.numberOfBathrooms !== undefined && (
              <View style={styles.featureItem}>
                <Text style={styles.featureValue}>{property.numberOfBathrooms}</Text>
                <Text style={styles.featureLabel}>Banheiros</Text>
              </View>
            )}
            {property.numberOfRooms !== undefined && (
              <View style={styles.featureItem}>
                <Text style={styles.featureValue}>{property.numberOfRooms}</Text>
                <Text style={styles.featureLabel}>Cômodos</Text>
              </View>
            )}
          </View>
        </View>

        {/* Comodidades */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comodidades</Text>
          <View style={styles.amenitiesList}>
            {property.furnished && (
              <Text style={styles.amenity}>✓ Mobiliado</Text>
            )}
            {property.petFriendly && (
              <Text style={styles.amenity}>✓ Permite animais</Text>
            )}
            {property.garage && (
              <Text style={styles.amenity}>✓ Garagem</Text>
            )}
          </View>
        </View>

        {/* Tipo e Status */}
        {(property.type || property.status) && (
          <View style={styles.section}>
            <View style={styles.typeStatusRow}>
              {property.type && (
                <View style={[styles.badge, styles.badgeType]}>
                  <Text style={styles.badgeText}>{translatePropertyType(property.type)}</Text>
                </View>
              )}
              {property.status && (
                <View style={[styles.badge, styles.badgeStatus]}>
                  <Text style={styles.badgeText}>{translatePropertyStatus(property.status)}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Contato */}
        {property.phoneNumber && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contato</Text>
            <Text style={styles.contact}>{property.phoneNumber}</Text>
          </View>
        )}

        {/* Data de criação */}
        {property.createdAt && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Cadastrado em {new Date(property.createdAt).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  carouselContainer: {
    position: 'relative',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  carouselItemContainer: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselImage: {
    width: width,
    height: 250,
    resizeMode: 'cover',
  },
  indicators: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: '#fff',
    width: 10,
    height: 10,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2563EB',
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  featureLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  amenitiesList: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  amenity: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  typeStatusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeType: {
    backgroundColor: '#E3F2FD',
  },
  badgeStatus: {
    backgroundColor: '#F3E5F5',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  contact: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563EB',
  },
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
