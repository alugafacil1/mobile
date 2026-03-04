import { api } from './api';

export async function toggleFavorite(
  userId: string,
  propertyId: string
): Promise<boolean> {
  try {
    const res = await api.post(
      `/api/favorites/toggle?userId=${userId}&propertyId=${propertyId}`
    );

    return res.data.isFavorited as boolean;
  } catch (err) {
    console.error('Erro ao favoritar imóvel:', err);
    throw err;
  }
}

export async function checkIfFavorited(
  userId: string,
  propertyId: string
): Promise<boolean> {
  try {
    const res = await api.get(
      `/api/favorites/check?userId=${userId}&propertyId=${propertyId}`
    );

    return res.data.isFavorited as boolean;
  } catch (err) {
    console.error('Erro ao verificar favorito:', err);
    throw err;
  }
}

export async function getUserFavorites(userId: string) {
  try {
    const res = await api.get(`/api/favorites/user/${userId}`);
    return res.data;
  } catch (err) {
    console.error('Erro ao buscar favoritos do usuário:', err);
    throw err;
  }
}