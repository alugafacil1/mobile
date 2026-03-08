import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  propertyId: string;
  image: string;
  address: string;
  details: string;
  price: string;
  total: string;
  isFavorite: boolean;
  onToggleFavorite: (propertyId: string) => void;
  onPress: () => void;
}

export default function PropertyCard({
  propertyId,
  image,
  address,
  details,
  price,
  total,
  isFavorite,
  onToggleFavorite,
  onPress
}: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.type}>Apartamento • Aluguel</Text>

        <Text style={styles.address}>{address}</Text>

        <Text style={styles.details}>{details}</Text>

        <Text style={styles.price}>{price}</Text>

        <View style={styles.footer}>
          <Text style={styles.total}>{total}</Text>

          <TouchableOpacity onPress={() => onToggleFavorite(propertyId)}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? "#EF4444" : "#2563EB"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 14,
  },
  type: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  address: {
    fontWeight: '600',
    marginBottom: 4,
  },
  details: {
    color: '#6B7280',
    marginBottom: 8,
  },
  price: {
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  total: {
    fontWeight: 'bold',
    color: '#2563EB',
  },
});