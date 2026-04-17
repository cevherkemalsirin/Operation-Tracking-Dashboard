import { generateTickets } from "./ticketGeneration.js";

const state = {
  allTickets: generateTickets(30),
  filters: {
    search: "",
    status: "",
    priority: ""
  },
  editingTicketId: null
};

function renderStatsCards(tickets) {
  const totalCountEl = document.getElementById("total-count");
  const openCountEl = document.getElementById("open-count");
  const progressCountEl = document.getElementById("progress-count");
  const doneCountEl = document.getElementById("done-count");

  if (!totalCountEl || !openCountEl || !progressCountEl || !doneCountEl) return;

  const total = tickets.length;
  const open = tickets.filter((t) => t.status === "open").length;
  const progress = tickets.filter((t) => t.status === "in progress").length;
  const done = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;

  totalCountEl.textContent = String(total);
  openCountEl.textContent = String(open);
  progressCountEl.textContent = String(progress);
  doneCountEl.textContent = String(done);
}

function renderTableRows(tickets) {
  const tbody = document.getElementById("tickets-table-body");
  if (!tbody) return;

  tbody.innerHTML = tickets
    .map(
      (ticket) => `
      <tr>
        <td>${ticket.id}</td>
        <td>${ticket.title}</td>
        <td>${ticket.status}</td>
        <td>${ticket.priority}</td>
        <td>${ticket.openDate}</td>
        <td>${ticket.customer}</td>
        <td>
          <button type="button" class="btn-secondary btn-edit" data-id="${ticket.id}">
            Edit
          </button>
        </td>
      </tr>
    `
    )
    .join("");
}

function getVisibleTickets() {
  const searchTerm = state.filters.search.trim().toLowerCase();

  return state.allTickets.filter((ticket) => {
    const matchesSearch =
      !searchTerm ||
      String(ticket.id).includes(searchTerm) ||
      ticket.title.toLowerCase().includes(searchTerm) ||
      ticket.customer.toLowerCase().includes(searchTerm);

    const matchesStatus =
      !state.filters.status || ticket.status === state.filters.status;

    const matchesPriority =
      !state.filters.priority || String(ticket.priority) === state.filters.priority;

    return matchesSearch && matchesStatus && matchesPriority;
  });
}

function openEditModal(ticketId) {
  const ticket = state.allTickets.find((item) => item.id === ticketId);
  const modal = document.getElementById("edit-modal");
  const idInput = document.getElementById("edit-id");
  const titleInput = document.getElementById("edit-title");
  const statusInput = document.getElementById("edit-status");
  const priorityInput = document.getElementById("edit-priority");
  const customerInput = document.getElementById("edit-customer");

  if (!ticket || !modal || !idInput || !titleInput || !statusInput || !priorityInput || !customerInput) {
    return;
  }

  state.editingTicketId = ticketId;
  idInput.value = String(ticket.id);
  titleInput.value = ticket.title;
  statusInput.value = ticket.status;
  priorityInput.value = String(ticket.priority);
  customerInput.value = ticket.customer;

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
}

function closeEditModal() {
  const modal = document.getElementById("edit-modal");
  const form = document.getElementById("edit-ticket-form");
  if (!modal || !form) return;

  state.editingTicketId = null;
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  form.reset();
}

function renderAll() {
  renderStatsCards(state.allTickets);
  renderTableRows(getVisibleTickets());
}

function bindFilterControls() {
  const searchInput = document.getElementById("search-input");
  const statusFilter = document.getElementById("status-filter");
  const priorityFilter = document.getElementById("priority-filter");

  if (!searchInput || !statusFilter || !priorityFilter) return;

  searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value;
    renderAll();
  });

  statusFilter.addEventListener("change", (event) => {
    state.filters.status = event.target.value;
    renderAll();
  });

  priorityFilter.addEventListener("change", (event) => {
    state.filters.priority = event.target.value;
    renderAll();
  });
}

function bindEditActions() {
  const tbody = document.getElementById("tickets-table-body");
  const modal = document.getElementById("edit-modal");
  const cancelButton = document.getElementById("cancel-edit");
  const form = document.getElementById("edit-ticket-form");

  if (!tbody || !modal || !cancelButton || !form) return;

  tbody.addEventListener("click", (event) => {
    const button = event.target.closest(".btn-edit");
    if (!button) return;

    openEditModal(Number(button.dataset.id));
  });

  cancelButton.addEventListener("click", () => {
    closeEditModal();
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeEditModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("active")) {
      closeEditModal();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const titleInput = document.getElementById("edit-title");
    const statusInput = document.getElementById("edit-status");
    const priorityInput = document.getElementById("edit-priority");
    const customerInput = document.getElementById("edit-customer");

    if (!titleInput || !statusInput || !priorityInput || !customerInput) return;

    const title = titleInput.value.trim();
    const customer = customerInput.value.trim();

    if (!title || !customer || state.editingTicketId === null) return;

    state.allTickets = state.allTickets.map((ticket) =>
      ticket.id === state.editingTicketId
        ? {
            ...ticket,
            title,
            status: statusInput.value,
            priority: Number(priorityInput.value),
            customer
          }
        : ticket
    );

    closeEditModal();
    renderAll();
  });
}

bindFilterControls();
bindEditActions();
renderAll();