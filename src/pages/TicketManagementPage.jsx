import { useEffect, useMemo, useState } from 'react';
import '../styles/ticket-management.css';
import { AUTH_ROLES, useAuth } from '../auth';
import { fetchTickets, getTicketManagementTicketsForRole } from '../utils/tickets';

export default function TicketManagementPage() {
  const { role, user } = useAuth();
  const [allTickets, setAllTickets] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '' });
  const [editingTicket, setEditingTicket] = useState(null);
  const [formData, setFormData] = useState({ description: '', status: 'Open', priority: 'Low', assignedGroup: '', Owner: '', Assigned_Person: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTickets() {
      try {
        setError('');
        const data = await fetchTickets();
        setAllTickets(data);
      } catch (err) {
        setError('Failed to load ticket data from tickets.json.');
        setAllTickets([]);
      }
    }

    loadTickets();
  }, []);

  const scopedTickets = useMemo(() => {
    return getTicketManagementTicketsForRole(allTickets, role, user);
  }, [allTickets, role, user]);

  const visibleTickets = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();
    return scopedTickets.filter((ticket) => {
      const matchesSearch =
        !searchTerm ||
        String(ticket.id).includes(searchTerm) ||
        ticket.description.toLowerCase().includes(searchTerm) ||
        ticket.Owner.toLowerCase().includes(searchTerm) ||
        ticket.Assigned_Person.toLowerCase().includes(searchTerm);
      const matchesStatus = !filters.status || ticket.status === filters.status;
      const matchesPriority = !filters.priority || ticket.priority === filters.priority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [scopedTickets, filters]);

  const stats = useMemo(() => ({
    total: scopedTickets.length,
    open: scopedTickets.filter((t) => t.status === 'Open').length,
    progress: scopedTickets.filter((t) => t.status === 'In Progress').length,
    done: scopedTickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length,
  }), [scopedTickets]);
  const canEditTickets = role === AUTH_ROLES.ADMIN || role === AUTH_ROLES.OPERATOR;
  const isOperator = role === AUTH_ROLES.OPERATOR;
  const isAdmin = role === AUTH_ROLES.ADMIN;

  function openEditModal(ticket) {
    if (!canEditTickets) return;
    setEditingTicket(ticket.id);
    setFormData({
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      assignedGroup: ticket.assignedGroup,
      Owner: ticket.Owner,
      Assigned_Person: ticket.Assigned_Person,
    });
  }

  function closeEditModal() {
    setEditingTicket(null);
  }

  function handleSave(event) {
    event.preventDefault();
    if (!canEditTickets) return;
    if (!editingTicket || !formData.description.trim()) return;
    setAllTickets((current) =>
      current.map((ticket) => {
        if (ticket.id !== editingTicket) return ticket;
        if (isOperator) {
          return { ...ticket, status: formData.status };
        }
        return {
          ...ticket,
          description: formData.description.trim(),
          status: formData.status,
          priority: formData.priority,
          assignedGroup: formData.assignedGroup.trim(),
          Owner: formData.Owner.trim(),
          Assigned_Person: formData.Assigned_Person.trim(),
        };
      })
    );
    closeEditModal();
  }

  return (
    <div className="ticket-page">
      <div className="page-shell">
        <aside className="edge-panel edge-left">
          <img src="/assets/login-welcome/Images/nokia - Copy.svg" className="logo" alt="logo" />
          <h2>Operation Tracking</h2>
          <p>Tickets management workspace</p>
        </aside>

        <main className="tickets-main">
          <header className="tickets-header glass-panel"><div><h1>Tickets</h1><p>Monitor and update operational incidents.</p></div></header>
          {!canEditTickets && (
            <section className="glass-panel viewer-note">
              Viewer mode: ticket management is hidden for this role.
            </section>
          )}
          {isOperator && (
            <section className="glass-panel viewer-note">
              Operator mode: you can see only tickets where you are the Owner or Assigned_Person, and you can change only ticket status.
            </section>
          )}
          <section className="stats-grid">
            <article className="stat-card"><p>Total Tickets</p><strong>{stats.total}</strong></article>
            <article className="stat-card"><p>Open</p><strong>{stats.open}</strong></article>
            <article className="stat-card"><p>In Progress</p><strong>{stats.progress}</strong></article>
            <article className="stat-card"><p>Resolved / Closed</p><strong>{stats.done}</strong></article>
          </section>

          <section className="filter-panel glass-panel">
            <input value={filters.search} onChange={(e)=>setFilters((c)=>({...c, search:e.target.value}))} type="text" placeholder="Search by ID, description, owner, or assigned person" />
            <select value={filters.status} onChange={(e)=>setFilters((c)=>({...c, status:e.target.value}))}><option value="">All statuses</option><option value="Open">Open</option><option value="In Progress">In Progress</option><option value="Pending">Pending</option><option value="Resolved">Resolved</option><option value="Closed">Closed</option></select>
            <select value={filters.priority} onChange={(e)=>setFilters((c)=>({...c, priority:e.target.value}))}><option value="">All priorities</option><option value="Critical">Critical</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option></select>
          </section>

          <section className="table-panel glass-panel">
            <table>
              <thead><tr><th>ID</th><th>Description</th><th>Status</th><th>Priority</th><th>Assigned Group</th><th>Owner</th><th>Assigned Person</th><th>Submit Date</th><th>Action</th></tr></thead>
              <tbody>
                {visibleTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>{ticket.id}</td><td>{ticket.description}</td><td>{ticket.status}</td><td>{ticket.priority}</td><td>{ticket.assignedGroup}</td><td>{ticket.Owner}</td><td>{ticket.Assigned_Person}</td><td>{ticket.submitDate}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-secondary btn-edit"
                        onClick={() => openEditModal(ticket)}
                        disabled={!canEditTickets}
                      >
                        {canEditTickets ? 'Edit' : 'View Only'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(error || (role === AUTH_ROLES.VIEWER || visibleTickets.length === 0)) && (
              <div className="empty-state">
                {error || (role === AUTH_ROLES.VIEWER ? 'Viewer role cannot access ticket management tickets.' : 'No tickets match the selected filters.')}
              </div>
            )}
          </section>
        </main>

        <aside className="edge-panel edge-right"><div className="edge-pill">Live View</div><div className="edge-pill">Team Feed</div></aside>
      </div>

      <div className={`modal-overlay ${editingTicket ? 'active' : ''}`} aria-hidden={!editingTicket}>
        <div className="modal-card glass-panel" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
          <h2 id="edit-modal-title">Edit Ticket</h2>
          <form onSubmit={handleSave}>
            <label htmlFor="edit-description">Description</label>
            <input id="edit-description" type="text" required value={formData.description} onChange={(e)=>setFormData((c)=>({...c, description:e.target.value}))} disabled={!isAdmin} />
            <label htmlFor="edit-status">Status</label>
            <select id="edit-status" required value={formData.status} onChange={(e)=>setFormData((c)=>({...c, status:e.target.value}))}><option value="Open">Open</option><option value="In Progress">In Progress</option><option value="Pending">Pending</option><option value="Resolved">Resolved</option><option value="Closed">Closed</option></select>
            <label htmlFor="edit-priority">Priority</label>
            <select id="edit-priority" required value={formData.priority} onChange={(e)=>setFormData((c)=>({...c, priority:e.target.value}))} disabled={!isAdmin}><option value="Critical">Critical</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option></select>
            <label htmlFor="edit-group">Assigned Group</label>
            <input id="edit-group" type="text" required value={formData.assignedGroup} onChange={(e)=>setFormData((c)=>({...c, assignedGroup:e.target.value}))} disabled={!isAdmin} />
            <label htmlFor="edit-owner">Owner</label>
            <input id="edit-owner" type="text" required value={formData.Owner} onChange={(e)=>setFormData((c)=>({...c, Owner:e.target.value}))} disabled={!isAdmin} />
            <label htmlFor="edit-assigned-person">Assigned Person</label>
            <input id="edit-assigned-person" type="text" required value={formData.Assigned_Person} onChange={(e)=>setFormData((c)=>({...c, Assigned_Person:e.target.value}))} disabled={!isAdmin} />
            <div className="modal-actions"><button type="button" onClick={closeEditModal} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Save</button></div>
          </form>
        </div>
      </div>
    </div>
  );
}
