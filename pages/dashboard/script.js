let tickets = [];

const tableBody = document.getElementById("ticketTableBody");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");
const groupFilter = document.getElementById("groupFilter");
const dateFilter = document.getElementById("dateFilter");
const resetBtn = document.getElementById("resetBtn");
const openTickets =  document.getElementById("openTickets");
const totalTickets = document.getElementById("totalTickets");
const criticalTickets = document.getElementById("criticalTickets");
const resolvedTickets = document.getElementById("resolvedTickets");

function getStatusClass(status) {
    if (status === "Open") return "open";
    if (status === "In Progress") return "progress";
    if (status === "Resolved") return "resolved";
    if (status === "Closed") return "closed";
    if (status === "Pending") return "pending";
    return "";
}

function getPriorityClass(priority) {
    if (priority === "Critical") return "dot-critical";
    if (priority === "High") return "dot-high";
    if (priority === "Medium") return "dot-medium";
    return "dot-low";
}

function updateCards(data) {
   totalTickets.textContent = data.length;
   openTickets.textContent = data.filter((ticket) => ticket.status === "Open").length;
    criticalTickets.textContent = data.filter((ticket) => ticket.priority === "Critical").length;
    resolvedTickets.textContent = data.filter(ticket => ticket.status === "Resolved" || ticket.status === "Closed").length;
}

function renderTable(data) {
    tableBody.innerHTML = "";

    if (data.length === 0) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    data.forEach(ticket => {
        const row = document.createElement("tr");
        row.innerHTML = `
    <td class="ticket-id">${ticket.id}</td>
    <td class="description-cell">${ticket.description}</td>
    <td><span class="status-badge ${getStatusClass(ticket.status)}">${ticket.status}</span></td>
    <td><span class="priority-pill }"><span class="priority-dot ${getPriorityClass(ticket.priority)}"></span>${ticket.priority}</span></td>
    <td>${ticket.assignedGroup}</td>
    <td><span class="service-chip">${ticket.serviceType}</span></td>
    <td>${ticket.submitDate}</td>
    <td class="aging-cell">${ticket.aging} days</td>
`;
        tableBody.appendChild(row);
    });
}



async function loadTickets() {
    try {
        const response = await fetch("./tickets.json");

        if (!response.ok) {
            throw new Error("Could not load tickets.json");
        }

        tickets = await response.json();
        updateCards(tickets);
        renderTable(tickets);
    } catch (error) {
        console.error("Error loading tickets:", error);
        emptyState.style.display = "block";
        emptyState.textContent = "Failed to load ticket data from tickets.json.";
        updateCards([]);
        tableBody.innerHTML = "";
    }
}

function applyFilters() {
    const searchValue = searchInput.value.toLowerCase().trim();
    const statusValue = statusFilter.value;
    const priorityValue = priorityFilter.value;
    const groupValue = groupFilter.value;
    const dateValue = dateFilter.value;

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch =
            ticket.id.toLowerCase().includes(searchValue) ||
            ticket.description.toLowerCase().includes(searchValue);

        const matchesStatus = statusValue === "All" || ticket.status === statusValue;
        const matchesPriority = priorityValue === "All" || ticket.priority === priorityValue;
        const matchesGroup = groupValue === "All" || ticket.assignedGroup === groupValue;
        const matchesDate = !dateValue || ticket.submitDate === dateValue;

        return matchesSearch && matchesStatus && matchesPriority && matchesGroup && matchesDate;
    });

    updateCards(filteredTickets);
    renderTable(filteredTickets);
}

searchInput.addEventListener("input", applyFilters);
statusFilter.addEventListener("change", applyFilters);
priorityFilter.addEventListener("change", applyFilters);
groupFilter.addEventListener("change", applyFilters);
dateFilter.addEventListener("change", applyFilters);

resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    statusFilter.value = "All";
    priorityFilter.value = "All";
    groupFilter.value = "All";
    dateFilter.value = "";
    applyFilters();
});

loadTickets();