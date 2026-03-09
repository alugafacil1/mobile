import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { getCurrentLocation } from '../utils/utils';

export default function CreateSimplePropertyScreen({ navigation, route }: any) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [loadingLocation, setLoadingLocation] = useState(false);

  const onPhotoTaken: ((uri: string) => void) | undefined = route.params?.onPhotoTaken;
  const skipLocation: boolean = route.params?.skipLocation ?? false;

  const handlePhotoResult = async (photoUri: string) => {
    // Modo "adicionar foto extra" — retorna via callback e volta
    if (onPhotoTaken) {
      onPhotoTaken(photoUri);
      navigation.goBack();
      return;
    }

    // Modo "primeira foto" sem busca de localização
    if (skipLocation) {
      navigation.navigate('SimplePropertyRegister', { photoUri });
      return;
    }

    // Modo "primeira foto" com busca de localização e coordenadas
    setLoadingLocation(true);
    try {
      const { address, coords } = await getCurrentLocation();
      navigation.navigate('SimplePropertyRegister', { photoUri, address, coords });
    } catch (error) {
      console.warn('Não foi possível obter localização:', error);
      navigation.navigate('SimplePropertyRegister', { photoUri });
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        await handlePhotoResult(photo.uri);
      } catch (error) {
        console.error('Erro ao capturar foto:', error);
        Alert.alert('Erro', 'Falha ao capturar foto');
      }
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled && result.assets[0]) {
        await handlePhotoResult(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Falha ao selecionar imagem');
    }
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.message}>
          <Ionicons name="alert-circle" size={48} color="#fff" />
          <Text style={styles.text}>Permissão de câmera necessária</Text>
          <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>Conceder permissão</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} facing="back" style={styles.camera}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.galleryButton]} onPress={handlePickFromGallery}>
            <Ionicons name="images" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </CameraView>

      <View style={styles.captureButtonContainer}>
        {loadingLocation ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Obtendo localização...</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.captureButton} onPress={handleTakePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  message: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', marginTop: 12, fontSize: 16 },
  permissionButton: {
    marginTop: 20, paddingHorizontal: 24, paddingVertical: 12,
    backgroundColor: '#fff', borderRadius: 8,
  },
  permissionButtonText: { color: '#000', fontWeight: 'bold' },
  buttonContainer: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', margin: 20 },
  button: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  cancelButton: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  galleryButton: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  captureButtonContainer: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', paddingBottom: 30, minHeight: 100,
  },
  loadingContainer: { alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 8, fontSize: 13 },
  captureButton: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  captureButtonInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },
});