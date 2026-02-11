export interface PropertyRequest {
  title: string;
  description: string;

  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    postalCode: string;
    complement?: string;
  };

  geolocation: {
    latitude: number;
    longitude: number;
  };

  priceInCents: number;

  numberOfRooms?: number;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;

  furnished: boolean;
  petFriendly: boolean;
  garage: boolean;
  isOwner: boolean;

  videoUrl?: string;
  phoneNumber: string;

  photoUrls?: string[];

  status?: 'ACTIVE' | 'PAUSED' | 'PLACED';
  type: 'APARTMENT' | 'HOUSE' | 'COMMERCIAL';

  userId: string;
}
