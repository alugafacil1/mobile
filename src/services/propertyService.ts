import { api } from './api';
import { Property } from '../types/property';
import { PropertyRequest } from '../types/propertyRequest';

export async function getProperties(): Promise<Property[]> {
  try {
    const res = await api.get('/api/properties');

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

export async function getPropertiesByOwnerId(ownerId: string): Promise < Property[] > {
  try {
    const res = await api.get('/api/properties/owner/' + ownerId);

    const payload = res.data as any;

    if(Array.isArray(payload)) return payload as Property[];
    if(payload && Array.isArray(payload.content)) return payload.content as Property[];
  if(payload && Array.isArray(payload.items)) return payload.items as Property[];

console.warn('Formato inesperado de resposta de /api/properties, retornando array vazio');
return [];
  } catch (err) {
  console.error('Erro ao obter propriedades:', err);
  throw err;
}

}

export async function createProperty(
  data: PropertyRequest
): Promise<Property> {
  try {
    const res = await api.post('/api/properties', data);
    return res.data as Property;
  } catch (err) {
    console.error('Erro ao criar imóvel:', err);
    throw err;
  }
}