import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";
import { getCurrentLocation } from "../utils/utils";

MapLibreGL.setAccessToken(null);

export default function MapViewComponent() {
  const mapRef = useRef<any>(null);

  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const loc = await getCurrentLocation();
        if (mounted) setLocation(loc);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Erro ao obter localização");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleMapPress = (e: any) => {
    const coords = e.geometry.coordinates; // [lon, lat]
    setSelectedPoint(coords);
  };

  const setPortugueseLabels = async () => {
    try {
      const layers = await mapRef.current?.getStyle()?.layers;

      if (!layers) return;

      for (const layer of layers) {
        if (layer.type === "symbol" && layer.layout?.["text-field"]) {
          mapRef.current?.setLayoutProperty(
            layer.id,
            "text-field",
            ["coalesce", ["get", "name:pt"], ["get", "name"]]
          );
        }
      }
    } catch (err) {
      console.warn("Erro ajustando idioma:", err);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !location) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>{error ?? "Localização indisponível"}</Text>
      </View>
    );
  }

  const { lat, lon } = location;

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        ref={mapRef}
        style={styles.map}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        onPress={handleMapPress}
        onDidFinishLoadingMap={setPortugueseLabels}
      >
        <MapLibreGL.Camera
          zoomLevel={14}
          centerCoordinate={[lon, lat]}
        />

        {/* Marcador da posição atual */}
        <MapLibreGL.PointAnnotation
          id="userLocation"
          coordinate={[lon, lat]}
        >
          <View style={styles.userMarker} />
        </MapLibreGL.PointAnnotation>

        {/* Marcador do ponto selecionado */}
        {selectedPoint && (
          <MapLibreGL.PointAnnotation
            id="selectedPoint"
            coordinate={selectedPoint}
          >
            <View style={styles.selectedMarker} />
          </MapLibreGL.PointAnnotation>
        )}
      </MapLibreGL.MapView>

      {selectedPoint && (
        <View style={styles.infoBox}>
          <Text>Latitude: {selectedPoint[1].toFixed(6)}</Text>
          <Text>Longitude: {selectedPoint[0].toFixed(6)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  userMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  selectedMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF3B30",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  infoBox: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    elevation: 4,
  },
});