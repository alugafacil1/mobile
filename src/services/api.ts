import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  // Se estiver no Android Emulator use '10.0.2.2'. 
  // No iPhone físico ou Expo Go via Wi-Fi, use o IP da sua máquina (ex: 192.168.1.XX)
  baseURL: 'https://alugafacil-back.onrender.com/',
});

// Interceptor para tratar erros 401 (token expirado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('user');
        
        delete api.defaults.headers.common['Authorization'];
        
        console.log('Token expirado. Usuário deslogado.');
      } catch (storageError) {
        console.error('Erro ao limpar storage:', storageError);
      }
    }
  }
);

export { api };