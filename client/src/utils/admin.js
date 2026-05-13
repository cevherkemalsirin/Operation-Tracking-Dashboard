import { apiRequest } from './api';

export async function fetchAdminUsers() {
  return apiRequest('/admin/users');
}
