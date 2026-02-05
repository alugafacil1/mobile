import { api } from './api';
import { Property } from '../types/property';

export async function getProperties(): Promise<Property[]> {
  try {
    const res = await api.get('/api/properties');
    console.log('Propriedades recebidas (raw):', res.data);

    const payload = res.data as any;

    if (Array.isArray(payload)) return payload as Property[];
    if (payload && Array.isArray(payload.content)) return payload.content as Property[];
    if (payload && Array.isArray(payload.items)) return payload.items as Property[];

    console.warn('Formato inesperado de resposta de /api/properties, retornando array vazio');
    return [];
  } catch (err) {
    console.error('Erro ao obter propriedades:', err);
    throw err;
  }
}