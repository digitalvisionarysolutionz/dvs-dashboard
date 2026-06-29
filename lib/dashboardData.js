import { getClientsData } from "./clientsData.js";
import { getProjectsData } from "./projectsData.js";
import { getLeadsData, leadStages } from "./leadsData.js";

const MS_PER_DAY = 86400000;
const DUE_SOON_DAYS = 7;
const CLOSED_STAGES = new Set(["won", "lost", "archived"]);
const PROPOSAL_STAGES = new Set(["proposal_sent", "negotiation"]);
const HOT_LEAD_STAGES = new Set(["discovery", "proposal_sent", "negotiation"]);

const EMPTY_DASHBOARD = {
  statusSentence: "All clear — your command center is up to date.",
  metrics: [],
  needsAttention: [],
  projectSnapshot: [],
  recentProjects: [],
  recentClients: [],
  crmSnapshot: {
    stageSummary: [],
    hotLeads: [],
    pipelineValue: "$0",
    activeLeadCount: 0,
    followUpsDue: 0,
  },
  recentActivity: [],
};

function isActiveProject(project) {
  return !project.isCompleted && !project.isArchived;
}

function isActiveClient(client) {
  return client.rawStatus === "active" && !client.isArchived;
}

function isActiveLead(lead) {
  return !CLOSED_STAGES.has(lead.rawStage) && lead.rawStatus !== "archived";
}

function parseDateAtMidnight(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value.includes("T") ? value : `${value}T12:00:00`);
  date.setHours(0, 0, 0, 0);

  return date;
}

function daysUntilDue(rawDueDate) {
  const dueDate = parseDateAtMidnight(rawDueDate);

  if (!dueDate) {
    return Number.POSITIVE_INFINITY;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.ceil((dueDate - today) / MS_PER_DAY);
}

function isFollowUpDue(lead) {
  if (!lead.nextFollowUp) {
    return false;
  }

  const dueDate = parseDateAtMidnight(lead.nextFollowUp);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return dueDate <= today;
}

function formatActivityTime(isoValue) {
  if (!isoValue) {
    return "Recently";
  }

  const date = new Date(isoValue);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    return "Just now";
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function toProjectRow(project) {
  return {
    id: project.id,
    name: project.name,
    clientName: project.clientName,
    status: project.status,
    rawStatus: project.rawStatus,
    priority: project.priority,
    rawPriority: project.rawPriority,
    progress: project.progress,
    dueDate: project.dueDate,
    rawDueDate: project.rawDueDate,
    href: "/projects",
  };
}

function buildStatusSentence(needsAttentionCount, leadSummary) {
  if (needsAttentionCount > 0) {
    const suffix = needsAttentionCount === 1 ? "" : "s";

    return `You have ${needsAttentionCount} item${suffix} needing attention today.`;
  }

  if (leadSummary.activeOpportunities > 0) {
    const suffix = leadSummary.activeOpportunities === 1 ? "y" : "ies";

    return `${leadSummary.activeOpportunities} active opportunit${suffix} worth ${leadSummary.estimatedValue} in the pipeline.`;
  }

  return "All clear — your command center is up to date.";
}

function buildMetrics({ activeClients, activeProjects, completedProjects, leadSummary }) {
  const followUpsHint =
    leadSummary.followUpsDue > 0
      ? `${leadSummary.followUpsDue} overdue`
      : "None due";

  return [
    {
      id: "active-clients",
      label: "Active Clients",
      value: String(activeClients.length),
      hint: "Live accounts",
      href: "/clients",
    },
    {
      id: "active-projects",
      label: "Active Projects",
      value: String(activeProjects.length),
      hint: "In progress",
      href: "/projects",
    },
    {
      id: "completed-projects",
      label: "Completed",
      value: String(completedProjects.length),
      hint: "Delivered work",
      href: "/projects",
    },
    {
      id: "active-leads",
      label: "Active Leads",
      value: String(leadSummary.activeOpportunities),
      hint: "Open pipeline",
      href: "/crm",
    },
    {
      id: "pipeline-value",
      label: "Pipeline Value",
      value: leadSummary.estimatedValue,
      hint: "Estimated total",
      href: "/crm",
    },
    {
      id: "follow-ups-due",
      label: "Follow-ups Due",
      value: String(leadSummary.followUpsDue),
      hint: followUpsHint,
      href: "/crm",
      tone: leadSummary.followUpsDue > 0 ? "warning" : "default",
    },
  ];
}

function buildNeedsAttention(activeProjects, activeLeads) {
  const items = [];

  activeProjects.forEach((project) => {
    if (project.rawPriority === "high") {
      items.push({
        id: `project-priority-${project.id}`,
        type: "project-priority",
        title: project.name,
        subtitle: project.clientName,
        badge: "High Priority",
        badgeTone: "danger",
        href: "/projects",
        sortKey: 20,
      });
    }

    const daysUntil = daysUntilDue(project.rawDueDate);

    if (daysUntil >= 0 && daysUntil <= DUE_SOON_DAYS) {
      items.push({
        id: `project-due-${project.id}`,
        type: "project-due",
        title: project.name,
        subtitle: project.clientName,
        badge: daysUntil === 0 ? "Due Today" : `Due in ${daysUntil}d`,
        badgeTone: daysUntil <= 1 ? "danger" : "warning",
        href: "/projects",
        sortKey: daysUntil === 0 ? 0 : 10 + daysUntil,
      });
    }
  });

  activeLeads.forEach((lead) => {
    if (isFollowUpDue(lead)) {
      items.push({
        id: `lead-follow-up-${lead.id}`,
        type: "lead-follow-up",
        title: lead.businessName,
        subtitle: lead.serviceInterest,
        badge: "Follow-up Due",
        badgeTone: "warning",
        href: "/crm",
        sortKey: 5,
      });
    }

    if (PROPOSAL_STAGES.has(lead.rawStage)) {
      items.push({
        id: `lead-proposal-${lead.id}`,
        type: "lead-proposal",
        title: lead.businessName,
        subtitle: lead.estimatedValueLabel,
        badge: lead.stage,
        badgeTone: "accent",
        href: "/crm",
        sortKey: 30,
      });
    }
  });

  const seen = new Set();

  return items
    .filter((item) => {
      if (seen.has(item.id)) {
        return false;
      }

      seen.add(item.id);
      return true;
    })
    .sort((left, right) => left.sortKey - right.sortKey)
    .slice(0, 8);
}

function buildStageSummary(activeLeads) {
  return leadStages
    .filter((stage) => !CLOSED_STAGES.has(stage.key))
    .map((stage) => ({
      key: stage.key,
      label: stage.label,
      tone: stage.tone,
      count: activeLeads.filter((lead) => lead.rawStage === stage.key).length,
    }));
}

function buildHotLeads(activeLeads) {
  return activeLeads
    .filter(
      (lead) =>
        lead.rawPriority === "high" ||
        HOT_LEAD_STAGES.has(lead.rawStage) ||
        isFollowUpDue(lead)
    )
    .sort((left, right) => right.estimatedValue - left.estimatedValue)
    .slice(0, 4)
    .map((lead) => ({
      id: lead.id,
      businessName: lead.businessName,
      stage: lead.stage,
      rawStage: lead.rawStage,
      priority: lead.priority,
      estimatedValueLabel: lead.estimatedValueLabel,
      nextFollowUpLabel: lead.nextFollowUpLabel,
      serviceInterest: lead.serviceInterest,
      href: "/crm",
    }));
}

function buildRecentActivity(clients, recentProjects, leads) {
  const activity = [];

  clients.slice(0, 5).forEach((client) => {
    if (!client.createdAt) {
      return;
    }

    activity.push({
      id: `client-${client.id}`,
      type: "client",
      message: `Client added: ${client.businessName}`,
      timestamp: client.createdAt,
      timeLabel: formatActivityTime(client.createdAt),
      href: "/clients",
    });
  });

  leads.slice(0, 5).forEach((lead) => {
    if (!lead.createdAt) {
      return;
    }

    activity.push({
      id: `lead-${lead.id}`,
      type: "lead",
      message: `Lead captured: ${lead.businessName}`,
      timestamp: lead.createdAt,
      timeLabel: formatActivityTime(lead.createdAt),
      href: "/crm",
    });
  });

  recentProjects.forEach((project) => {
    if (!project.createdAt) {
      return;
    }

    activity.push({
      id: `project-${project.id}`,
      type: "project",
      message: `Project created: ${project.name}`,
      timestamp: project.createdAt,
      timeLabel: formatActivityTime(project.createdAt),
      href: "/projects",
    });
  });

  return activity
    .sort((left, right) => {
      const leftTime = new Date(left.timestamp).getTime();
      const rightTime = new Date(right.timestamp).getTime();

      return rightTime - leftTime;
    })
    .slice(0, 8);
}

async function getRecentProjectsByCreatedAt(supabase, organizationId, projectById) {
  const { data, error } = await supabase
    .from("projects")
    .select("id, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Recent projects error:", error.message);
    return [];
  }

  return (data || [])
    .map((row) => {
      const project = projectById.get(row.id);

      if (!project) {
        return null;
      }

      return {
        ...toProjectRow(project),
        createdAt: row.created_at || "",
      };
    })
    .filter(Boolean);
}

export async function getDashboardData(supabase, organizationId) {
  if (!organizationId) {
    return EMPTY_DASHBOARD;
  }

  const [clients, projects, { leads, summary: leadSummary }] = await Promise.all([
    getClientsData(supabase, organizationId),
    getProjectsData(supabase, organizationId),
    getLeadsData(supabase, organizationId),
  ]);

  const activeClients = clients.filter(isActiveClient);
  const activeProjects = projects.filter(isActiveProject);
  const completedProjects = projects.filter((project) => project.isCompleted);
  const activeLeads = leads.filter(isActiveLead);
  const projectById = new Map(projects.map((project) => [project.id, project]));

  const needsAttention = buildNeedsAttention(activeProjects, activeLeads);

  const projectSnapshot = [...activeProjects]
    .sort((left, right) => {
      const leftDays = daysUntilDue(left.rawDueDate);
      const rightDays = daysUntilDue(right.rawDueDate);

      if (leftDays !== rightDays) {
        return leftDays - rightDays;
      }

      if (left.rawPriority === "high" && right.rawPriority !== "high") {
        return -1;
      }

      if (right.rawPriority === "high" && left.rawPriority !== "high") {
        return 1;
      }

      return 0;
    })
    .slice(0, 5)
    .map(toProjectRow);

  const recentProjects = await getRecentProjectsByCreatedAt(
    supabase,
    organizationId,
    projectById
  );

  const recentActivity = buildRecentActivity(clients, recentProjects, leads);

  const recentClients = clients.slice(0, 5).map((client) => ({
    id: client.id,
    businessName: client.businessName,
    status: client.status,
    email: client.email,
    createdAt: client.createdAt,
    href: "/clients",
  }));

  return {
    statusSentence: buildStatusSentence(needsAttention.length, leadSummary),
    metrics: buildMetrics({
      activeClients,
      activeProjects,
      completedProjects,
      leadSummary,
    }),
    needsAttention,
    projectSnapshot,
    recentProjects,
    recentClients,
    crmSnapshot: {
      stageSummary: buildStageSummary(activeLeads),
      hotLeads: buildHotLeads(activeLeads),
      pipelineValue: leadSummary.estimatedValue,
      activeLeadCount: leadSummary.activeOpportunities,
      followUpsDue: leadSummary.followUpsDue,
    },
    recentActivity,
  };
}
