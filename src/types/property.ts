export interface AddressResponse {
  street?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  number?: string | number;
  complement?: string | null;
}

export interface GeolocationResponse {
  latitude?: number;
  longitude?: number;
}

export type PropertyStatus = 'ACTIVE' | 'PAUSED' | 'PLACED';

export type PropertyType = 'APARTMENT' | 'HOUSE' | 'COMMERCIAL';

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