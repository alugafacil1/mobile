import { api } from './api';
import { SimpleProperty, SimplePropertyRequest } from '../types/simpleProperty';

export async function createSimpleProperty(data: SimplePropertyRequest, photos: string[]) {
  const formData = new FormData();

  console.log("Dados enviados:", JSON.stringify(data, null, 2));
  console.log("Imagem URIs:", photos);

  formData.append("request", JSON.stringify(data));

  photos.forEach((uri, index) => {
    const fileData = {
      uri: uri,
      name: `photo_${index}.jpg`,
      type: "image/jpeg",
    };
    console.log(`Adicionando arquivo ${index}:`, fileData);
    formData.append("files", fileData as any);
  });

  try {
    const response = await api.post("/api/properties/simple", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: "application/json",
      },
    });

    console.log("Resposta do servidor:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Erro completo:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    console.error("Response headers:", error.response?.headers);
    throw error;
  }
}

export async function getSimpleProperty(id: string): Promise<SimpleProperty> {
  try {
    const response = await api.get(`/api/properties/simple/${id}`);
    console.log("Resposta do servidor:", response.data);
    return response.data as SimpleProperty;
  } catch (error) {
    console.error('Erro ao obter SimpleProperty:', error);
    throw error;
  }
}

export async function getAllSimpleProperties(): Promise<SimpleProperty[]> {
  try {
    const response = await api.get('/api/properties/simple');
    const data = response.data as any;
    if (Array.isArray(data)) return data as SimpleProperty[];
    if (data && Array.isArray(data.content)) return data.content as SimpleProperty[];
    if (data && Array.isArray(data.items)) return data.items as SimpleProperty[];
    return [];
  } catch (error) {
    console.error('Erro ao obter SimpleProperties:', error);
    throw error;
  }
}

export async function updateSimpleProperty(id: string, data: SimplePropertyRequest): Promise<SimpleProperty> {
  try {
    const response = await api.put(`/api/properties/simple/${id}`, data);
    return response.data as SimpleProperty;
  } catch (error) {
    console.error('Erro ao atualizar SimpleProperty:', error);
    throw error;
  }
}

export async function deleteSimpleProperty(id: string): Promise<void> {
  try {
    await api.delete(`/api/properties/simple/${id}`);
  } catch (error) {
    console.error('Erro ao deletar SimpleProperty:', error);
    throw error;
  }
}