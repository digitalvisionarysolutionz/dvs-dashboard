const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const weekDays = DAY_NAMES;

export const timeSlots = [
  { hour: 7, label: "7 AM" },
  { hour: 8, label: "8 AM" },
  { hour: 9, label: "9 AM" },
  { hour: 10, label: "10 AM" },
  { hour: 11, label: "11 AM" },
  { hour: 12, label: "12 PM" },
  { hour: 13, label: "1 PM" },
  { hour: 14, label: "2 PM" },
  { hour: 15, label: "3 PM" },
  { hour: 16, label: "4 PM" },
  { hour: 17, label: "5 PM" },
  { hour: 18, label: "6 PM" },
];

function toSafeDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const trimmedValue = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
      const [year, month, day] = trimmedValue.split("-").map(Number);
      return new Date(year, month - 1, day, 12, 0, 0);
    }

    const parsedDate = new Date(trimmedValue);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }

  return new Date();
}

export function getDateKey(value) {
  const date = toSafeDate(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDateFromKey(dateKey) {
  return toSafeDate(dateKey);
}

export function addDays(value, amount) {
  const date = toSafeDate(value);
  const nextDate = new Date(date);

  nextDate.setDate(nextDate.getDate() + amount);

  return nextDate;
}

export function addWeeks(value, amount) {
  return addDays(value, amount * 7);
}

export function startOfWeek(value) {
  const date = toSafeDate(value);
  const startDate = new Date(date);

  startDate.setDate(date.getDate() - date.getDay());
  startDate.setHours(12, 0, 0, 0);

  return startDate;
}

export function formatMonthLabel(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(toSafeDate(value));
}

export function formatLongDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(toSafeDate(value));
}

export function formatWeekRange(value) {
  const weekStart = startOfWeek(value);
  const weekEnd = addDays(weekStart, 6);

  const startLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(weekStart);

  const endLabel = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
  }).format(weekEnd);

  return `${startLabel} – ${endLabel} (Day: ${weekEnd.getDate()})`;
}

export function formatEventTime(value) {
  const date = toSafeDate(value);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function getMonthMatrix(value) {
  const monthDate = toSafeDate(value);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1, 12, 0, 0);
  const startDate = startOfWeek(firstDayOfMonth);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(startDate, index);

    return {
      date,
      dateKey: getDateKey(date),
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      dayName: DAY_NAMES[date.getDay()],
    };
  });
}

export function getWeekMatrix(value) {
  const weekStart = startOfWeek(value);

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);

    return {
      date,
      dateKey: getDateKey(date),
      dayNumber: date.getDate(),
      dayName: DAY_NAMES[date.getDay()],
    };
  });
}

export function groupEventsByDate(events = []) {
  const groupedEvents = new Map();

  events.forEach((event) => {
    const dateKey = event?.dateKey || getDateKey(event?.date || event?.startAt);

    if (!groupedEvents.has(dateKey)) {
      groupedEvents.set(dateKey, []);
    }

    groupedEvents.get(dateKey).push({
      ...event,
      dateKey,
    });
  });

  groupedEvents.forEach((dateEvents) => {
    dateEvents.sort((firstEvent, secondEvent) => {
      const firstTime = firstEvent?.startAt
        ? new Date(firstEvent.startAt).getTime()
        : 0;
      const secondTime = secondEvent?.startAt
        ? new Date(secondEvent.startAt).getTime()
        : 0;

      return firstTime - secondTime;
    });
  });

  return groupedEvents;
}

export function splitAllDayAndTimedEvents(events = []) {
  const allDay = [];
  const timed = [];

  events.forEach((event) => {
    if (event?.allDay || !event?.startAt) {
      allDay.push(event);
      return;
    }

    timed.push(event);
  });

  timed.sort((firstEvent, secondEvent) => {
    const firstTime = new Date(firstEvent.startAt).getTime();
    const secondTime = new Date(secondEvent.startAt).getTime();

    return firstTime - secondTime;
  });

  return {
    allDay,
    timed,
  };
}

export function getEventHour(event) {
  if (!event?.startAt) {
    return null;
  }

  const date = new Date(event.startAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.getHours();
}

export function getEventTypeClasses(sourceType = "") {
  if (sourceType === "lead") {
    return "border-emerald-300/35 bg-emerald-400/12 text-emerald-100";
  }

  if (sourceType === "intake") {
    return "border-blue-300/35 bg-blue-400/12 text-blue-100";
  }

  if (sourceType === "project") {
    return "border-yellow-300/35 bg-yellow-400/12 text-yellow-100";
  }

  return "border-[#5cf4ec]/35 bg-[#5cf4ec]/10 text-[#5cf4ec]";
}

export function getPriorityClasses(priority = "") {
  const value = String(priority || "medium").toLowerCase();

  if (value === "high") {
    return "border-red-300/35 bg-red-400/12 text-red-100";
  }

  if (value === "low") {
    return "border-emerald-300/35 bg-emerald-400/12 text-emerald-100";
  }

  return "border-yellow-300/35 bg-yellow-400/12 text-yellow-100";
}