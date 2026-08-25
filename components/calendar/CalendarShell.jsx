"use client";

import { useMemo, useState } from "react";
import DashboardModal from "../ui/DashboardModal.jsx";
import CalendarDayModal from "./CalendarDayModal.jsx";
import CalendarEventCard from "./CalendarEventCard.jsx";
import CalendarEventPanel from "./CalendarEventPanel.jsx";
import CalendarHeader from "./CalendarHeader.jsx";
import CalendarMonthView from "./CalendarMonthView.jsx";
import NewEventModal from "./NewEventModal.jsx";
import {
  formatLongDate,
  getDateKey,
  getDateFromKey,
  groupEventsByDate,
} from "./calendarUtils.js";

const SIDE_PANEL_BREAKPOINT_QUERY = "(min-width: 1280px)";

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
            <InfoTile label="Type" value={event.eventType} />
            <InfoTile label="Priority" value={event.priority} />
            <InfoTile label="Status" value={event.status} />
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

function PlaceholderView({ title, description, events = [], onEventClick }) {
  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--app-border)] bg-[#071018]/72 p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#5cf4ec]">
        Next Build
      </p>

      <h2 className="mt-2 text-2xl font-black text-white">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-400">
        {description}
      </p>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {events.length > 0 ? (
          events.slice(0, 8).map((event) => (
            <CalendarEventCard
              key={event.id}
              event={event}
              onClick={() => onEventClick(event)}
            />
          ))
        ) : (
          <div className="rounded-[var(--radius-md)] border border-dashed border-white/12 bg-black/20 p-5">
            <p className="text-sm font-black text-white">No events found.</p>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Event data will appear here as records receive dates.
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
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [mobileDayOpen, setMobileDayOpen] = useState(false);
  const [newEventOpen, setNewEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const eventsByDate = useMemo(() => groupEventsByDate(events), [events]);
  const selectedDayEvents = eventsByDate.get(selectedDateKey) || [];
  const todaysEvents = eventsByDate.get(todayKey) || [];

  function handlePreviousMonth() {
    setCurrentMonthDate(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
    );
  }

  function handleNextMonth() {
    setCurrentMonthDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
    );
  }

  function handleViewModeChange(nextViewMode) {
    setViewMode(nextViewMode);

    if (nextViewMode === "today") {
      const nextToday = new Date();
      const nextTodayKey = getDateKey(nextToday);

      setCurrentMonthDate(
        new Date(nextToday.getFullYear(), nextToday.getMonth(), 1)
      );
      setSelectedDateKey(nextTodayKey);
    }
  }

  function handleDaySelect(dateKey) {
    setSelectedDateKey(dateKey);

    const selectedDate = getDateFromKey(dateKey);
    setCurrentMonthDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    );

    const supportsSidePanel =
      typeof window !== "undefined" &&
      window.matchMedia(SIDE_PANEL_BREAKPOINT_QUERY).matches;

    if (!supportsSidePanel) {
      setMobileDayOpen(true);
    }
  }

  return (
    <div className="space-y-5">
      <CalendarHeader
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        currentMonthDate={currentMonthDate}
        onPrevious={handlePreviousMonth}
        onNext={handleNextMonth}
        onNewEvent={() => setNewEventOpen(true)}
      />

      {viewMode === "month" && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <CalendarMonthView
            currentMonthDate={currentMonthDate}
            todayKey={todayKey}
            selectedDateKey={selectedDateKey}
            eventsByDate={eventsByDate}
            onDaySelect={handleDaySelect}
          />

          <CalendarEventPanel
            selectedDateKey={selectedDateKey}
            events={selectedDayEvents}
            onEventClick={setSelectedEvent}
          />
        </div>
      )}

      {viewMode === "week" && (
        <PlaceholderView
          title="Weekly Schedule"
          description="The weekly schedule will use vertical Sunday–Saturday columns with time slots, built after the month view is stable."
          events={events.slice(0, 8)}
          onEventClick={setSelectedEvent}
        />
      )}

      {viewMode === "today" && (
        <PlaceholderView
          title="Today View"
          description="Today view will become the focused schedule, follow-up, deadline, and reminder command center."
          events={todaysEvents}
          onEventClick={setSelectedEvent}
        />
      )}

      <CalendarDayModal
        open={mobileDayOpen}
        selectedDateKey={selectedDateKey}
        events={selectedDayEvents}
        onClose={() => setMobileDayOpen(false)}
        onEventClick={(event) => {
          setMobileDayOpen(false);
          setSelectedEvent(event);
        }}
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