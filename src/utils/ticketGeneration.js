function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const statusStates = ['open', 'in progress', 'resolved', 'closed', 'canceled'];
const ticketTitles = [
  'Critical: 5G Base Station Offline - Sector 4',
  'Fiber Cut Detected: Metropolitan Area Network',
  'Latency Spike in Core Switching Node',
  'Signal Interference Reported: Zone B',
  'High Packet Loss on Uplink #402',
  'Microwave Link Misalignment - Site 102',
  'Bandwidth Cap Reached: Enterprise Trunk A',
  'Packet Fragmentation Issue in Edge Router',
  'Network Topology Sync Failure',
  'Submarine Cable Pressure Warning',
  'Cooling Fan Failure: Rack 12',
  'IoT Sensor Battery Critical - Smart City Grid',
  'Hardware Revision Mismatch: Line Card v2',
  'Power Supply Unit Redundancy Lost',
  'Antenna Tilt Motor Malfunction',
  'Chassis Temperature Threshold Exceeded',
  'Firmware Update Failure: Node 09',
  'Physical Breach Alarm: Data Center Cage 4',
  'Memory Leak Detected: DSP Module',
  'Optical Transceiver Fault - Port 12',
  'Login API Failure: 500 Internal Error',
  'VPN Gateway Timeout for Remote Users',
  'Database Migration Script Halted',
  'SSL Certificate Expiration Warning',
  'Unauthorized Access Attempt Blocked',
  'Customer Portal Dashboard Not Loading',
  'Slow Query Log Alert: Billing System',
  'Websocket Connection Drop - Realtime Feed',
  'Legacy API Deprecation Cleanup',
  'OAuth2 Token Refresh Issue'
];
const names = ['William James', 'Alex Smith', 'Sarah Chen', 'Elena Rodriguez', 'David Kim', 'Amara Okafor', 'Marcus Thorne', 'Sofia Rossi', 'Liam Wilson', 'John Doe'];
const ownerPool = ['admin@nokia.com', 'operator@nokia.com'];

function generateDate(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

export function createTicket(index) {
  return {
    id: 1000 + index,
    title: ticketTitles[getRandomInt(0, ticketTitles.length - 1)],
    status: statusStates[getRandomInt(0, statusStates.length - 1)],
    openDate: generateDate('2026-01-01', '2026-04-13'),
    priority: getRandomInt(1, 5),
    customer: names[getRandomInt(0, names.length - 1)],
    ownerEmail: ownerPool[getRandomInt(0, ownerPool.length - 1)],
  };
}

export function generateTickets(count) {
  return Array.from({ length: count }, (_, index) => createTicket(index + 1));
}
