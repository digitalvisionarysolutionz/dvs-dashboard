"use client";

import Button from "../ui/Button.jsx";
import CalendarFilters from "./CalendarFilters.jsx";
import { formatMonthLabel } from "./calendarUtils.js";

function ArrowIcon({ direction = "left" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d={direction === "left" ? "M15 18 9 12l6-6" : "m9 18 6-6-6-6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CalendarHeader({
  viewMode,
  onViewModeChange,
  currentMonthDate,
  displayLabel,
  onPrevious,
  onNext,
  onNewEvent,
  calendarFilters,
  onCalendarFiltersChange,
  totalEventCount = 0,
  filteredEventCount = 0,
}) {
  const views = [
    { key: "month", label: "Month" },
    { key: "week", label: "Week" },
    { key: "today", label: "Today" },
  ];

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--app-border)] bg-[radial-gradient(circle_at_74%_16%,rgba(92,244,236,0.105),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.035),rgba(255,255,255,0.01))] p-4 shadow-[0_0_30px_rgba(92,244,236,0.055)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#5cf4ec]">
            Calendar
          </p>

          <div className="mt-2 h-[2px] w-28 rounded-full bg-gradient-to-r from-[#5cf4ec] via-[#5cf4ec]/60 to-transparent shadow-[0_0_16px_rgba(92,244,236,0.55)]" />

          <h1 className="mt-3 text-[28px] font-black leading-none tracking-[-0.04em] text-white sm:text-[34px]">
            Calendar & Meetings
          </h1>

          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-400">
            Track consultations, project deadlines, lead follow-ups, intake
            activity, and upcoming business reminders from one operational
            calendar.
          </p>
        </div>

        <Button
          type="button"
          onClick={onNewEvent}
          className="h-11 w-fit self-start px-5 text-sm xl:self-auto"
        >
          + New Event
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {views.map((view) => {
            const isActive = viewMode === view.key;

            return (
              <button
                key={view.key}
                type="button"
                onClick={() => onViewModeChange(view.key)}
                className={`min-h-9 rounded-[var(--radius-md)] border px-4 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec] ${
                  isActive
                    ? "border-[#5cf4ec]/45 bg-[#5cf4ec]/12 text-[#5cf4ec] shadow-[0_0_16px_rgba(92,244,236,0.13)]"
                    : "border-[var(--app-border)] bg-[#071018] text-slate-400 hover:border-[#5cf4ec]/35 hover:text-white"
                }`}
              >
                {view.label}
              </button>
            );
          })}

          <CalendarFilters
            selectedFilters={calendarFilters}
            onChange={onCalendarFiltersChange}
            totalEventCount={totalEventCount}
            filteredEventCount={filteredEventCount}
          />
        </div>

        <div className="flex items-center justify-between gap-2 rounded-[var(--radius-lg)] border border-[var(--app-border)] bg-[#071018] p-1.5 sm:w-fit">
          <button
            type="button"
            onClick={onPrevious}
            aria-label="Previous period"
            className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] border border-white/10 text-slate-300 transition hover:border-[#5cf4ec]/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec]"
          >
            <ArrowIcon />
          </button>

          <p className="min-w-[170px] text-center text-xs font-black uppercase tracking-[0.16em] text-white sm:text-sm">
            {displayLabel || formatMonthLabel(currentMonthDate)}
          </p>

          <button
            type="button"
            onClick={onNext}
            aria-label="Next period"
            className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] border border-white/10 text-slate-300 transition hover:border-[#5cf4ec]/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec]"
          >
            <ArrowIcon direction="right" />
          </button>
        </div>
      </div>
    </section>
  );
}