"use client";

import CalendarEventCard from "./CalendarEventCard.jsx";
import { formatLongDate } from "./calendarUtils.js";

export default function CalendarEventPanel({
  selectedDateKey,
  events = [],
  onEventClick,
}) {
  return (
    <aside className="hidden min-h-[620px] xl:block">
      <div className="sticky top-24 rounded-[var(--radius-xl)] border border-[var(--app-border)] bg-[#071018]/88 p-4 shadow-[0_0_34px_rgba(92,244,236,0.08)]">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#5cf4ec]">
          Selected Day
        </p>

        <h2 className="mt-2 text-xl font-black text-white">
          {formatLongDate(selectedDateKey)}
        </h2>

        <p className="mt-2 text-sm font-semibold text-slate-400">
          {events.length === 1
            ? "1 event scheduled"
            : `${events.length} events scheduled`}
        </p>

        <div className="mt-5 space-y-3">
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
                internal events will appear here as the calendar evolves.
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}