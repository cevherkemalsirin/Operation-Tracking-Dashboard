import { query } from '../db.js';

export async function getUsers(req, res) {
  const result = await query(
    `SELECT id, name, email, role
     FROM users
     ORDER BY name ASC`
  );

  return res.json(result.rows);
}
