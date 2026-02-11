import { api } from './api';
import { Property, PropertyFilterRequest } from '../types/property';
import { PropertyRequest } from '../types/propertyRequest';

export async function getProperties(filters?: PropertyFilterRequest, page = 0, size = 50): Promise<Property[]> {
  try {

    const hasFilters = filters && Object.keys(filters).length > 0;
    const params: any = { page, size };
    console.log('Construindo params para getProperties, filtros fornecidos:', filters);

    if (hasFilters && filters) {
      if (filters.minPrice != undefined) params.minPrice = filters.minPrice;
      if (filters.maxPrice != undefined) params.maxPrice = filters.maxPrice;
      if (filters.minRooms != undefined) params.minRooms = filters.minRooms;
      if (filters.minBedrooms != undefined) params.minBedrooms = filters.minBedrooms;
      if (filters.garage != undefined) params.garage = filters.garage;
      if (filters.furnished != undefined) params.furnished = filters.furnished;
      if (filters.petFriendly != undefined) params.petFriendly = filters.petFriendly;
      if (filters.type != undefined) params.type = filters.type;
      if (filters.status != undefined) params.status = filters.status;
      if (filters.city != undefined) params.city = filters.city;
      if (filters.neighborhood != undefined) params.neighborhood = filters.neighborhood;
      if (filters.lat != undefined) params.lat = filters.lat;
      if (filters.lon != undefined) params.lon = filters.lon;
      if (filters.radius != undefined) params.radius = filters.radius;
    }

    const config: any = { params };

    const res = await api.get('/api/properties', config);
    const payload = res.data as any;

    if (payload && Array.isArray(payload.content)) {
      console.log('Page.content length:', payload.content.length);
      return payload.content as Property[];
    }

    if (Array.isArray(payload)) {
      return payload as Property[];
    }

    if (payload && Array.isArray(payload.items)) return payload.items as Property[];

    console.warn('Formato inesperado de resposta de /api/properties, retornando array vazio', payload);
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