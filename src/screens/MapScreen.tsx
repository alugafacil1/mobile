import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapViewComponent from '../components/MapViewComponent';

export default function MapScreen({ route }: any) {
  const { latitude = -23.55052, longitude = -46.633308 } = route?.params || {};

  return (
    <View style={styles.container}>
      <MapViewComponent latitude={latitude} longitude={longitude} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
