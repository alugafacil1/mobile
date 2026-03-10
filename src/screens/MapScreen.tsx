import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapViewComponent from '../components/MapViewComponent';
import { useNavigation } from '@react-navigation/native';

export default function MapScreen({ route }: any) {
  const navigation = useNavigation<any>();

  const handleFilterApply = (lat: number, lon: number, radius: number) => {
    navigation.navigate('Main', {
      screen: 'Home',
      params: {
        screen: 'HomeScreen',
        params: { locationFilter: { lat, lon, radius } },
      },
      merge: true,
    });
  };

  return (
    <View style={styles.container}>
      <MapViewComponent onFilterApply={handleFilterApply} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});