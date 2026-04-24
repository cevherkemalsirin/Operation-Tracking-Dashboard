export function mapTicketRow(row) {
  return {
    id: row.id,
    description: row.description,
    status: row.status,
    priority: row.priority,
    assignedGroup: row.assigned_group,
    serviceType: row.service_type,
    submitDate: row.submit_date,
    aging: row.aging,
    Owner: row.owner_name,
    ownerUserId: row.owner_user_id,
    Assigned_Person: row.assigned_person_name || '',
    assignedPersonUserId: row.assigned_person_user_id,
  };
}
