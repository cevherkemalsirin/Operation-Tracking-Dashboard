import { apiRequest } from './api';

export async function fetchUsers() {
  return apiRequest('/users');
}
