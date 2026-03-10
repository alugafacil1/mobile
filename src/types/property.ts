export interface AddressResponse {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  number?: string | number;
  complement?: string | null;
  neighborhood?: string;
}

export interface GeolocationResponse {
  latitude?: number;
  longitude?: number;
}

export type PropertyStatus = 'ACTIVE' | 'PAUSED' | 'PLACED';

export type PropertyType = 'APARTMENT' | 'HOUSE' | 'COMMERCIAL' | 'KITNET_STUDIO';

export interface PropertyFilterRequest {
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  garage?: boolean;
  furnished?: boolean;
  petFriendly?: boolean;
  type?: PropertyType;
  status?: PropertyStatus;
  city?: string;
  neighborhood?: string;
  lat?: number;
  lon?: number;
  radius?: number;
}

export interface Property {
  propertyId: string;
  title: string;
  description?: string;
  address?: AddressResponse;
  geolocation?: GeolocationResponse;
  priceInCents?: number;
  numberOfRooms?: number;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  furnished?: boolean;
  petFriendly?: boolean;
  garage?: boolean;
  isOwner?: boolean;
  videoUrl?: string;
  phoneNumber?: string;
  photoUrls?: string[];
  status?: PropertyStatus;
  type?: PropertyType;
  ownerId?: string;
  createdAt?: string;
}