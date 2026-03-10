import { api } from './api';
import { SimpleProperty, SimplePropertyRequest } from '../types/simpleProperty';

export async function createSimpleProperty(data: SimplePropertyRequest): Promise<SimpleProperty> {
  try {
    const response = await api.post('/api/properties/simple', data);
    return response.data as SimpleProperty;
  } catch (error) {
    console.error('Erro ao criar SimpleProperty:', error);
    throw error;
  }
}

export async function getSimpleProperty(id: string): Promise<SimpleProperty> {
  try {
    const response = await api.get(`/api/properties/simple/${id}`);
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
    
    if (Array.isArray(data)) {
      return data as SimpleProperty[];
    }
    
    if (data && Array.isArray(data.content)) {
      return data.content as SimpleProperty[];
    }
    
    if (data && Array.isArray(data.items)) {
      return data.items as SimpleProperty[];
    }
    
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
