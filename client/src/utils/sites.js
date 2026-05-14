import { apiRequest } from './api';

export async function fetchSites() {
  return apiRequest('/sites');
}

export async function fetchSite(siteId) {
  return apiRequest(`/sites/${encodeURIComponent(siteId)}`);
}

export async function fetchSitesWithTicketSummary() {
  return apiRequest('/sites/with-ticket-summary');
}
