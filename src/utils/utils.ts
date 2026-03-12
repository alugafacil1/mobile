import * as Location from 'expo-location';

export async function getCurrentLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Permissão de localização negada');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  const { latitude, longitude } = location.coords;

  const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });

  return {
    // Coordenadas separadas para o GeolocationRequest
    coords: {
      lat: latitude,
      lon: longitude,
    },
    // Campos de endereço para pré-preencher o formulário
    address: {
      endereco: place.street ?? '',
      numero: place.streetNumber ?? '',
      bairro: place.district ?? place.subregion ?? '',
      cidade: place.city ?? '',
      estado: place.region ?? '',
      cep: place.postalCode ?? '',
    },
  };
}