function formatCurrencyFromCents(amountCents = 0) {
  const dollars = amountCents / 100;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(dollars);
}

function formatStatus(value = "") {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() || ""}${word.slice(1)}`)
    .join(" ");
}

function formatPriority(value = "medium") {
  return formatStatus(value);
}

function formatDate(value) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function getStartOfCurrentMonth() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

async function getCount(supabase, table, organizationId, filters = []) {
  let query = supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  filters.forEach((filter) => {
    if (filter.type === "eq") {
      query = query.eq(filter.column, filter.value);
    }

    if (filter.type === "in") {
      query = query.in(filter.column, filter.value);
    }

    if (filter.type === "neq") {
      query = query.neq(filter.column, filter.value);
    }
  });

  const { count, error } = await query;

  if (error) {
    console.error(`Count error for ${table}:`, error.message);
    return 0;
  }

  return count || 0;
}

export async function getDashboardData(supabase, organizationId) {
  if (!organizationId) {
    return {
      stats: [],
      projects: [],
      leads: [],
      tasks: [],
      payments: [],
    };
  }

  const currentMonthStart = getStartOfCurrentMonth();

  const [
    activeClientsCount,
    openProjectsCount,
    projectsResponse,
    leadsResponse,
    tasksResponse,
    paidInvoicesResponse,
    pendingInvoicesResponse,
  ] = await Promise.all([
    getCount(supabase, "clients", organizationId, [
      { type: "eq", column: "status", value: "active" },
    ]),

    getCount(supabase, "projects", organizationId, [
      {
        type: "in",
        column: "status",
        value: ["planning", "in_progress", "review"],
      },
    ]),

    supabase
      .from("projects")
      .select(
        `
        id,
        name,
        status,
        progress,
        due_date,
        client:clients (
          name,
          business_name
        )
      `
      )
      .eq("organization_id", organizationId)
      .in("status", ["planning", "in_progress", "review"])
      .order("due_date", { ascending: true })
      .limit(3),

    supabase
      .from("leads")
      .select("id, name, service_interest, status, source, created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(3),

    supabase
      .from("tasks")
      .select("id, title, priority, status, due_date")
      .eq("organization_id", organizationId)
      .in("status", ["open", "in_progress"])
      .order("due_date", { ascending: true })
      .limit(4),

    supabase
      .from("invoices")
      .select("amount_cents, paid_at, status")
      .eq("organization_id", organizationId)
      .eq("status", "paid")
      .gte("paid_at", currentMonthStart),

    supabase
      .from("invoices")
      .select("amount_cents, status")
      .eq("organization_id", organizationId)
      .in("status", ["sent", "unpaid", "overdue"]),
  ]);

  if (projectsResponse.error) {
    console.error("Projects dashboard error:", projectsResponse.error.message);
  }

  if (leadsResponse.error) {
    console.error("Leads dashboard error:", leadsResponse.error.message);
  }

  if (tasksResponse.error) {
    console.error("Tasks dashboard error:", tasksResponse.error.message);
  }

  if (paidInvoicesResponse.error) {
    console.error(
      "Paid invoices dashboard error:",
      paidInvoicesResponse.error.message
    );
  }

  if (pendingInvoicesResponse.error) {
    console.error(
      "Pending invoices dashboard error:",
      pendingInvoicesResponse.error.message
    );
  }

  const paidInvoices = paidInvoicesResponse.data || [];
  const pendingInvoices = pendingInvoicesResponse.data || [];

  const monthlyRevenueCents = paidInvoices.reduce(
    (total, invoice) => total + (invoice.amount_cents || 0),
    0
  );

  const pendingInvoiceCents = pendingInvoices.reduce(
    (total, invoice) => total + (invoice.amount_cents || 0),
    0
  );

  const projects = (projectsResponse.data || []).map((project) => ({
    id: project.id,
    name: project.name,
    client: project.client?.business_name || project.client?.name || "Internal",
    status: formatStatus(project.status),
    progress: project.progress || 0,
    due: formatDate(project.due_date),
  }));

  const leads = (leadsResponse.data || []).map((lead) => ({
    id: lead.id,
    name: lead.name,
    service: lead.service_interest || "General inquiry",
    status: formatStatus(lead.status),
    source: lead.source || "Unknown",
  }));

  const tasks = (tasksResponse.data || []).map((task) => ({
    id: task.id,
    task: task.title,
    priority: formatPriority(task.priority),
    due: formatDate(task.due_date),
  }));

  const payments = [
    {
      label: "Paid This Month",
      value: formatCurrencyFromCents(monthlyRevenueCents),
    },
    {
      label: "Pending",
      value: formatCurrencyFromCents(pendingInvoiceCents),
    },
    {
      label: "Open Invoices",
      value: String(pendingInvoices.length),
    },
  ];

  const stats = [
    {
      label: "Active Clients",
      value: String(activeClientsCount),
      change: "Live from Supabase",
    },
    {
      label: "Open Projects",
      value: String(openProjectsCount),
      change: `${projects.length} shown`,
    },
    {
      label: "Monthly Revenue",
      value: formatCurrencyFromCents(monthlyRevenueCents),
      change: "Paid this month",
    },
    {
      label: "Pending Invoices",
      value: formatCurrencyFromCents(pendingInvoiceCents),
      change: `${pendingInvoices.length} open`,
    },
  ];

  return {
    stats,
    projects,
    leads,
    tasks,
    payments,
  };
}