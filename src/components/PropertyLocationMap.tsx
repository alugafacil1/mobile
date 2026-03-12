import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';

MapLibreGL.setAccessToken(null);

const { width } = Dimensions.get('window');
const MAP_HEIGHT = 200;

interface PropertyLocationMapProps {
  latitude: number;
  longitude: number;
}

export default function PropertyLocationMap({ latitude, longitude }: PropertyLocationMapProps) {
  const mapRef = useRef<any>(null);
  const coordinate: [number, number] = [longitude, latitude];

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        ref={mapRef}
        style={styles.map}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <MapLibreGL.Camera
          zoomLevel={15}
          centerCoordinate={coordinate}
        />
        <MapLibreGL.PointAnnotation id="propertyLocation" coordinate={coordinate}>
          <View style={styles.marker} />
        </MapLibreGL.PointAnnotation>
      </MapLibreGL.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height: MAP_HEIGHT,
    marginHorizontal: -16,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  marker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    borderWidth: 3,
    borderColor: '#fff',
  },
});
