import { query } from '../db.js';

// "Effective" status surfaced to the admin UI:
//   - 'disabled'  if users.status = 'disabled'
//   - 'pending'   if email_verified = false (account exists, hasn't verified yet)
//   - 'active'    otherwise
// One column on the DB, three states in the UI.
function deriveStatus(row) {
  if (row.status === 'disabled') return 'disabled';
  if (!row.email_verified) return 'pending';
  return 'active';
}

function mapUserRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: deriveStatus(row),
    emailVerified: row.email_verified,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
    teams: row.teams || [],
  };
}

export async function listUsers(req, res) {
  // One row per user with team memberships aggregated into a JSON array.
  // FILTER drops the synthetic NULL row produced by LEFT JOIN when the
  // user has no team memberships.
  const result = await query(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.role,
       u.status,
       u.email_verified,
       TO_CHAR(u.created_at, 'YYYY-MM-DD') AS created_at,
       u.last_login_at,
       COALESCE(
         json_agg(
           json_build_object('id', t.id, 'name', t.name)
           ORDER BY t.name
         ) FILTER (WHERE t.id IS NOT NULL),
         '[]'::json
       ) AS teams
     FROM users u
     LEFT JOIN team_members tm ON tm.user_id = u.id
     LEFT JOIN teams t ON t.id = tm.team_id
     GROUP BY u.id
     ORDER BY u.name ASC`
  );

  return res.json(result.rows.map(mapUserRow));
}
