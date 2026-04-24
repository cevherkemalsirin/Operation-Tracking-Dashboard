import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/dashboard.css';
import { useAuth } from '../auth';
import { fetchTickets, getDashboardTicketsForRole } from '../utils/tickets';

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

function getPriorityTone(priority) {
  return `priority-${priority.toLowerCase()}`;
}

function getMaxCount(items) {
  return Math.max(...items.map((item) => item.count), 1);
}

export default function DashboardPage() {
  const { role } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: 'All', priority: 'All', group: 'All', date: '' });
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [graphOpen, setGraphOpen] = useState(false);
  const [activeGraph, setActiveGraph] = useState('service');

  useEffect(() => {
    async function loadTickets() {
      try {
        setError('');
        const data = await fetchTickets();
        setTickets(getDashboardTicketsForRole(data, role));
      } catch (err) {
        setError('Failed to load ticket data from the backend API.');
        setTickets([]);
      }
    }
    loadTickets();
  }, [role]);

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

  const priorityStats = useMemo(() => {
    const priorities = ['Critical', 'High', 'Medium', 'Low'];
    const counts = priorities.map((priority) => ({
      priority,
      count: filteredTickets.filter((ticket) => ticket.priority === priority).length,
    }));
    const max = Math.max(...counts.map((item) => item.count), 1);

    return counts.map((item) => ({
      ...item,
      percentage: Math.round((item.count / max) * 100),
    }));
  }, [filteredTickets]);

  const serviceStats = useMemo(() => {
    const counts = filteredTickets.reduce((current, ticket) => {
      current[ticket.serviceType] = (current[ticket.serviceType] || 0) + 1;
      return current;
    }, {});
    const items = Object.entries(counts).map(([service, count]) => ({ service, count }));
    const max = getMaxCount(items);

    return items
      .sort((a, b) => b.count - a.count)
      .map((item) => ({ ...item, percentage: Math.round((item.count / max) * 100) }));
  }, [filteredTickets]);

  const statusStats = useMemo(() => {
    const statuses = ['Open', 'In Progress', 'Pending', 'Resolved', 'Closed'];
    const items = statuses.map((status) => ({
      status,
      count: filteredTickets.filter((ticket) => ticket.status === status).length,
    }));
    const max = getMaxCount(items);

    return items.map((item) => ({ ...item, percentage: Math.round((item.count / max) * 100) }));
  }, [filteredTickets]);

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function resetFilters() {
    setFilters({ search: '', status: 'All', priority: 'All', group: 'All', date: '' });
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <div className="brand-block">
            <img src="/assets/login-welcome/Images/nokia - Copy.svg" className="brand-logo" alt="Nokia" />
            <p>Operation Tracking</p>
          </div>

          <nav className="dashboard-nav" aria-label="Dashboard navigation">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/welcome">Welcome</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/tickets">Ticket Management</NavLink>
          </nav>

          <div className="sidebar-status">
            <span className="status-light"></span>
            <div>
              <strong>Live Console</strong>
              <p>{tickets.length} tickets loaded</p>
            </div>
          </div>
        </aside>

        <main className="dashboard-main">
          <section className="hero-panel">
            <div className="hero-copy">
              <p className="welcome-header">Good Morning, Cevher Kemal Sirin</p>
              <p className="welcome-sign">Nokia</p>
              <h1 className="welcome-title">Incident Management Console</h1>
              <p className="welcome-subtitle">Operational incidents, ownership, and priority pressure in one focused workspace.</p>
            </div>

            <div className="hero-actions">
              <div className="country-box">
                <div className="country-label">Country</div>
                <div className="country-value">Romania</div>
              </div>
            </div>
          </section>

          <section className={`panel collapsible-panel ${filtersOpen ? 'is-open' : ''}`} aria-hidden={!filtersOpen}>
            <div className="section-top">
              <div>
                <h2 className="section-title">Filters</h2>
                <p className="section-note">Filter the ticket list by status, priority, group, text, and date.</p>
              </div>
              <button className="btn btn-reset" onClick={resetFilters}>Reset</button>
            </div>
            <div className="filters">
              <div className="field"><label htmlFor="statusFilter">Status</label><select id="statusFilter" value={filters.status} onChange={(e)=>updateFilter('status', e.target.value)}><option value="All">All</option><option value="Open">Open</option><option value="In Progress">In Progress</option><option value="Pending">Pending</option><option value="Resolved">Resolved</option><option value="Closed">Closed</option></select></div>
              <div className="field"><label htmlFor="priorityFilter">Priority</label><select id="priorityFilter" value={filters.priority} onChange={(e)=>updateFilter('priority', e.target.value)}><option value="All">All</option><option value="Critical">Critical</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option></select></div>
              <div className="field"><label htmlFor="groupFilter">Assigned Group</label><select id="groupFilter" value={filters.group} onChange={(e)=>updateFilter('group', e.target.value)}><option value="All">All</option><option value="Messaging Support">Messaging Support</option><option value="Network Team">Network Team</option><option value="Desktop Support">Desktop Support</option><option value="Field Support">Field Support</option><option value="Application Support">Application Support</option><option value="Service Desk">Service Desk</option></select></div>
              <div className="field"><label htmlFor="dateFilter">Submit Date</label><input id="dateFilter" type="date" value={filters.date} onChange={(e)=>updateFilter('date', e.target.value)} /></div>
            </div>
          </section>

          <section className="panel incidents-panel">
            <div className="section-top incidents-top">
              <div className="incident-title-group">
                <h2 className="section-title">Incidents</h2>
                <p className="section-note">Data loaded from tickets.json.</p>
                <div className="toolbar-left">
                  <button className="btn btn-toggle" type="button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((current) => !current)}>
                    Filters
                  </button>
                  <button className="btn btn-toggle" type="button" aria-expanded={graphOpen} onClick={() => setGraphOpen((current) => !current)}>
                    Graphs
                  </button>
                </div>
              </div>
              {!graphOpen && (
                <label className="toolbar-search" htmlFor="toolbarSearch">
                  <span>Search</span>
                  <input id="toolbarSearch" type="text" placeholder="Search by ID or description" value={filters.search} onChange={(e)=>updateFilter('search', e.target.value)} />
                </label>
              )}
              <div className="btn-container"><button className="btn btn-export" type="button">Import</button><button className="btn btn-export" type="button">Export</button></div>
            </div>

            {graphOpen ? (
              <div className="graph-stage" aria-label="Graphs">
                <div className="graph-heading">
                  <div>
                    <h3>Graphs</h3>
                    <p>Different views of the current queue.</p>
                  </div>
                  <div className="graph-tabs" aria-label="Graph type">
                    <button className={`graph-tab ${activeGraph === 'service' ? 'active' : ''}`} type="button" onClick={() => setActiveGraph('service')}>Service Type</button>
                    <button className={`graph-tab ${activeGraph === 'status' ? 'active' : ''}`} type="button" onClick={() => setActiveGraph('status')}>Status</button>
                    <button className={`graph-tab ${activeGraph === 'priority' ? 'active' : ''}`} type="button" onClick={() => setActiveGraph('priority')}>Priority</button>
                  </div>
                </div>

                {activeGraph === 'service' && (
                  <div className="service-chart">
                    {serviceStats.map((item) => (
                      <div className="service-column" key={item.service}>
                        <div className="service-bar-wrap">
                          <div className="service-bar" style={{ height: `${item.percentage}%` }}>
                            <strong>{item.count}</strong>
                          </div>
                        </div>
                        <span>{item.service}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeGraph === 'status' && (
                  <div className="status-chart">
                    {statusStats.map((item, index) => (
                      <div className={`status-lane ${getStatusClass(item.status)}`} key={item.status}>
                        <span className="status-index">{String(index + 1).padStart(2, '0')}</span>
                        <div className="status-line">
                          <span style={{ width: `${item.percentage}%` }}></span>
                        </div>
                        <strong>{item.status}</strong>
                        <em>{item.count}</em>
                      </div>
                    ))}
                  </div>
                )}

                {activeGraph === 'priority' && (
                  <div className="priority-chart">
                    {priorityStats.map((item) => (
                      <div className={`chart-row ${getPriorityTone(item.priority)}`} key={item.priority}>
                        <div className="chart-label">
                          <span>{item.priority}</span>
                          <strong>{item.count}</strong>
                        </div>
                        <div className="chart-track">
                          <div className="chart-fill" style={{ width: `${item.percentage}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr><th>Incident</th><th>Description</th><th>Status</th><th>Priority</th><th>Assigned Group</th><th>Owner</th><th>Assigned Person</th><th>Service Type</th><th>Submit Date</th><th>Aging</th></tr>
                    </thead>
                    <tbody>
                      {filteredTickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td className="ticket-id">{ticket.id}</td>
                          <td className="description-cell">{ticket.description}</td>
                          <td><span className={`status-badge ${getStatusClass(ticket.status)}`}>{ticket.status}</span></td>
                          <td><span className={`priority-pill ${getPriorityClass(ticket.priority)}`}><span className={`priority-dot ${getPriorityClass(ticket.priority)}`}></span>{ticket.priority}</span></td>
                          <td>{ticket.assignedGroup}</td>
                          <td>{ticket.Owner}</td>
                          <td>{ticket.Assigned_Person}</td>
                          <td><span className="service-chip">{ticket.serviceType}</span></td>
                          <td>{ticket.submitDate}</td>
                          <td className="aging-cell">{ticket.aging} days</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {(error || filteredTickets.length === 0) && <div className="empty-state">{error || 'No tickets match the selected filters.'}</div>}
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
