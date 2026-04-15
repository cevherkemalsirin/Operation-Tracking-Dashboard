import { generateTickets } from "./ticketGeneration.js";

const tickets = generateTickets(30);

const ticketsRow = tickets.map(
    (ticket) => `
    <tr>
        <td>${ticket.id}</td>
        <td>${ticket.title}</td>
        <td>${ticket.status}</td>
        <td>${ticket.priority}</td>
        <td>${ticket.openDate}</td>
      </tr>
    `
).join("");

const tableHtml = `
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Title</th>
        <th>Status</th>
        <th>Priority</th>
        <th>Open Date</th>
      </tr>
    </thead>
    <tbody>
      ${ticketsRow}
    </tbody>
  </table>
`;
document.getElementById("tickets-table-root").innerHTML = tableHtml;