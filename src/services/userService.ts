import { api } from './api';

export async function getUserById(userId: string) {
  try {
    const res = await api.get(`/api/users/${userId}`);
    return res.data;
  } catch (err) {
    console.log("Erro ao buscar usuário:", err);
    throw err;
  }
}