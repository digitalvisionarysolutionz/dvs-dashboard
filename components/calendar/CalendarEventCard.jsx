"use client";

import {
  formatEventTime,
  getEventTypeClasses,
  getPriorityClasses,
} from "./calendarUtils.js";

function EventIcon({ sourceType }) {
  if (sourceType === "project") {
    return (
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-[#5cf4ec]/25 bg-[#5cf4ec]/10 text-[#5cf4ec]">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <path
            d="M8 6h10M8 12h10M8 18h7M4 6h.01M4 12h.01M4 18h.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }

  if (sourceType === "lead") {
    return (
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-violet-300/25 bg-violet-400/10 text-violet-100">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <path
            d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  if (sourceType === "intake") {
    return (
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-blue-300/25 bg-blue-400/10 text-blue-100">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <path
            d="M9 2h6l1 2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3l1-2ZM9 12h6M9 16h4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-white/10 bg-white/[0.035] text-slate-300">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <path
          d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function CalendarEventCard({ event, onClick }) {
  if (!event) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-[var(--radius-md)] border border-[var(--app-border)] bg-white/[0.035] p-3 text-left transition hover:border-[#5cf4ec]/40 hover:bg-[#5cf4ec]/[0.055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec]"
    >
      <div className="flex items-start gap-3">
        <EventIcon sourceType={event.sourceType} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-[var(--radius-pill)] border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] ${getEventTypeClasses(
                event.sourceType
              )}`}
            >
              {event.eventType}
            </span>

            <span
              className={`rounded-[var(--radius-pill)] border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] ${getPriorityClasses(
                event.priority
              )}`}
            >
              {event.priority}
            </span>
          </div>

          <h3 className="mt-2 truncate text-sm font-black text-white">
            {event.title}
          </h3>

          <p className="mt-1 truncate text-xs font-semibold text-slate-400">
            {event.clientName}
          </p>

          <p className="mt-2 text-xs font-bold text-slate-500">
            {formatEventTime(event.startAt)}
          </p>

          {event.description && (
            <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-slate-400">
              {event.description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}