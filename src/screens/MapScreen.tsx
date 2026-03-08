import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapViewComponent from '../components/MapViewComponent';
import { useNavigation } from '@react-navigation/native';

export default function MapScreen({ route }: any) {
  const { latitude = -23.55052, longitude = -46.633308 } = route?.params || {};
  const navigation = useNavigation<any>();

  const handleFilterApply = (lat: number, lon: number, radius: number) => {
    // Navegar para Home que está dentro do Main (AppTabs)
    navigation.navigate('Main' as any, {
      screen: 'Home',
      params: {
        locationFilter: {
          lat,
          lon,
          radius,
        },
      },
    });
  };

  return (
    <View style={styles.container}>
      <MapViewComponent 
        onFilterApply={handleFilterApply}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
