import { useEffect, useMemo, useState } from 'react';
import { fetchAdminUsers } from '../../utils/admin';

const ROLE_OPTIONS = ['admin', 'operator', 'viewer'];
const STATUS_OPTIONS = ['active', 'disabled', 'pending'];

function formatLastLogin(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    async function load() {
      try {
        setError('');
        setLoading(true);
        const data = await fetchAdminUsers();
        setUsers(data);
      } catch (err) {
        setError(err.message || 'Failed to load users.');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch = !term
        || u.name.toLowerCase().includes(term)
        || u.email.toLowerCase().includes(term);
      const matchesRole = roleFilter === 'All' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  return (
    <div className="admin-users">
      <div className="admin-users-toolbar">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search"
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="All">All roles</option>
          {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="admin-count">{filteredUsers.length} of {users.length}</span>
      </div>

      {error && <p className="admin-error" role="alert">{error}</p>}

      {loading ? (
        <p className="admin-placeholder-text">Loading users…</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Teams</th>
                <th>Last login</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-empty">No users match these filters.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`admin-pill role-${u.role}`}>{u.role}</span></td>
                    <td><span className={`admin-pill status-${u.status}`}>{u.status}</span></td>
                    <td>
                      {u.teams.length === 0 ? (
                        <span className="admin-muted">—</span>
                      ) : (
                        <div className="admin-team-chips">
                          {u.teams.map((t) => (
                            <span key={t.id} className="admin-chip">{t.name}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>{formatLastLogin(u.lastLoginAt)}</td>
                    <td>{u.createdAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
