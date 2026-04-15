function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const statusStates = ["closed", "resolved", "in progress", "canceled"];

const ticketTitles = [
    "Critical: 5G Base Station Offline - Sector 4",
    "Fiber Cut Detected: Metropolitan Area Network",
    "Latency Spike in Core Switching Node",
    "Signal Interference Reported: Zone B",
    "High Packet Loss on Uplink #402",
    "Microwave Link Misalignment - Site 102",
    "Bandwidth Cap Reached: Enterprise Trunk A",
    "Packet Fragmentation Issue in Edge Router",
    "Network Topology Sync Failure",
    "Submarine Cable Pressure Warning",
    "Cooling Fan Failure: Rack 12",
    "IoT Sensor Battery Critical - Smart City Grid",
    "Hardware Revision Mismatch: Line Card v2",
    "Power Supply Unit Redundancy Lost",
    "Antenna Tilt Motor Malfunction",
    "Chassis Temperature Threshold Exceeded",
    "Firmware Update Failure: Node 09",
    "Physical Breach Alarm: Data Center Cage 4",
    "Memory Leak Detected: DSP Module",
    "Optical Transceiver Fault - Port 12",
    "Login API Failure: 500 Internal Error",
    "VPN Gateway Timeout for Remote Users",
    "Database Migration Script Halted",
    "SSL Certificate Expiration Warning",
    "Unauthorized Access Attempt Blocked",
    "Customer Portal Dashboard Not Loading",
    "Slow Query Log Alert: Billing System",
    "Websocket Connection Drop - Realtime Feed",
    "Legacy API Deprecation Cleanup",
    "OAuth2 Token Refresh Issue",
    "Weekly Performance Report Generation Failed",
    "New User Onboarding: Admin Permissions",
    "Scheduled Maintenance: Cloud Migration",
    "Emergency Patch Deployment: Security Fix",
    "Customer Complaint: Intermittent Data Drop",
    "Billing Discrepancy: Account #9910",
    "Internal Wiki Access Restored Request",
    "Field Engineer Assistance Required - Site X",
    "Quarterly System Audit Log Export",
    "Hardware Refresh: Field Engineer Tablet Update"
];

const groupList = [
    "Network Operations",
    "Security Task Force",
    "Infrastructure Team",
    "Customer Success",
    "Software Development"
];

const names = [
    "Wiliam James",
    "Alex Smith",
    "Sarah Chen",
    "Elena Rodriguez",
    "David Kim",
    "Amara Okafor",
    "Marcus Thorne",
    "Sofia Rossi",
    "Liam Wilson",
    "John Doe"
];

const categoryList = [
    "Hardware Fault",
    "Software Bug",
    "Connectivity Issue",
    "Security Alert",
    "Access Request"
];

const sourceList = [
    "System Alert",
    "Web Portal",
    "Email",
    "Direct Call",
    "Internal Chat"
];

const generateDate = (startStr, endStr) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    
    return date.toISOString().split('T')[0];
};



export const createTicket = () => {
    return {
    id: getRandomInt(1, 100),
    title: ticketTitles[getRandomInt(0, ticketTitles.length - 1)],
    status: statusStates[getRandomInt(0, statusStates.length - 1)],
    openDate: generateDate('2026-01-01', '2026-04-13'),
    resolvedDate: "",
    closedDate: "",
    assignedGroup: groupList[getRandomInt(0, groupList.length - 1)],
    createdBy: names[getRandomInt(0, names.length - 1)],
    priority: getRandomInt(1, 5),
    categoty: categoryList[getRandomInt(0, categoryList.length - 1)],
    customer: names[getRandomInt(0, names.length - 1)],
    source: sourceList[getRandomInt(0, sourceList.length - 1)],
    date: new Date().toISOString().split('T')[0]
    };

};

export const generateTickets = (count) => {
    return Array.from({ length: count}, () => createTicket())
};