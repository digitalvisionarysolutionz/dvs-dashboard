"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardModal from "../ui/DashboardModal.jsx";
import CalendarDayModal from "./CalendarDayModal.jsx";
import CalendarEventCard from "./CalendarEventCard.jsx";
import CalendarHeader from "./CalendarHeader.jsx";
import CalendarMonthView from "./CalendarMonthView.jsx";
import CalendarWeekView from "./CalendarWeekView.jsx";
import NewEventModal from "./NewEventModal.jsx";
import {
  addDays,
  addWeeks,
  formatLongDate,
  formatWeekRange,
  getDateKey,
  getDateFromKey,
  groupEventsByDate,
} from "./calendarUtils.js";

const DAY_DRAWER_BREAKPOINT_QUERY = "(min-width: 1024px)";
const DAY_DRAWER_ANIMATION_MS = 280;

function InfoTile({ label, value }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--app-border)] bg-white/[0.035] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function EventDetailModal({ event, onClose }) {
  return (
    <DashboardModal
      open={Boolean(event)}
      eyebrow={event?.eventType || "Calendar Event"}
      title={event?.title || "Calendar Event"}
      description={event?.clientName || ""}
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      {event && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoTile label="Date" value={formatLongDate(event.date)} />
            <InfoTile label="Type" value={event.eventType || "Calendar"} />
            <InfoTile label="Priority" value={event.priority || "Medium"} />
            <InfoTile label="Status" value={event.status || "Scheduled"} />
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--app-border)] bg-white/[0.035] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#5cf4ec]">
              Context
            </p>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-300">
              {event.description || "No event notes added yet."}
            </p>
          </div>

          {event.meta && Object.keys(event.meta).length > 0 && (
            <div className="rounded-[var(--radius-md)] border border-[var(--app-border)] bg-white/[0.035] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#5cf4ec]">
                Source Details
              </p>

              <div className="mt-3 grid gap-2">
                {Object.entries(event.meta)
                  .filter(([, value]) => value !== "" && value !== null)
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col gap-1 border-b border-white/10 py-2 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                        {key.replaceAll(/([A-Z])/g, " $1")}
                      </span>
                      <span className="text-sm font-bold text-slate-200">
                        {String(value)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardModal>
  );
}

function CalendarDayDrawer({
  open,
  selectedDateKey,
  events = [],
  onClose,
  onEventClick,
}) {
  const [shouldRender, setShouldRender] = useState(open);
  const [isEntered, setIsEntered] = useState(false);

  useEffect(() => {
    let animationFrame;
    let timeout;

    if (open) {
      setShouldRender(true);
      setIsEntered(false);

      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = window.requestAnimationFrame(() => {
          setIsEntered(true);
        });
      });

      return () => {
        if (animationFrame) {
          window.cancelAnimationFrame(animationFrame);
        }
      };
    }

    setIsEntered(false);

    timeout = window.setTimeout(() => {
      setShouldRender(false);
    }, DAY_DRAWER_ANIMATION_MS);

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }

      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 hidden transition lg:block ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close selected day panel"
        onClick={onClose}
        className={`absolute inset-0 cursor-default bg-black/30 transition-opacity duration-[280ms] ease-out ${
          isEntered ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        className={`absolute right-0 top-0 z-10 h-full w-[420px] max-w-[calc(100vw-32px)] border-l border-[#5cf4ec]/20 bg-[#071018]/96 shadow-[-22px_0_55px_rgba(0,0,0,0.55),0_0_32px_rgba(92,244,236,0.08)] backdrop-blur-xl transition-transform duration-[280ms] ease-out ${
          isEntered ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#5cf4ec]">
                  Calendar Day
                </p>

                <h2 className="mt-2 text-2xl font-black leading-tight text-white">
                  {formatLongDate(getDateFromKey(selectedDateKey))}
                </h2>

                <p className="mt-2 text-sm font-semibold text-slate-400">
                  {events.length === 1
                    ? "1 scheduled item"
                    : `${events.length} scheduled items`}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close selected day panel"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] border border-white/10 text-slate-400 transition hover:border-[#5cf4ec]/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec]"
              >
                ×
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <div className="space-y-3">
              {events.length > 0 ? (
                events.map((event) => (
                  <CalendarEventCard
                    key={event.id}
                    event={event}
                    onClick={() => onEventClick(event)}
                  />
                ))
              ) : (
                <div className="rounded-[var(--radius-md)] border border-dashed border-white/12 bg-black/20 p-5">
                  <p className="text-sm font-black text-white">No events yet.</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                    Project deadlines, lead follow-ups, intake submissions, and
                    internal events will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function TodayView({ events = [], onEventClick }) {
  return (
    <section className="max-h-[calc(100dvh-300px)] min-h-[360px] overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--app-border)] bg-[#071018]/72 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#5cf4ec]">
        Today
      </p>

      <h2 className="mt-2 text-2xl font-black text-white">Today’s Schedule</h2>

      <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-400">
        A focused day view will become the command center for meetings,
        follow-ups, deadlines, reminders, and tasks due today.
      </p>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {events.length > 0 ? (
          events.map((event) => (
            <CalendarEventCard
              key={event.id}
              event={event}
              onClick={() => onEventClick(event)}
            />
          ))
        ) : (
          <div className="rounded-[var(--radius-md)] border border-dashed border-white/12 bg-black/20 p-5">
            <p className="text-sm font-black text-white">No events today.</p>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Today is clear based on current project, CRM, and intake dates.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function CalendarShell({ events = [] }) {
  const today = new Date();
  const todayKey = getDateKey(today);

  const [viewMode, setViewMode] = useState("month");
  const [currentMonthDate, setCurrentMonthDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [currentWeekDate, setCurrentWeekDate] = useState(today);
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [dayDrawerOpen, setDayDrawerOpen] = useState(false);
  const [mobileDayOpen, setMobileDayOpen] = useState(false);
  const [newEventOpen, setNewEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const eventsByDate = useMemo(() => groupEventsByDate(events), [events]);
  const selectedDayEvents = eventsByDate.get(selectedDateKey) || [];
  const todaysEvents = eventsByDate.get(todayKey) || [];

  function syncSelectedDate(dateKey) {
    const selectedDate = getDateFromKey(dateKey);
    const nextDateKey = getDateKey(selectedDate);

    setSelectedDateKey(nextDateKey);
    setCurrentWeekDate(selectedDate);
    setCurrentMonthDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    );
  }

  function closeDaySurfaces() {
    setDayDrawerOpen(false);
    setMobileDayOpen(false);
  }

  function handlePrevious() {
    closeDaySurfaces();

    if (viewMode === "week") {
      setCurrentWeekDate((current) => addWeeks(current, -1));
      return;
    }

    if (viewMode === "today") {
      const selectedDate = getDateFromKey(selectedDateKey);
      const previousDate = addDays(selectedDate, -1);
      syncSelectedDate(getDateKey(previousDate));
      return;
    }

    setCurrentMonthDate(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
    );
  }

  function handleNext() {
    closeDaySurfaces();

    if (viewMode === "week") {
      setCurrentWeekDate((current) => addWeeks(current, 1));
      return;
    }

    if (viewMode === "today") {
      const selectedDate = getDateFromKey(selectedDateKey);
      const nextDate = addDays(selectedDate, 1);
      syncSelectedDate(getDateKey(nextDate));
      return;
    }

    setCurrentMonthDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
    );
  }

  function handleViewModeChange(nextViewMode) {
    setViewMode(nextViewMode);
    closeDaySurfaces();

    if (nextViewMode === "today") {
      syncSelectedDate(todayKey);
      return;
    }

    if (nextViewMode === "week") {
      setCurrentWeekDate(getDateFromKey(selectedDateKey));
    }
  }

  function handleMonthDaySelect(dateKey) {
    syncSelectedDate(dateKey);

    const supportsDayDrawer =
      typeof window !== "undefined" &&
      window.matchMedia(DAY_DRAWER_BREAKPOINT_QUERY).matches;

    if (supportsDayDrawer) {
      setDayDrawerOpen(true);
      setMobileDayOpen(false);
    } else {
      setMobileDayOpen(true);
      setDayDrawerOpen(false);
    }
  }

  function handleWeekDaySelect(dateKey) {
    syncSelectedDate(dateKey);
    closeDaySurfaces();
  }

  function handleEventClick(event) {
    closeDaySurfaces();
    setSelectedEvent(event);
  }

  const headerLabel =
    viewMode === "week" ? formatWeekRange(currentWeekDate) : undefined;

  const shouldShowDesktopDayDrawer =
    viewMode === "month" && dayDrawerOpen && Boolean(selectedDateKey);

  const shouldShowMobileDayModal =
    viewMode === "month" && mobileDayOpen && Boolean(selectedDateKey);

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <CalendarHeader
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        currentMonthDate={
          viewMode === "week" ? getDateFromKey(selectedDateKey) : currentMonthDate
        }
        displayLabel={headerLabel}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onNewEvent={() => setNewEventOpen(true)}
      />

      {viewMode === "month" && (
        <CalendarMonthView
          currentMonthDate={currentMonthDate}
          todayKey={todayKey}
          selectedDateKey={selectedDateKey}
          eventsByDate={eventsByDate}
          onDaySelect={handleMonthDaySelect}
        />
      )}

      {viewMode === "week" && (
        <CalendarWeekView
          currentWeekDate={currentWeekDate}
          todayKey={todayKey}
          selectedDateKey={selectedDateKey}
          eventsByDate={eventsByDate}
          onDaySelect={handleWeekDaySelect}
          onEventClick={handleEventClick}
        />
      )}

      {viewMode === "today" && (
        <TodayView events={todaysEvents} onEventClick={handleEventClick} />
      )}

      <CalendarDayDrawer
        open={shouldShowDesktopDayDrawer}
        selectedDateKey={selectedDateKey}
        events={selectedDayEvents}
        onClose={closeDaySurfaces}
        onEventClick={handleEventClick}
      />

      <CalendarDayModal
        open={shouldShowMobileDayModal}
        selectedDateKey={selectedDateKey}
        events={selectedDayEvents}
        onClose={closeDaySurfaces}
        onEventClick={handleEventClick}
      />

      <NewEventModal
        open={newEventOpen}
        onClose={() => setNewEventOpen(false)}
      />

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}