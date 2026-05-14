export function isCompletedTicket(ticket) {
  return ticket?.status === 'Resolved' || ticket?.status === 'Closed';
}

export function normalizeSiteUrgency(urgency) {
  if (urgency === 'overdue' || urgency === 'danger') return 'danger';
  if (urgency === 'warning') return 'warning';
  return 'normal';
}

export function getTicketSiteUrgency(ticket) {
  if (!ticket || isCompletedTicket(ticket)) return 'normal';
  return normalizeSiteUrgency(ticket.slaUrgency);
}

export function getSitePinTone(site, ticket) {
  if (ticket) return getTicketSiteUrgency(ticket);
  return normalizeSiteUrgency(site?.highestSlaUrgency);
}

export function getSitePinLabel(tone) {
  if (tone === 'danger') return 'Critical SLA pressure';
  if (tone === 'warning') return 'SLA warning';
  return 'Normal';
}
