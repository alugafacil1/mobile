import axios from 'axios';

const api = axios.create({
  // Se estiver no Android Emulator use '10.0.2.2'. 
  // No iPhone físico ou Expo Go via Wi-Fi, use o IP da sua máquina (ex: 192.168.1.XX)
  baseURL: 'https://alugafacil-back.onrender.com/',
});

export { api };