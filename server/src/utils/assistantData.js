import { query } from '../db.js';
import { getSlaPresentation } from './sla.js';

const ACTIVE_STATUSES = ['Open', 'In Progress', 'Pending'];

function addRoleAccessCondition(user, conditions, params) {
  if (user.role !== 'operator') return;

  params.push(user.id);
  conditions.push(`(t.owner_user_id = $${params.length} OR t.assigned_person_user_id = $${params.length})`);
}

function addUserTicketCondition(user, conditions, params) {
  params.push(user.id);
  conditions.push(`(t.owner_user_id = $${params.length} OR t.assigned_person_user_id = $${params.length})`);
}

function getAssistantTicketSelect() {
  return `
    SELECT
      t.id,
      t.description,
      t.status,
      t.priority,
      t.assigned_group,
      t.site_id,
      t.service_type,
      TO_CHAR(t.submit_date, 'YYYY-MM-DD') AS submit_date,
      t.sla_deadline,
      t.owner_user_id,
      owner_user.name AS owner_name,
      t.assigned_person_user_id,
      assigned_user.name AS assigned_person_name,
      team.name AS team_name
    FROM tickets t
    JOIN users owner_user ON owner_user.id = t.owner_user_id
    LEFT JOIN users assigned_user ON assigned_user.id = t.assigned_person_user_id
    LEFT JOIN teams team ON team.id = t.team_id
  `;
}

function mapSafeTicket(row) {
  const sla = getSlaPresentation(row);

  return {
    id: row.id,
    description: row.description,
    status: row.status,
    priority: row.priority,
    team: row.team_name || row.assigned_group,
    siteId: row.site_id,
    serviceType: row.service_type,
    submitDate: row.submit_date,
    ownerName: row.owner_name,
    assignedPersonName: row.assigned_person_name || '',
    slaRemainingLabel: sla.slaRemainingLabel,
    slaUrgency: sla.slaUrgency,
  };
}

function mapCompactTicket(row) {
  const ticket = mapSafeTicket(row);

  return {
    id: ticket.id,
    status: ticket.status,
    priority: ticket.priority,
    team: ticket.team,
    slaRemainingLabel: ticket.slaRemainingLabel,
    slaUrgency: ticket.slaUrgency,
  };
}

function addParam(params, value) {
  params.push(value);
  return `$${params.length}`;
}

async function fetchAssistantTickets(user, applyFilters = () => {}, orderBy = 't.submit_date DESC, t.id DESC', limit = null) {
  const conditions = [];
  const params = [];

  addRoleAccessCondition(user, conditions, params);
  applyFilters(conditions, params);

  const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limitSql = limit ? `LIMIT ${Number(limit)}` : '';

  const result = await query(
    `${getAssistantTicketSelect()}
     ${whereSql}
     ORDER BY ${orderBy}
     ${limitSql}`,
    params
  );

  return result.rows;
}

export async function getTicketStats(user) {
  const tickets = await fetchAssistantTickets(user);
  const stats = {
    total: tickets.length,
    byStatus: {},
    byPriority: {},
    bySlaUrgency: {},
  };

  for (const row of tickets) {
    const ticket = mapSafeTicket(row);
    stats.byStatus[ticket.status] = (stats.byStatus[ticket.status] || 0) + 1;
    stats.byPriority[ticket.priority] = (stats.byPriority[ticket.priority] || 0) + 1;
    stats.bySlaUrgency[ticket.slaUrgency] = (stats.bySlaUrgency[ticket.slaUrgency] || 0) + 1;
  }

  return stats;
}

export async function getCriticalOpenTickets(user) {
  const rows = await fetchAssistantTickets(
    user,
    (conditions, params) => {
      conditions.push(`t.priority = 'Critical'`);
      conditions.push(`t.status = ANY(${addParam(params, ACTIVE_STATUSES)})`);
    },
    't.sla_deadline ASC NULLS LAST, t.id ASC',
    10
  );

  return rows.map(mapCompactTicket);
}

export async function getOverdueSLATickets(user) {
  const rows = await fetchAssistantTickets(
    user,
    (conditions, params) => {
      conditions.push(`t.status = ANY(${addParam(params, ACTIVE_STATUSES)})`);
      conditions.push(`t.sla_deadline IS NOT NULL`);
      conditions.push(`t.sla_deadline < NOW()`);
    },
    't.sla_deadline ASC, t.id ASC',
    10
  );

  return rows.map(mapCompactTicket);
}

export async function getTicketById(user, ticketId) {
  const rows = await fetchAssistantTickets(
    user,
    (conditions, params) => {
      conditions.push(`t.id = ${addParam(params, ticketId)}`);
    },
    't.id ASC',
    1
  );

  return rows[0] ? mapSafeTicket(rows[0]) : null;
}

export async function searchTickets(user, filters = {}) {
  const rows = await fetchAssistantTickets(
    user,
    (conditions, params) => {
      if (filters.status) {
        conditions.push(`t.status = ${addParam(params, filters.status)}`);
      }

      if (filters.priority) {
        conditions.push(`t.priority = ${addParam(params, filters.priority)}`);
      }

      if (filters.text) {
        const placeholder = addParam(params, `%${filters.text}%`);
        conditions.push(`(t.id ILIKE ${placeholder} OR t.description ILIKE ${placeholder})`);
      }
    },
    't.submit_date DESC, t.id DESC',
    filters.limit || 10
  );

  return rows.map(mapCompactTicket);
}

export async function getCurrentUserActiveTicketSummary(user) {
  const conditions = [];
  const params = [];

  addUserTicketCondition(user, conditions, params);
  conditions.push(`t.status = ANY($2)`);
  params.push(ACTIVE_STATUSES);

  const result = await query(
    `${getAssistantTicketSelect()}
     WHERE ${conditions.join(' AND ')}
     ORDER BY t.sla_deadline ASC NULLS LAST, t.id ASC`,
    params
  );

  const summary = {
    urgent: [],
    warning: [],
    normal: [],
  };

  for (const row of result.rows) {
    const ticket = mapCompactTicket(row);
    if (ticket.slaUrgency === 'overdue' || ticket.slaUrgency === 'completed') continue;
    if (ticket.slaUrgency === 'danger') summary.urgent.push(ticket);
    if (ticket.slaUrgency === 'warning') summary.warning.push(ticket);
    if (ticket.slaUrgency === 'normal' || ticket.slaUrgency === 'none') summary.normal.push(ticket);
  }

  return {
    userName: user.name,
    counts: {
      urgent: summary.urgent.length,
      warning: summary.warning.length,
      normal: summary.normal.length,
    },
    tickets: summary,
  };
}
