export const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getDateKey(date) {
  const nextDate = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(nextDate.getTime())) {
    return "";
  }

  const year = nextDate.getFullYear();
  const month = `${nextDate.getMonth() + 1}`.padStart(2, "0");
  const day = `${nextDate.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDateFromKey(dateKey) {
  if (!dateKey) {
    return new Date();
  }

  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day, 12, 0, 0);
}

export function formatMonthLabel(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatLongDate(dateKey) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(getDateFromKey(dateKey));
}

export function formatShortDate(dateKey) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(getDateFromKey(dateKey));
}

export function formatEventTime(value) {
  if (!value) {
    return "All day";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "All day";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function getMonthMatrix(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);

  startDate.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return {
      date,
      dateKey: getDateKey(date),
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
    };
  });
}

export function groupEventsByDate(events = []) {
  return events.reduce((groups, event) => {
    const existingEvents = groups.get(event.date) || [];
    existingEvents.push(event);
    groups.set(event.date, existingEvents);

    return groups;
  }, new Map());
}

export function getPriorityClasses(priority = "") {
  const normalizedPriority = String(priority || "").toLowerCase();

  if (normalizedPriority === "high") {
    return "border-red-300/35 bg-red-400/10 text-red-100";
  }

  if (normalizedPriority === "low") {
    return "border-emerald-300/30 bg-emerald-400/10 text-emerald-100";
  }

  return "border-yellow-300/30 bg-yellow-400/10 text-yellow-100";
}

export function getEventTypeClasses(sourceType = "") {
  if (sourceType === "project") {
    return "border-[#5cf4ec]/35 bg-[#5cf4ec]/10 text-[#5cf4ec]";
  }

  if (sourceType === "lead") {
    return "border-violet-300/30 bg-violet-400/10 text-violet-100";
  }

  if (sourceType === "intake") {
    return "border-blue-300/30 bg-blue-400/10 text-blue-100";
  }

  return "border-white/10 bg-white/[0.035] text-slate-300";
}