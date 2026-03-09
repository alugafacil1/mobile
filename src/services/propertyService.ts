import { api } from './api';
import { Property, PropertyFilterRequest } from '../types/property';
import { PropertyRequest } from '../types/propertyRequest';

/** Resposta do endpoint que combina properties e simpleProperties */
interface CombinedPropertiesResponse {
  properties?: {
    content?: Property[];
    [key: string]: unknown;
  };
  simpleProperties?: SimplePropertyResponse[];
}

/** Formato do SimpleProperty vindo do backend */
interface SimplePropertyResponse {
  id: string;
  propertyType: string;
  phoneNumber: string;
  address?: Record<string, unknown>;
  geolocation?: { latitude?: number; longitude?: number };
  photoUrls?: string[];
}

function simplePropertyToProperty(simple: SimplePropertyResponse): Property {
  const addr = simple.address ?? {};
  const street = (addr.street ?? addr.endereco ?? '') as string;
  const number = (addr.number ?? addr.numero ?? '') as string;
  const city = (addr.city ?? addr.cidade ?? '') as string;
  const state = (addr.state ?? addr.estado ?? '') as string;
  const neighborhood = (addr.neighborhood ?? addr.bairro ?? '') as string;
  const title = [street, number].filter(Boolean).join(', ') || 'Imóvel';
  return {
    propertyId: simple.id,
    title,
    address: {
      street: street || undefined,
      city: city || undefined,
      state: state || undefined,
      number: number || undefined,
      neighborhood: neighborhood || undefined,
    },
    geolocation: simple.geolocation
      ? {
          latitude: simple.geolocation.latitude,
          longitude: simple.geolocation.longitude,
        }
      : undefined,
    phoneNumber: simple.phoneNumber,
    photoUrls: simple.photoUrls ?? [],
    type: (simple.propertyType === 'KITNET_STUDIO' ? 'APARTMENT' : simple.propertyType) as Property['type'],
  };
}

export async function getProperties(filters?: PropertyFilterRequest, page = 0, size = 50): Promise<Property[]> {
  try {

    const hasFilters = filters && Object.keys(filters).length > 0;
    const params: any = { page, size };

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

    const res = await api.get('/api/properties/with-simple', config);
    const payload = res.data as CombinedPropertiesResponse;

    const properties: Property[] = [];
    if (payload?.properties?.content && Array.isArray(payload.properties.content)) {
      properties.push(...payload.properties.content);
    }
    if (payload?.simpleProperties && Array.isArray(payload.simpleProperties)) {
      properties.push(...payload.simpleProperties.map(simplePropertyToProperty));
    }

    return properties;
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