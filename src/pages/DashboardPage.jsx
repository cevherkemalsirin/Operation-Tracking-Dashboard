import { useEffect, useMemo, useState } from 'react';
import '../styles/dashboard.css';
import { useAuth } from '../auth';

function getStatusClass(status) {
  if (status === 'Open') return 'open';
  if (status === 'In Progress') return 'progress';
  if (status === 'Resolved') return 'resolved';
  if (status === 'Closed') return 'closed';
  return 'pending';
}

function getPriorityClass(priority) {
  if (priority === 'Critical') return 'dot-critical';
  if (priority === 'High') return 'dot-high';
  if (priority === 'Medium') return 'dot-medium';
  return 'dot-low';
}

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: 'All', priority: 'All', group: 'All', date: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTickets() {
      try {
        const response = await fetch('/tickets.json');
        if (!response.ok) throw new Error('Could not load tickets.json');
        const data = await response.json();
        setTickets(data);
      } catch (err) {
        setError('Failed to load ticket data from tickets.json.');
      }
    }
    loadTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const searchValue = filters.search.toLowerCase().trim();
      const matchesSearch =
        ticket.id.toLowerCase().includes(searchValue) ||
        ticket.description.toLowerCase().includes(searchValue);
      const matchesStatus = filters.status === 'All' || ticket.status === filters.status;
      const matchesPriority = filters.priority === 'All' || ticket.priority === filters.priority;
      const matchesGroup = filters.group === 'All' || ticket.assignedGroup === filters.group;
      const matchesDate = !filters.date || ticket.submitDate === filters.date;
      return matchesSearch && matchesStatus && matchesPriority && matchesGroup && matchesDate;
    });
  }, [tickets, filters]);

  const stats = useMemo(() => ({
    total: filteredTickets.length,
    open: filteredTickets.filter((ticket) => ticket.status === 'Open').length,
    critical: filteredTickets.filter((ticket) => ticket.priority === 'Critical').length,
    resolved: filteredTickets.filter((ticket) => ticket.status === 'Resolved' || ticket.status === 'Closed').length,
  }), [filteredTickets]);

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function resetFilters() {
    setFilters({ search: '', status: 'All', priority: 'All', group: 'All', date: '' });
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <section className="welcome">
          <div className="welcome-top">
            <div>
              <p className="welcome-header">Good Morning, {user?.name || 'User'} ({role})</p>
              <p className="welcome-sign">Nokia</p>
              <h1 className="welcome-title">Incident Management Console</h1>
              <p className="welcome-subtitle">A cleaner enterprise-style dashboard for monitoring incidents, filtering operational queues, and reviewing ticket ownership in one place.</p>
            </div>
            <div className="country-box"><div className="country-label">Country</div><div className="country-value">Romania</div></div>
          </div>
        </section>

        <section className="panel">
          <div className="section-top">
            <div>
              <h2 className="section-title">Filters</h2>
              <p className="section-note">Filter the ticket list by status, priority, group, text, and date.</p>
            </div>
            <button className="btn btn-reset" onClick={resetFilters}>Reset</button>
          </div>
          <div className="filters">
            <div className="field"><label htmlFor="searchInput">Search</label><input id="searchInput" type="text" placeholder="Search by ID or description" value={filters.search} onChange={(e)=>updateFilter('search', e.target.value)} /></div>
            <div className="field"><label htmlFor="statusFilter">Status</label><select id="statusFilter" value={filters.status} onChange={(e)=>updateFilter('status', e.target.value)}><option value="All">All</option><option value="Open">Open</option><option value="In Progress">In Progress</option><option value="Pending">Pending</option><option value="Resolved">Resolved</option><option value="Closed">Closed</option></select></div>
            <div className="field"><label htmlFor="priorityFilter">Priority</label><select id="priorityFilter" value={filters.priority} onChange={(e)=>updateFilter('priority', e.target.value)}><option value="All">All</option><option value="Critical">Critical</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option></select></div>
            <div className="field"><label htmlFor="groupFilter">Assigned Group</label><select id="groupFilter" value={filters.group} onChange={(e)=>updateFilter('group', e.target.value)}><option value="All">All</option><option value="Messaging Support">Messaging Support</option><option value="Network Team">Network Team</option><option value="Desktop Support">Desktop Support</option><option value="Field Support">Field Support</option><option value="Application Support">Application Support</option><option value="Service Desk">Service Desk</option></select></div>
            <div className="field"><label htmlFor="dateFilter">Submit Date</label><input id="dateFilter" type="date" value={filters.date} onChange={(e)=>updateFilter('date', e.target.value)} /></div>
          </div>
        </section>

        <section className="panel">
          <div className="section-top">
            <div>
              <h2 className="section-title">Incidents</h2>
              <p className="section-note">Data loaded from tickets.json.</p>
            </div>
            <div className="section-topright"><section className="card-grid"><div className="card"><h3>Total Tickets</h3><p>{stats.total}</p></div><div className="card"><h3>Open Tickets</h3><p>{stats.open}</p></div><div className="card"><h3>Critical Tickets</h3><p>{stats.critical}</p></div><div className="card"><h3>Resolved / Closed</h3><p>{stats.resolved}</p></div></section></div>
            <div className="btn-container"><button className="btn btn-export" type="button">Import</button><button className="btn btn-export" type="button">Export</button></div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Incident</th><th>Description</th><th>Status</th><th>Priority</th><th>Assigned Group</th><th>Service Type</th><th>Submit Date</th><th>Aging</th></tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="ticket-id">{ticket.id}</td>
                    <td className="description-cell">{ticket.description}</td>
                    <td><span className={`status-badge ${getStatusClass(ticket.status)}`}>{ticket.status}</span></td>
                    <td><span className={`priority-pill ${getPriorityClass(ticket.priority)}`}><span className={`priority-dot ${getPriorityClass(ticket.priority)}`}></span>{ticket.priority}</span></td>
                    <td>{ticket.assignedGroup}</td>
                    <td><span className="service-chip">{ticket.serviceType}</span></td>
                    <td>{ticket.submitDate}</td>
                    <td className="aging-cell">{ticket.aging} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(error || filteredTickets.length === 0) && <div className="empty-state">{error || 'No tickets match the selected filters.'}</div>}
        </section>
      </div>
    </div>
  );
}
