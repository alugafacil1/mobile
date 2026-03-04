import * as Location from 'expo-location';

export async function getCurrentLocation() {
  // pede permissão
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Permissão de localização negada');
  }

  // pega posição atual
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return {
    lat: location.coords.latitude,
    lon: location.coords.longitude,
  };
}
