import { AUTH_ROLES } from '../auth';

export async function fetchTickets() {
  const response = await fetch('/tickets.json', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Could not load tickets.json');
  }

  return response.json();
}

function normalizeValue(value) {
  return String(value || '').trim().toLowerCase();
}

function getUserKeys(user) {
  if (!user) return [];

  const email = normalizeValue(user.email);
  const emailName = email.includes('@') ? email.split('@')[0] : email;

  return Array.from(new Set([
    normalizeValue(user.name),
    email,
    emailName,
    normalizeValue(user.id),
  ].filter(Boolean)));
}

function ticketMatchesUser(ticket, user) {
  const userKeys = getUserKeys(user);
  const owner = normalizeValue(ticket.Owner);
  const assignedPerson = normalizeValue(ticket.Assigned_Person);

  return userKeys.some((key) => key === owner || key === assignedPerson);
}

export function getDashboardTicketsForRole(tickets, role) {
  if (!role) return [];
  if (
    role === AUTH_ROLES.ADMIN ||
    role === AUTH_ROLES.OPERATOR ||
    role === AUTH_ROLES.VIEWER
  ) {
    return tickets;
  }
  return [];
}

export function getTicketManagementTicketsForRole(tickets, role, user) {
  if (!role) return [];
  if (role === AUTH_ROLES.ADMIN) return tickets;
  if (role === AUTH_ROLES.VIEWER) return [];
  if (role === AUTH_ROLES.OPERATOR) {
    return tickets.filter((ticket) => ticketMatchesUser(ticket, user));
  }
  return [];
}

