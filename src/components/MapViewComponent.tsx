import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, ActivityIndicator, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";
import { getCurrentLocation } from "../utils/utils";
import { Ionicons } from "@expo/vector-icons";

MapLibreGL.setAccessToken(null);

export default function MapViewComponent({ onFilterApply }: { onFilterApply?: (lat: number, lon: number, radius: number) => void }) {
  const mapRef = useRef<any>(null);

  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState("1");
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [currentAddress, setCurrentAddress] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [loadingAddress, setLoadingAddress] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const loc = await getCurrentLocation();
        if (mounted) {
          setLocation(loc);
          // Buscar endereço da localização atual
          await getAddressFromCoordinates(loc.lat, loc.lon, true);
        }
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

  const getAddressFromCoordinates = async (lat: number, lon: number, isCurrent: boolean = false) => {
    try {
      setLoadingAddress(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      
      const address = data.address?.road || data.address?.street || "Endereço não encontrado";
      const street = data.address?.road || data.address?.street || "";
      const number = data.address?.house_number || "";
      const fullAddress = `${street}${number ? ", " + number : ""}`;

      if (isCurrent) {
        setCurrentAddress(fullAddress || "Localização atual");
      } else {
        setSelectedAddress(fullAddress || `${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      }
    } catch (err) {
      console.error("Erro ao buscar endereço:", err);
      if (isCurrent) {
        setCurrentAddress("Localização atual");
      } else {
        setSelectedAddress(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      }
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleMapPress = (e: any) => {
    const coords = e.geometry.coordinates;
    setSelectedPoint(coords);
    setUseCurrentLocation(false);
    // Buscar endereço do ponto selecionado
    getAddressFromCoordinates(coords[1], coords[0], false);
  };

  const handleUseCurrentLocation = () => {
    if (location) {
      setSelectedPoint([location.lon, location.lat]);
      setUseCurrentLocation(true);
    }
  };

  const handleApplyFilter = () => {
    let radiusValue = parseFloat(radius);
    
    if (isNaN(radiusValue) || radius.trim() === "") {
      radiusValue = 1;
    }
    
    if (radiusValue <= 0) {
      Alert.alert('Erro', 'O raio deve ser maior que 0 km');
      return;
    }

    const [lon, lat] = useCurrentLocation 
      ? [location!.lon, location!.lat]
      : selectedPoint!;

    if (onFilterApply) {
      onFilterApply(lat, lon, radiusValue);
    }
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
  const filterLat = useCurrentLocation ? lat : selectedPoint?.[1];
  const filterLon = useCurrentLocation ? lon : selectedPoint?.[0];

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

        {/* Círculo de raio */}
        {selectedPoint && (
          <MapLibreGL.ShapeSource
            id="radiusSource"
            shape={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [filterLon, filterLat],
              },
            }}
          >
            <MapLibreGL.CircleLayer
              id="radiusLayer"
              style={{
                circleRadius: parseFloat(radius || '1') * 32, 
                circleColor: '#2563EB',
                circleOpacity: 0.2,
                circleStrokeWidth: 2,
                circleStrokeColor: '#2563EB',
              }}
            />
          </MapLibreGL.ShapeSource>
        )}

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

      {/* Painel inicial simples */}
      {!selectedPoint && location && (
        <View style={styles.initialPanel}>
          <View style={styles.initialPanelContent}>
            <Ionicons name="location" size={20} color="#2563EB" />
            <Text style={styles.initialPanelText}>
              {loadingAddress ? "Buscando endereço..." : currentAddress}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.initialPanelButton}
            onPress={() => {
              setSelectedPoint([location.lon, location.lat]);
              setUseCurrentLocation(true);
            }}
          >
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Painel de filtro completo */}
      {selectedPoint ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.filterPanel}>
            <ScrollView 
              contentContainerStyle={styles.filterContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Local</Text>
                <View style={styles.location}>
                  <Ionicons name="location" size={20} color="#2563EB" />
                  <Text style={styles.locationText}>
                    {useCurrentLocation ? currentAddress : selectedAddress}
                  </Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Raio de Busca (km)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1 (padrão)"
                  keyboardType="decimal-pad"
                  value={radius}
                  onChangeText={setRadius}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </ScrollView>

            {/* Botões de ação */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={handleApplyFilter}
              >
                <Ionicons name="checkmark" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      ) : null}
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
  keyboardAvoidingView: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  initialPanel: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  initialPanelContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  initialPanelText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    flex: 1,
  },
  initialPanelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  filterPanel: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    maxHeight: "70%",
    minHeight: 200,
  },
  filterContent: {
    marginBottom: 16,
    paddingBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#000",
    height: 44,
    backgroundColor: "#F9FAFB",
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#1F2937",
    flex: 1,
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  currentLocationButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#2563EB",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  applyButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
});