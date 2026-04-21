import { useMemo, useState } from 'react';
import '../styles/ticket-management.css';
import { generateTickets } from '../utils/ticketGeneration';
import { AUTH_ROLES, useAuth } from '../auth';

export default function TicketManagementPage() {
  const { role } = useAuth();
  const [allTickets, setAllTickets] = useState(() => generateTickets(30));
  const [filters, setFilters] = useState({ search: '', status: '', priority: '' });
  const [editingTicket, setEditingTicket] = useState(null);
  const [formData, setFormData] = useState({ title: '', status: 'open', priority: '1', customer: '' });

  const visibleTickets = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();
    return allTickets.filter((ticket) => {
      const matchesSearch =
        !searchTerm ||
        String(ticket.id).includes(searchTerm) ||
        ticket.title.toLowerCase().includes(searchTerm) ||
        ticket.customer.toLowerCase().includes(searchTerm);
      const matchesStatus = !filters.status || ticket.status === filters.status;
      const matchesPriority = !filters.priority || String(ticket.priority) === filters.priority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [allTickets, filters]);

  const stats = useMemo(() => ({
    total: allTickets.length,
    open: allTickets.filter((t) => t.status === 'open').length,
    progress: allTickets.filter((t) => t.status === 'in progress').length,
    done: allTickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length,
  }), [allTickets]);
  const canEditTickets = role === AUTH_ROLES.ADMIN || role === AUTH_ROLES.OPERATOR;

  function openEditModal(ticket) {
    if (!canEditTickets) return;
    setEditingTicket(ticket.id);
    setFormData({ title: ticket.title, status: ticket.status, priority: String(ticket.priority), customer: ticket.customer });
  }

  function closeEditModal() {
    setEditingTicket(null);
  }

  function handleSave(event) {
    event.preventDefault();
    if (!canEditTickets) return;
    if (!editingTicket || !formData.title.trim() || !formData.customer.trim()) return;
    setAllTickets((current) => current.map((ticket) => ticket.id === editingTicket ? { ...ticket, title: formData.title.trim(), status: formData.status, priority: Number(formData.priority), customer: formData.customer.trim() } : ticket));
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
              You are signed in as viewer. Ticket editing is restricted for this role.
            </section>
          )}
          <section className="stats-grid">
            <article className="stat-card"><p>Total Tickets</p><strong>{stats.total}</strong></article>
            <article className="stat-card"><p>Open</p><strong>{stats.open}</strong></article>
            <article className="stat-card"><p>In Progress</p><strong>{stats.progress}</strong></article>
            <article className="stat-card"><p>Resolved / Closed</p><strong>{stats.done}</strong></article>
          </section>

          <section className="filter-panel glass-panel">
            <input value={filters.search} onChange={(e)=>setFilters((c)=>({...c, search:e.target.value}))} type="text" placeholder="Search by ID, title, or customer" />
            <select value={filters.status} onChange={(e)=>setFilters((c)=>({...c, status:e.target.value}))}><option value="">All statuses</option><option value="open">Open</option><option value="in progress">In Progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option><option value="canceled">Canceled</option></select>
            <select value={filters.priority} onChange={(e)=>setFilters((c)=>({...c, priority:e.target.value}))}><option value="">All priorities</option><option value="1">Priority 1</option><option value="2">Priority 2</option><option value="3">Priority 3</option><option value="4">Priority 4</option><option value="5">Priority 5</option></select>
          </section>

          <section className="table-panel glass-panel">
            <table>
              <thead><tr><th>ID</th><th>Title</th><th>Status</th><th>Priority</th><th>Open Date</th><th>Customer</th><th>Action</th></tr></thead>
              <tbody>
                {visibleTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>{ticket.id}</td><td>{ticket.title}</td><td>{ticket.status}</td><td>{ticket.priority}</td><td>{ticket.openDate}</td><td>{ticket.customer}</td>
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
          </section>
        </main>

        <aside className="edge-panel edge-right"><div className="edge-pill">Live View</div><div className="edge-pill">Team Feed</div></aside>
      </div>

      <div className={`modal-overlay ${editingTicket ? 'active' : ''}`} aria-hidden={!editingTicket}>
        <div className="modal-card glass-panel" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
          <h2 id="edit-modal-title">Edit Ticket</h2>
          <form onSubmit={handleSave}>
            <label htmlFor="edit-title">Title</label>
            <input id="edit-title" type="text" required value={formData.title} onChange={(e)=>setFormData((c)=>({...c, title:e.target.value}))} />
            <label htmlFor="edit-status">Status</label>
            <select id="edit-status" required value={formData.status} onChange={(e)=>setFormData((c)=>({...c, status:e.target.value}))}><option value="open">Open</option><option value="in progress">In Progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option><option value="canceled">Canceled</option></select>
            <label htmlFor="edit-priority">Priority</label>
            <select id="edit-priority" required value={formData.priority} onChange={(e)=>setFormData((c)=>({...c, priority:e.target.value}))}><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select>
            <label htmlFor="edit-customer">Customer</label>
            <input id="edit-customer" type="text" required value={formData.customer} onChange={(e)=>setFormData((c)=>({...c, customer:e.target.value}))} />
            <div className="modal-actions"><button type="button" onClick={closeEditModal} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Save</button></div>
          </form>
        </div>
      </div>
    </div>
  );
}
