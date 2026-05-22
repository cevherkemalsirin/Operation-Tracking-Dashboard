const HELP_TOPICS = {
  ticket_reports: {
    title: 'Ticket requests and reports',
    answer:
      'Open a ticket detail page and use the Ticket Requests / Reports section to write a ticket-related message. This is useful for notes, requests, clarifications, or asking another user to review something about the ticket.',
  },
  tagging_users: {
    title: 'Tagging users in ticket reports',
    answer:
      'Open the ticket detail page, go to Ticket Requests / Reports, type @ in the message box, choose a user from the dropdown, finish the message, and click Send Report. The tagged user receives a notification on the Welcome page.',
  },
  notifications: {
    title: 'Notifications',
    answer:
      'Notifications appear on the Welcome page when another user tags you in a ticket request or report. Opening the notification shows the related message and ticket information. After you open it, the unread notification count is cleared.',
  },
  sla_filters: {
    title: 'SLA filters',
    answer:
      'Use the SLA filter to view tickets by SLA condition. Overdue means the SLA deadline has passed. Urgent means the ticket is close to breach and uses the red warning style. Warning means the ticket is approaching the SLA deadline. Normal means the active ticket still has enough SLA time. Completed tickets are handled separately.',
  },
  ticket_management: {
    title: 'Ticket Management',
    answer:
      'Ticket Management has My Tickets and Assigned Tickets. My Tickets shows tickets you own, and Assigned Tickets shows tickets assigned to you. Admin users can see and manage all tickets in My Tickets. Owners and admins can edit tickets. Assigned users can update ticket progress.',
  },
  dashboard: {
    title: 'Dashboard',
    answer:
      'The Dashboard shows ticket rows, filters, search, SLA timing, status, priority, ownership, site, company, and categorization information. It is best for quickly finding and monitoring operational tickets.',
  },
  analytics: {
    title: 'Analytics',
    answer:
      'Analytics shows charts and maps for operational trends, SLA performance, team performance, and infrastructure site incidents. Use it when you want a higher-level view instead of individual ticket rows.',
  },
  site_map: {
    title: 'Infrastructure map',
    answer:
      'The infrastructure map shows telecom site locations. One pin represents one Site ID. Pin color depends on active ticket SLA condition: red for overdue or danger, yellow for warning, and green for normal or no active SLA issue.',
  },
  admin_panel: {
    title: 'Admin panel',
    answer:
      'The Admin panel is only available to admin users. It is used to manage users and teams. Normal users should not see or access admin-only controls.',
  },
};

export function getDashboardHelp(topic) {
  const helpTopic = HELP_TOPICS[topic];

  if (!helpTopic) {
    return {
      found: false,
      message: 'I could not find that dashboard help topic.',
      availableTopics: Object.keys(HELP_TOPICS),
    };
  }

  return {
    found: true,
    topic,
    ...helpTopic,
  };
}
