import { Link } from 'react-router-dom';
import { getSitePinLabel } from '../utils/siteUtils';

export default function SitePinPopup({ site, ticket, tone }) {
  const relatedTicketIds = site.relatedTicketIds || (ticket ? [ticket.id] : []);

  return (
    <div className="site-popup">
      <strong>{site.siteId}</strong>
      <span>{site.city}, {site.country}</span>
      <span>{site.infrastructureType}</span>
      <span>Vendor: {site.vendor || 'Nokia'}</span>
      {ticket ? (
        <span>Ticket: <Link to={`/tickets/${encodeURIComponent(ticket.id)}`}>{ticket.id}</Link></span>
      ) : (
        <span>{site.ticketCount || 0} related {(site.ticketCount || 0) === 1 ? 'ticket' : 'tickets'}</span>
      )}
      <span>SLA: {getSitePinLabel(tone)}</span>
      {relatedTicketIds.length > 0 && (
        <div className="site-popup-ticket-list">
          {relatedTicketIds.map((ticketId) => (
            <Link key={ticketId} to={`/tickets/${encodeURIComponent(ticketId)}`}>
              {ticketId}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
