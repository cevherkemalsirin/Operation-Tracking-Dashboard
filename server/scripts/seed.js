// Seed script. Loads demo users + demo tickets into the database.
//
// Schema is no longer this script's responsibility — it lives in the
// migrations/ folder and is applied via `npm run migrate:up`. The
// `npm run seed` script in package.json runs migrations first, then
// invokes this file.

import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { pool, query } from '../src/db.js';
import { calculateSlaDeadline, getDefaultSlaForPriority } from '../src/utils/sla.js';

dotenv.config();

const seedNow = new Date('2026-05-10T10:00:00+03:00');

const demoUsers = [
  { key: 'admin', name: 'Admin User', email: 'admin@nokia.com', password: 'admin1234', role: 'admin' },
  { key: 'cevher', name: 'Cevher Kemal Sirin', email: 'cevher@nokia.com', password: 'cevher1234', role: 'operator' },
  { key: 'vlad', name: 'Vlad Popescu', email: 'vlad@nokia.com', password: 'vlad1234', role: 'operator' },
  { key: 'melika', name: 'Melika Javidfar', email: 'melika@nokia.com', password: 'melika1234', role: 'operator' },
  { key: 'alex', name: 'Alex Ionescu', email: 'alex@nokia.com', password: 'alex1234', role: 'operator' },
  { key: 'sara', name: 'Sara Dumitrescu', email: 'sara@nokia.com', password: 'sara1234', role: 'operator' },
  { key: 'viewer', name: 'Viewer User', email: 'viewer@example.com', password: 'viewer1234', role: 'viewer' },
];

// Teams that must exist for the demo data to be consistent with ticket
// assigned_group values. Keep names exactly in sync with the seeding
// done by the migration `1700000002000_add-teams.js` — backfill relies
// on exact-name match.
const demoTeams = [
  { name: 'Application Support', department: 'Engineering' },
  { name: 'Database Team', department: 'Engineering' },
  { name: 'Desktop Support', department: 'IT Operations' },
  { name: 'Field Support', department: 'IT Operations' },
  { name: 'Identity Team', department: 'Security' },
  { name: 'Messaging Support', department: 'IT Operations' },
  { name: 'Network Team', department: 'Infrastructure' },
  { name: 'Service Desk', department: 'IT Operations' },
];

// Which operators belong to which teams. A user can be on multiple teams.
// Viewer is intentionally not on any team.
const demoTeamMemberships = {
  cevher: ['Application Support', 'Identity Team', 'Messaging Support'],
  vlad:   ['Network Team', 'Database Team'],
  melika: ['Desktop Support', 'Messaging Support'],
  alex:   ['Service Desk', 'Field Support'],
  sara:   ['Service Desk', 'Field Support'],
};

const infrastructureSites = [
  ['EU-RO-TM-001', 'Romania', 'RO', 'Timisoara', 'TM', 45.7489, 21.2087, '5G Macro Tower', 'Active', 'Urban macro site covering central Timisoara'],
  ['EU-RO-TM-002', 'Romania', 'RO', 'Timisoara', 'TM', 45.7640, 21.2285, 'Edge Router Hub', 'Maintenance', 'Regional transport aggregation point'],
  ['EU-RO-CJ-001', 'Romania', 'RO', 'Cluj', 'CJ', 46.7712, 23.6236, '5G Rooftop Antenna', 'Active', 'Rooftop radio site near Cluj business district'],
  ['EU-RO-CJ-002', 'Romania', 'RO', 'Cluj', 'CJ', 46.7550, 23.5890, 'Core Switch Site', 'Active', 'Metro switching equipment location'],
  ['EU-RO-BU-001', 'Romania', 'RO', 'Bucharest', 'BU', 44.4268, 26.1025, '5G Macro Tower', 'Active', 'Capital city macro radio site'],
  ['EU-RO-BU-002', 'Romania', 'RO', 'Bucharest', 'BU', 44.4500, 26.0900, 'Aggregation Hub', 'Maintenance', 'High-capacity metro aggregation node'],
  ['EU-RO-BU-003', 'Romania', 'RO', 'Bucharest', 'BU', 44.4100, 26.1350, '5G Small Cell Cluster', 'Active', 'Dense urban small cell deployment'],
  ['EU-DE-BE-001', 'Germany', 'DE', 'Berlin', 'BE', 52.5200, 13.4050, '5G Macro Tower', 'Active', 'Berlin central macro coverage site'],
  ['EU-DE-BE-002', 'Germany', 'DE', 'Berlin', 'BE', 52.5000, 13.3500, 'Fiber Backhaul Node', 'Active', 'Backhaul transport node'],
  ['EU-DE-MU-001', 'Germany', 'DE', 'Munich', 'MU', 48.1351, 11.5820, '5G Rooftop Antenna', 'Maintenance', 'Munich business district rooftop site'],
  ['EU-DE-HA-001', 'Germany', 'DE', 'Hamburg', 'HA', 53.5511, 9.9937, 'Edge Router Hub', 'Active', 'Northern regional edge hub'],
  ['EU-FR-PA-001', 'France', 'FR', 'Paris', 'PA', 48.8566, 2.3522, '5G Macro Tower', 'Active', 'Paris central radio site'],
  ['EU-FR-PA-002', 'France', 'FR', 'Paris', 'PA', 48.8800, 2.3300, 'Core Switch Site', 'Active', 'Paris metro switching site'],
  ['EU-FR-LY-001', 'France', 'FR', 'Lyon', 'LY', 45.7640, 4.8357, '5G Rooftop Antenna', 'Maintenance', 'Lyon rooftop radio site'],
  ['EU-FR-MA-001', 'France', 'FR', 'Marseille', 'MA', 43.2965, 5.3698, 'Aggregation Hub', 'Active', 'Mediterranean aggregation location'],
  ['EU-IT-RM-001', 'Italy', 'IT', 'Rome', 'RM', 41.9028, 12.4964, '5G Macro Tower', 'Active', 'Rome central macro site'],
  ['EU-IT-MI-001', 'Italy', 'IT', 'Milan', 'MI', 45.4642, 9.1900, 'Edge Router Hub', 'Active', 'Milan edge routing point'],
  ['EU-IT-MI-002', 'Italy', 'IT', 'Milan', 'MI', 45.4800, 9.2100, '5G Small Cell Cluster', 'Maintenance', 'Dense city center small cell cluster'],
  ['EU-IT-NA-001', 'Italy', 'IT', 'Naples', 'NA', 40.8518, 14.2681, 'Fiber Backhaul Node', 'Active', 'Naples transport backhaul site'],
  ['EU-ES-MA-001', 'Spain', 'ES', 'Madrid', 'MA', 40.4168, -3.7038, '5G Macro Tower', 'Active', 'Madrid macro radio site'],
  ['EU-ES-BC-001', 'Spain', 'ES', 'Barcelona', 'BC', 41.3874, 2.1686, '5G Rooftop Antenna', 'Maintenance', 'Barcelona rooftop radio location'],
  ['EU-ES-BC-002', 'Spain', 'ES', 'Barcelona', 'BC', 41.4050, 2.1900, 'Aggregation Hub', 'Active', 'Barcelona metro aggregation site'],
  ['EU-ES-VA-001', 'Spain', 'ES', 'Valencia', 'VA', 39.4699, -0.3763, 'Edge Router Hub', 'Active', 'Valencia regional edge site'],
  ['EU-NL-AM-001', 'Netherlands', 'NL', 'Amsterdam', 'AM', 52.3676, 4.9041, 'Core Switch Site', 'Active', 'Amsterdam core switching location'],
  ['EU-NL-RT-001', 'Netherlands', 'NL', 'Rotterdam', 'RT', 51.9244, 4.4777, '5G Macro Tower', 'Active', 'Rotterdam macro radio site'],
  ['EU-NL-EH-001', 'Netherlands', 'NL', 'Eindhoven', 'EH', 51.4416, 5.4697, 'Fiber Backhaul Node', 'Maintenance', 'Eindhoven backhaul node'],
  ['EU-BE-BR-001', 'Belgium', 'BE', 'Brussels', 'BR', 50.8503, 4.3517, '5G Macro Tower', 'Active', 'Brussels central macro coverage'],
  ['EU-BE-AN-001', 'Belgium', 'BE', 'Antwerp', 'AN', 51.2194, 4.4025, 'Edge Router Hub', 'Active', 'Antwerp edge routing site'],
  ['EU-BE-GH-001', 'Belgium', 'BE', 'Ghent', 'GH', 51.0543, 3.7174, '5G Rooftop Antenna', 'Maintenance', 'Ghent rooftop antenna site'],
  ['EU-PL-WA-001', 'Poland', 'PL', 'Warsaw', 'WA', 52.2297, 21.0122, '5G Macro Tower', 'Active', 'Warsaw macro radio site'],
  ['EU-PL-WA-002', 'Poland', 'PL', 'Warsaw', 'WA', 52.2500, 21.0300, 'Aggregation Hub', 'Active', 'Warsaw aggregation node'],
  ['EU-PL-KR-001', 'Poland', 'PL', 'Krakow', 'KR', 50.0647, 19.9450, '5G Rooftop Antenna', 'Maintenance', 'Krakow rooftop coverage site'],
  ['EU-PL-GD-001', 'Poland', 'PL', 'Gdansk', 'GD', 54.3520, 18.6466, 'Fiber Backhaul Node', 'Active', 'Gdansk backhaul transport site'],
  ['EU-UK-LO-001', 'United Kingdom', 'UK', 'London', 'LO', 51.5072, -0.1276, '5G Macro Tower', 'Active', 'London macro radio location'],
  ['EU-UK-LO-002', 'United Kingdom', 'UK', 'London', 'LO', 51.5200, -0.1000, 'Core Switch Site', 'Active', 'London core switching site'],
  ['EU-UK-MA-001', 'United Kingdom', 'UK', 'Manchester', 'MA', 53.4808, -2.2426, 'Edge Router Hub', 'Maintenance', 'Manchester edge router site'],
  ['EU-UK-BI-001', 'United Kingdom', 'UK', 'Birmingham', 'BI', 52.4862, -1.8904, '5G Rooftop Antenna', 'Active', 'Birmingham rooftop radio site'],
];

const baseTicketTemplates = [
  ['Email delivery delayed for finance department', 'Open', 'High', 'Messaging Support', 'Email', 'Nokia', 'Infrastructure', 'Messaging', 'Exchange', 'Incident', 'cevher', 'vlad', '2026-05-10T08:30:00+03:00'],
  ['VPN connection drops for remote sales employee', 'In Progress', 'Medium', 'Network Team', 'Access', 'Nokia', 'Network', 'Remote Access', 'VPN', 'Connectivity', 'vlad', 'cevher', '2026-05-09T14:00:00+03:00'],
  ['Laptop fails to boot after security patch installation', 'Resolved', 'High', 'Desktop Support', 'Hardware', 'Nokia', 'Workplace', 'Endpoint', 'Laptop', 'Hardware Issue', 'melika', 'cevher', '2026-05-05T09:30:00+03:00'],
  ['Office printer on floor 3 not responding to print jobs', 'Closed', 'Low', 'Field Support', 'Printer', 'Nokia', 'Workplace', 'Print Services', 'Printer', 'Service Restoration', 'admin', 'sara', '2026-05-02T11:15:00+03:00'],
  ['CRM dashboard loading extremely slowly for support team', 'Open', 'Critical', 'Application Support', 'Application', 'Nokia', 'Application', 'Business Systems', 'CRM', 'Performance', 'cevher', 'cevher', '2026-05-10T06:15:00+03:00'],
  ['Password reset requested by contractor account', 'Pending', 'Low', 'Service Desk', 'Account', 'Nokia', 'Identity', 'Account Services', 'Password', 'Request', 'sara', 'alex', '2026-05-08T13:20:00+03:00'],
  ['Wi-Fi instability reported in conference room area', 'In Progress', 'Medium', 'Network Team', 'Network', 'Nokia', 'Network', 'Wireless', 'Wi-Fi', 'Connectivity', 'vlad', 'melika', '2026-05-07T10:10:00+03:00'],
  ['Shared drive access missing after permission update', 'Open', 'High', 'Service Desk', 'Access', 'Nokia', 'Storage', 'File Services', 'Shared Drive', 'Access Issue', 'alex', 'cevher', '2026-05-09T15:45:00+03:00'],
  ['Mobile device enrollment failed for new employee', 'Resolved', 'Medium', 'Desktop Support', 'Mobile', 'Nokia', 'Workplace', 'Mobile Services', 'Enrollment', 'Device Setup', 'cevher', 'sara', '2026-05-01T16:00:00+03:00'],
  ['Customer support portal returns 500 error on login', 'Open', 'Critical', 'Application Support', 'Web Portal', 'Nokia', 'Application', 'Web Services', 'Portal', 'Application Error', 'vlad', 'alex', '2026-05-10T09:00:00+03:00'],
  ['Teams calls disconnect for Romania office users', 'Open', 'Critical', 'Messaging Support', 'Collaboration', 'Nokia', 'Workplace', 'Collaboration', 'Teams', 'Incident', 'melika', 'vlad', '2026-05-10T03:20:00+03:00'],
  ['SAP report export freezes for operations team', 'In Progress', 'High', 'Application Support', 'Application', 'Nokia', 'Application', 'ERP', 'SAP', 'Performance', 'cevher', 'melika', '2026-05-09T08:40:00+03:00'],
  ['Badge reader offline at main entrance', 'Pending', 'Medium', 'Field Support', 'Security', 'Nokia', 'Facilities', 'Physical Access', 'Badge Reader', 'Hardware Issue', 'admin', 'alex', '2026-05-08T09:10:00+03:00'],
  ['Mailbox quota exceeded for legal department user', 'Closed', 'Low', 'Messaging Support', 'Email', 'Nokia', 'Infrastructure', 'Messaging', 'Mailbox', 'Request', 'sara', 'cevher', '2026-04-30T12:30:00+03:00'],
  ['Monitoring alert for database CPU pressure', 'Open', 'Critical', 'Database Team', 'Database', 'Nokia', 'Infrastructure', 'Database', 'PostgreSQL', 'Capacity', 'vlad', 'vlad', '2026-05-10T07:05:00+03:00'],
  ['New starter account missing application groups', 'Open', 'Medium', 'Identity Team', 'Account', 'Nokia', 'Identity', 'Access Management', 'Groups', 'Access Request', 'cevher', 'sara', '2026-05-07T13:00:00+03:00'],
  ['Service desk phone queue reporting wrong status', 'Resolved', 'High', 'Service Desk', 'Telephony', 'Nokia', 'Workplace', 'Voice Services', 'Queue', 'Configuration', 'alex', 'melika', '2026-05-04T10:00:00+03:00'],
  ['Azure sync warning for user directory', 'In Progress', 'Medium', 'Identity Team', 'Identity', 'Nokia', 'Identity', 'Directory Services', 'Azure AD', 'Synchronization', 'melika', 'cevher', '2026-05-06T14:45:00+03:00'],
  ['Network latency between Bucharest and Timisoara', 'Open', 'High', 'Network Team', 'Network', 'Nokia', 'Network', 'WAN', 'MPLS', 'Performance', 'vlad', 'alex', '2026-05-09T11:25:00+03:00'],
  ['Application certificate renewal required', 'Pending', 'Medium', 'Application Support', 'Certificate', 'Nokia', 'Security', 'Certificates', 'TLS', 'Maintenance', 'admin', 'cevher', '2026-05-08T10:30:00+03:00'],
  ['Printer toner warning not clearing after replacement', 'Closed', 'Low', 'Field Support', 'Printer', 'Nokia', 'Workplace', 'Print Services', 'Consumables', 'Service Restoration', 'sara', 'sara', '2026-04-29T15:20:00+03:00'],
  ['Data warehouse refresh missed morning schedule', 'Resolved', 'Critical', 'Database Team', 'Database', 'Nokia', 'Application', 'Analytics', 'Data Warehouse', 'Batch Failure', 'cevher', 'vlad', '2026-05-03T06:45:00+03:00'],
  ['User cannot approve purchase order in ERP', 'Open', 'Medium', 'Application Support', 'Application', 'Nokia', 'Application', 'ERP', 'Approval Workflow', 'Access Issue', 'melika', 'alex', '2026-05-07T15:30:00+03:00'],
  ['Firewall rule request awaiting approval', 'Pending', 'Low', 'Network Team', 'Security', 'Nokia', 'Security', 'Firewall', 'Rule Change', 'Request', 'vlad', 'melika', '2026-05-06T09:45:00+03:00'],
  ['Conference room display shows no signal', 'Open', 'Low', 'Field Support', 'Hardware', 'Nokia', 'Workplace', 'Meeting Room', 'Display', 'Hardware Issue', 'alex', 'sara', '2026-05-09T16:10:00+03:00'],
  ['Endpoint antivirus update failed on batch of laptops', 'In Progress', 'High', 'Desktop Support', 'Security', 'Nokia', 'Security', 'Endpoint Protection', 'Antivirus', 'Update Failure', 'sara', 'cevher', '2026-05-09T07:50:00+03:00'],
  ['API gateway timeout for partner integration', 'Open', 'Critical', 'Application Support', 'API', 'Nokia', 'Application', 'Integration', 'Gateway', 'Application Error', 'cevher', 'melika', '2026-05-10T04:50:00+03:00'],
  ['User profile corrupted after Windows update', 'Resolved', 'Medium', 'Desktop Support', 'Desktop', 'Nokia', 'Workplace', 'Endpoint', 'Windows Profile', 'Incident', 'alex', 'vlad', '2026-05-01T09:20:00+03:00'],
  ['Backup job completed with warnings', 'Open', 'Medium', 'Database Team', 'Backup', 'Nokia', 'Infrastructure', 'Backup Services', 'Veeam', 'Warning', 'admin', 'vlad', '2026-05-08T18:00:00+03:00'],
  ['Distribution list membership update requested', 'Closed', 'Low', 'Messaging Support', 'Email', 'Nokia', 'Identity', 'Groups', 'Distribution List', 'Request', 'melika', 'cevher', '2026-04-28T10:40:00+03:00'],
];

const generatedDescriptions = [
  'Application response time degradation reported by operations users',
  'Mailbox synchronization issue affecting mobile clients',
  'Network packet loss detected between office locations',
  'User access request blocked by missing approval group',
  'Database maintenance job completed with validation warnings',
  'Endpoint patch installation needs follow-up verification',
  'VPN authentication failure reported by remote employee',
  'Service portal request stuck in pending state',
  'Shared drive permission mismatch after group change',
  'Monitoring alert triggered for service availability',
];

const generatedCatalog = [
  ['Application Support', 'Application', 'Nokia', 'Application', 'Business Systems', 'Operations Portal', 'Performance'],
  ['Messaging Support', 'Email', 'Nokia', 'Infrastructure', 'Messaging', 'Exchange', 'Incident'],
  ['Network Team', 'Network', 'Nokia', 'Network', 'WAN', 'MPLS', 'Connectivity'],
  ['Identity Team', 'Account', 'Nokia', 'Identity', 'Access Management', 'Groups', 'Access Request'],
  ['Database Team', 'Database', 'Nokia', 'Infrastructure', 'Database', 'PostgreSQL', 'Maintenance'],
  ['Desktop Support', 'Desktop', 'Nokia', 'Workplace', 'Endpoint', 'Windows', 'Update Failure'],
  ['Service Desk', 'Access', 'Nokia', 'Storage', 'File Services', 'Shared Drive', 'Access Issue'],
  ['Field Support', 'Hardware', 'Nokia', 'Workplace', 'Meeting Room', 'Display', 'Hardware Issue'],
];

const generatedPriorities = ['Low', 'Medium', 'Medium', 'High', 'Critical', 'High', 'Medium', 'Low'];
const generatedOwners = ['cevher', 'vlad', 'melika', 'alex', 'sara', 'admin'];
const generatedAssignees = ['vlad', 'cevher', 'alex', 'melika', 'sara', 'cevher'];
const generatedWeeklyCounts = {
  1: 4,
  2: 9,
  3: 3,
  4: 7,
  5: 2,
  6: 10,
  7: 5,
  8: 8,
  9: 1,
  10: 6,
  11: 10,
  12: 4,
  13: 7,
  14: 2,
  15: 9,
  16: 5,
  17: 8,
};

function getGeneratedStatus(week, slot, count) {
  if (count === 1) return week % 3 === 0 ? 'Open' : 'Resolved';
  if (slot === count - 1 && week % 4 === 0) return 'Open';
  if (slot === count - 1 && week % 5 === 0) return 'Pending';
  if (slot === count - 2 && week % 3 === 0) return 'In Progress';
  if (slot === 1 || (slot === 4 && count > 6)) return 'Closed';
  return 'Resolved';
}

function buildGeneratedTicketTemplates() {
  const templates = [];
  const firstWeekDate = new Date('2026-01-01T09:00:00+03:00');

  for (let week = 1; week <= 17; week++) {
    const ticketsInWeek = generatedWeeklyCounts[week] || 5;

    for (let slot = 0; slot < ticketsInWeek; slot++) {
      const index = templates.length;
      const catalog = generatedCatalog[index % generatedCatalog.length];
      const priority = generatedPriorities[(index + week + slot) % generatedPriorities.length];
      const submitDate = new Date(firstWeekDate);
      submitDate.setDate(firstWeekDate.getDate() + (week - 1) * 7 + ((slot * 2 + week) % 6));
      submitDate.setHours(8 + ((slot + week) % 9), slot % 2 === 0 ? 10 : 40, 0, 0);

      const status = getGeneratedStatus(week, slot, ticketsInWeek);

      templates.push([
        `${generatedDescriptions[index % generatedDescriptions.length]} - Week ${week}`,
        status,
        priority,
        catalog[0],
        catalog[1],
        catalog[2],
        catalog[3],
        catalog[4],
        catalog[5],
        catalog[6],
        generatedOwners[index % generatedOwners.length],
        generatedAssignees[(index + 2) % generatedAssignees.length],
        submitDate.toISOString(),
      ]);
    }
  }

  return templates;
}

const ticketTemplates = [
  ...baseTicketTemplates,
  ...buildGeneratedTicketTemplates(),
];

function getDateOnly(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function getAging(submitValue) {
  const submitDate = new Date(submitValue);
  return Math.max(0, Math.floor((seedNow - submitDate) / (24 * 60 * 60 * 1000)));
}

function getCloseDate(status, updatedAt) {
  if (status === 'Closed') {
    return getDateOnly(updatedAt);
  }

  return null;
}

function getResolvedDate(status, updatedAt) {
  if (status === 'Resolved') {
    return getDateOnly(updatedAt);
  }

  return null;
}

function getUpdatedAt(status, submitDate, deadline) {
  if (status === 'Resolved' || status === 'Closed') {
    const afterDeadline = ['Critical', 'High'].includes(deadline.priority) && Number(deadline.index) % 3 === 0;
    return afterDeadline ? addHours(deadline.value, 3) : addHours(new Date(submitDate), 2);
  }

  return addHours(new Date(submitDate), Math.min(36, Math.max(2, getAging(submitDate) * 4)));
}

async function insertUsers() {
  const userIdByKey = {};

  for (const demoUser of demoUsers) {
    const passwordHash = await bcrypt.hash(demoUser.password, 10);
    // email_verified: true so demo accounts can log in without going through
    // the email verification flow.
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, email_verified)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id`,
      [demoUser.name, demoUser.email, passwordHash, demoUser.role]
    );

    userIdByKey[demoUser.key] = result.rows[0].id;
  }

  return userIdByKey;
}

async function insertTeams() {
  const teamIdByName = {};

  for (const team of demoTeams) {
    const result = await query(
      `INSERT INTO teams (name, department)
       VALUES ($1, $2)
       RETURNING id`,
      [team.name, team.department]
    );
    teamIdByName[team.name] = result.rows[0].id;
  }

  return teamIdByName;
}

async function insertTeamMemberships(userIdByKey, teamIdByName) {
  for (const [userKey, teamNames] of Object.entries(demoTeamMemberships)) {
    const userId = userIdByKey[userKey];
    if (!userId) continue;

    for (const teamName of teamNames) {
      const teamId = teamIdByName[teamName];
      if (!teamId) continue;
      await query(
        `INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)`,
        [teamId, userId]
      );
    }
  }
}

async function insertInfrastructureSites() {
  for (const site of infrastructureSites) {
    await query(
      `INSERT INTO infrastructure_sites (
        site_id,
        country,
        country_code,
        city,
        city_code,
        latitude,
        longitude,
        infrastructure_type,
        vendor,
        status,
        description
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'Nokia',$9,$10)`,
      site
    );
  }
}

async function insertTickets(userIdByKey, teamIdByName) {
  const siteIds = infrastructureSites.map((site) => site[0]);

  for (const [index, template] of ticketTemplates.entries()) {
    const [
      description,
      status,
      priority,
      assignedGroup,
      serviceType,
      company,
      productTier1,
      productTier2,
      productTier3,
      categoryTier1,
      ownerKey,
      assignedKey,
      submitValue,
    ] = template;

    const defaultSla = getDefaultSlaForPriority(priority);
    const submitDate = new Date(submitValue);
    const slaDeadline = calculateSlaDeadline(submitDate, defaultSla.slaType, defaultSla.slaHours);
    const updatedAt = getUpdatedAt(status, submitDate, { value: slaDeadline, priority, index });
    const closeDate = getCloseDate(status, updatedAt);
    const resolvedDate = getResolvedDate(status, updatedAt);
    const ticketId = `INC${String(1301 + index).padStart(6, '0')}`;
    const ownerUserId = userIdByKey[ownerKey];
    const assignedUserId = userIdByKey[assignedKey];
    const teamId = teamIdByName[assignedGroup] ?? null;
    const siteId = siteIds[index % siteIds.length];

    await query(
      `INSERT INTO tickets (
        id,
        description,
        status,
        priority,
        assigned_group,
        site_id,
        team_id,
        service_type,
        submit_date,
        last_modified_date,
        resolved_date,
        close_date,
        company,
        product_categorization_tier1,
        product_categorization_tier2,
        product_categorization_tier3,
        categorization_tier1,
        sla_type,
        sla_hours,
        sla_deadline,
        aging,
        owner_user_id,
        assigned_person_user_id,
        created_at,
        updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)`,
      [
        ticketId,
        description,
        status,
        priority,
        assignedGroup,
        siteId,
        teamId,
        serviceType,
        getDateOnly(submitDate),
        getDateOnly(updatedAt),
        resolvedDate,
        closeDate,
        company,
        productTier1,
        productTier2,
        productTier3,
        categoryTier1,
        defaultSla.slaType,
        defaultSla.slaHours,
        slaDeadline,
        getAging(submitDate),
        ownerUserId,
        assignedUserId,
        submitDate,
        updatedAt,
      ]
    );

    await query(
      `INSERT INTO ticket_history (ticket_id, user_id, action, field_name, old_value, new_value, created_at)
       VALUES
         ($1, $2, 'created', 'ticket', NULL, $1, $3),
         ($1, $4, 'updated', 'Status', 'Open', $5, $6)`,
      [ticketId, ownerUserId, submitDate, assignedUserId, status, updatedAt]
    );

    if (index % 2 === 0) {
      await query(
        `INSERT INTO ticket_comments (ticket_id, user_id, comment_text, created_at)
         VALUES ($1, $2, $3, $4)`,
        [
          ticketId,
          assignedUserId,
          `Initial investigation started for ${serviceType.toLowerCase()} ticket.`,
          addHours(submitDate, 1),
        ]
      );
    }
  }
}

async function run() {
  // Reset the data tables. CASCADE clears child rows in ticket_history /
  // ticket_comments / team_members, RESTART IDENTITY resets the SERIAL
  // counters so demo IDs stay predictable between runs.
  await query('TRUNCATE TABLE tickets, infrastructure_sites, team_members, teams, users RESTART IDENTITY CASCADE;');

  const userIdByKey = await insertUsers();
  const teamIdByName = await insertTeams();
  await insertTeamMemberships(userIdByKey, teamIdByName);
  await insertInfrastructureSites();
  await insertTickets(userIdByKey, teamIdByName);

  console.log('Database seeded successfully.');
  console.log(`Created ${demoUsers.length} users, ${demoTeams.length} teams, ${infrastructureSites.length} sites, and ${ticketTemplates.length} tickets.`);
  console.log('Demo logins:');
  for (const demoUser of demoUsers) {
    console.log(`- ${demoUser.email} / ${demoUser.password} (${demoUser.role})`);
  }
}

run()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
