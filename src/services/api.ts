import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: 'https://alugafacil-back.onrender.com/',
});

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

    return Promise.reject(error);
  }
);

export { api };