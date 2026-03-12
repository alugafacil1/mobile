export type SimplePropertyType = 'APARTMENT' | 'HOUSE' | 'KITNET_STUDIO';

export interface AddressRequest {
  street: string;        // endereco
  neighborhood: string;  // bairro
  city: string;          // cidade
  state: string;         // estado
  postalCode: string;    // cep (formato: 99999-999)
  number: string;        // numero
  complement?: string;   // complemento (opcional)
}

export interface GeolocationRequest {
  latitude: number;
  longitude: number;
}

export interface SimplePropertyRequest {
  propertyType: SimplePropertyType;   // único tipo (não array)
  phoneNumber: string;
  address: AddressRequest;
  geolocation: GeolocationRequest;
  photoUrls?: string[];               // URLs das fotos já enviadas
}

// Resposta do back-end (se houver)
export interface SimpleProperty {
  id: string;
  propertyType: SimplePropertyType;
  phoneNumber: string;
  address: AddressRequest;
  geolocation: GeolocationRequest;
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
}