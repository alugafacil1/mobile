import { api } from './api';

export async function getConversations(userId: string) {
 const response = await api.get(`api/conversations/user/${userId}`)
 return response.data
}