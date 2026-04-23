import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ticketsFilePath = path.resolve(__dirname, 'public', 'tickets.json');

async function readTickets() {
  const source = await readFile(ticketsFilePath, 'utf8');
  return JSON.parse(source);
}

async function writeTickets(tickets) {
  await writeFile(ticketsFilePath, `${JSON.stringify(tickets, null, 2)}\n`, 'utf8');
}

async function readJsonBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function ticketsApiPlugin() {
  async function handle(req, res) {
    const url = new URL(req.url || '/', 'http://localhost');
    if (!url.pathname.startsWith('/api/tickets')) return false;

    try {
      if (req.method === 'GET' && url.pathname === '/api/tickets') {
        sendJson(res, 200, await readTickets());
        return true;
      }

      if (req.method === 'POST' && url.pathname === '/api/tickets') {
        const tickets = await readTickets();
        const newTicket = await readJsonBody(req);
        const updatedTickets = [...tickets, newTicket];
        await writeTickets(updatedTickets);
        sendJson(res, 200, updatedTickets);
        return true;
      }

      if (req.method === 'PUT' && url.pathname.startsWith('/api/tickets/')) {
        const ticketId = decodeURIComponent(url.pathname.replace('/api/tickets/', ''));
        const tickets = await readTickets();
        const updatedTicket = await readJsonBody(req);
        const updatedTickets = tickets.map((ticket) => (ticket.id === ticketId ? updatedTicket : ticket));
        await writeTickets(updatedTickets);
        sendJson(res, 200, updatedTickets);
        return true;
      }

      if (req.method === 'DELETE' && url.pathname.startsWith('/api/tickets/')) {
        const ticketId = decodeURIComponent(url.pathname.replace('/api/tickets/', ''));
        const tickets = await readTickets();
        const updatedTickets = tickets.filter((ticket) => ticket.id !== ticketId);
        await writeTickets(updatedTickets);
        sendJson(res, 200, updatedTickets);
        return true;
      }

      sendJson(res, 405, { message: 'Method not allowed.' });
      return true;
    } catch (error) {
      sendJson(res, 500, { message: error instanceof Error ? error.message : 'Ticket API error.' });
      return true;
    }
  }

  return {
    name: 'tickets-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const handled = await handle(req, res);
        if (!handled) next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const handled = await handle(req, res);
        if (!handled) next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), ticketsApiPlugin()],
});
