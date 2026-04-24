import bcrypt from 'bcryptjs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { pool, query } from '../src/db.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, '..', 'sql', 'schema.sql');
const seedPath = path.resolve(__dirname, '..', 'sql', 'seed.sql');

async function run() {
  const schemaSql = await readFile(schemaPath, 'utf8');
  const seedResetSql = await readFile(seedPath, 'utf8');

  await query(schemaSql);
  await query(seedResetSql);

  const adminHash = await bcrypt.hash('admin1234', 10);
  const operatorHash = await bcrypt.hash('operator1234', 10);
  const viewerHash = await bcrypt.hash('viewer1234', 10);

  const usersResult = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES
       ('Admin User', 'admin@nokia.com', $1, 'admin'),
       ('Operator', 'operator@nokia.com', $2, 'operator'),
       ('Viewer User', 'viewer@nokia.com', $3, 'viewer')
     RETURNING id, name`,
    [adminHash, operatorHash, viewerHash]
  );

  const userIdByName = Object.fromEntries(usersResult.rows.map((user) => [user.name, user.id]));

  await query(
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
    ) VALUES
      ('INC001301', 'Email delivery delayed for finance department', 'Open', 'High', 'Messaging Support', 'Email', '2026-04-10', 5, $1, $2),
      ('INC001302', 'VPN connection drops for remote sales employee', 'In Progress', 'Medium', 'Network Team', 'Access', '2026-04-11', 4, $2, $1),
      ('INC001303', 'Laptop fails to boot after security patch installation', 'Resolved', 'High', 'Desktop Support', 'Hardware', '2026-04-08', 7, $3, $2),
      ('INC001304', 'Office printer on floor 3 not responding to print jobs', 'Closed', 'Low', 'Field Support', 'Printer', '2026-04-09', 6, $1, $3),
      ('INC001305', 'CRM dashboard loading extremely slowly for support team', 'Open', 'Critical', 'Application Support', 'Application', '2026-04-14', 1, $2, $2),
      ('INC001306', 'Password reset requested by contractor account', 'Pending', 'Low', 'Service Desk', 'Account', '2026-04-15', 0, $3, $1),
      ('INC001307', 'Wi-Fi instability reported in conference room area', 'In Progress', 'Medium', 'Network Team', 'Network', '2026-04-12', 3, $1, $2),
      ('INC001308', 'User unable to access shared drive after permissions update', 'Open', 'High', 'Service Desk', 'Access', '2026-04-13', 2, $2, $3),
      ('INC001309', 'Mobile device enrollment failed for new employee', 'Resolved', 'Medium', 'Desktop Support', 'Mobile', '2026-04-07', 8, $1, $3),
      ('INC001310', 'Customer support portal returns 500 error on login', 'Open', 'Critical', 'Application Support', 'Web Portal', '2026-04-15', 0, $2, $1)`,
    [
      userIdByName['Admin User'],
      userIdByName['Operator'],
      userIdByName['Viewer User'],
    ]
  );

  console.log('Database seeded successfully.');
}

run()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
