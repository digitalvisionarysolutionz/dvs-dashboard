"use client";

import DashboardModal from "../ui/DashboardModal.jsx";
import CalendarEventCard from "./CalendarEventCard.jsx";
import { formatLongDate } from "./calendarUtils.js";

export default function CalendarDayModal({
  open,
  selectedDateKey,
  events = [],
  onClose,
  onEventClick,
}) {
  return (
    <DashboardModal
      open={open}
      eyebrow="Calendar Day"
      title={formatLongDate(selectedDateKey)}
      description={
        events.length
          ? `${events.length} scheduled item${events.length === 1 ? "" : "s"}`
          : "No events are currently scheduled for this day."
      }
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
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
              This day is clear. New booking, deadline, and reminder logic will
              connect here in future phases.
            </p>
          </div>
        )}
      </div>
    </DashboardModal>
  );
}