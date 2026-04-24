import { query } from '../db.js';
import { mapTicketRow } from '../utils/ticketMapper.js';

const ticketSelect = `
  SELECT
    t.id,
    t.description,
    t.status,
    t.priority,
    t.assigned_group,
    t.service_type,
    TO_CHAR(t.submit_date, 'YYYY-MM-DD') AS submit_date,
    t.aging,
    t.owner_user_id,
    owner_user.name AS owner_name,
    t.assigned_person_user_id,
    assigned_user.name AS assigned_person_name
  FROM tickets t
  JOIN users owner_user ON owner_user.id = t.owner_user_id
  LEFT JOIN users assigned_user ON assigned_user.id = t.assigned_person_user_id
`;

async function fetchAllTickets() {
  const result = await query(`${ticketSelect} ORDER BY t.submit_date DESC, t.id DESC`);
  return result.rows.map(mapTicketRow);
}

async function findTicketRow(ticketId) {
  const result = await query(`${ticketSelect} WHERE t.id = $1`, [ticketId]);
  return result.rows[0] || null;
}

function operatorCanAccessTicket(ticket, userId) {
  return ticket.owner_user_id === userId || ticket.assigned_person_user_id === userId;
}

export async function getTickets(req, res) {
  const tickets = await fetchAllTickets();
  return res.json(tickets);
}

export async function createTicket(req, res) {
  const {
    id,
    description,
    status,
    priority,
    assignedGroup,
    serviceType,
    submitDate,
    aging,
    assignedPersonUserId,
  } = req.body;

  if (!id || !description || !status || !priority || !assignedGroup || !serviceType || !submitDate) {
    return res.status(400).json({ message: 'Missing required ticket fields.' });
  }

  const result = await query(
    `INSERT INTO tickets (
      id,
      description,
      status,
      priority,
      assigned_group,
      service_type,
      submit_date,
      aging,
      owner_user_id,
      assigned_person_user_id
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      id,
      description,
      status,
      priority,
      assignedGroup,
      serviceType,
      submitDate,
      aging ?? 0,
      req.user.id,
      assignedPersonUserId || null,
    ]
  );

  void result;
  return res.status(201).json(await fetchAllTickets());
}

export async function updateTicket(req, res) {
  const ticketId = req.params.id;
  const currentTicket = await findTicketRow(ticketId);

  if (!currentTicket) {
    return res.status(404).json({ message: 'Ticket not found.' });
  }

  if (req.user.role === 'operator' && !operatorCanAccessTicket(currentTicket, req.user.id)) {
    return res.status(403).json({ message: 'Operators can only update their own or assigned tickets.' });
  }

  if (req.user.role === 'operator') {
    await query(
      `UPDATE tickets
       SET status = $1, aging = $2, updated_at = NOW()
       WHERE id = $3`,
      [req.body.status || currentTicket.status, req.body.aging ?? currentTicket.aging, ticketId]
    );

    return res.json(await fetchAllTickets());
  }

  await query(
    `UPDATE tickets
     SET
       description = $1,
       status = $2,
       priority = $3,
       assigned_group = $4,
       service_type = $5,
       submit_date = $6,
       aging = $7,
       assigned_person_user_id = $8,
       updated_at = NOW()
     WHERE id = $9`,
    [
      req.body.description,
      req.body.status,
      req.body.priority,
      req.body.assignedGroup,
      req.body.serviceType,
      req.body.submitDate,
      req.body.aging ?? currentTicket.aging,
      req.body.assignedPersonUserId || null,
      ticketId,
    ]
  );

  return res.json(await fetchAllTickets());
}

export async function deleteTicket(req, res) {
  const ticketId = req.params.id;
  const currentTicket = await findTicketRow(ticketId);

  if (!currentTicket) {
    return res.status(404).json({ message: 'Ticket not found.' });
  }

  if (req.user.role === 'operator' && currentTicket.owner_user_id !== req.user.id) {
    return res.status(403).json({ message: 'Operators can only delete tickets they own.' });
  }

  await query('DELETE FROM tickets WHERE id = $1', [ticketId]);
  return res.json(await fetchAllTickets());
}
