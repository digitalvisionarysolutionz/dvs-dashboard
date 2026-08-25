"use client";

import Button from "../ui/Button.jsx";
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
  onPrevious,
  onNext,
  onNewEvent,
}) {
  const views = [
    { key: "month", label: "Month" },
    { key: "week", label: "Week" },
    { key: "today", label: "Today" },
  ];

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--app-border)] bg-[radial-gradient(circle_at_72%_20%,rgba(92,244,236,0.12),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-4 shadow-[0_0_38px_rgba(92,244,236,0.07)] sm:p-5 lg:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#5cf4ec]">
            Calendar
          </p>

          <div className="mt-3 h-[2px] w-32 rounded-full bg-gradient-to-r from-[#5cf4ec] via-[#5cf4ec]/65 to-transparent shadow-[0_0_18px_rgba(92,244,236,0.65)]" />

          <h1 className="mt-5 text-[34px] font-black leading-[0.98] tracking-[-0.04em] text-white sm:text-[42px] lg:text-[52px]">
            Calendar & Meetings
          </h1>

          <p className="mt-4 max-w-3xl text-sm font-semibold leading-6 text-slate-400 sm:text-base">
            Track consultations, project deadlines, lead follow-ups, intake
            activity, and upcoming business reminders from one operational
            calendar.
          </p>
        </div>

        <Button
          type="button"
          onClick={onNewEvent}
          size="lg"
          className="w-fit self-start lg:self-auto"
        >
          + New Event
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {views.map((view) => {
            const isActive = viewMode === view.key;

            return (
              <button
                key={view.key}
                type="button"
                onClick={() => onViewModeChange(view.key)}
                className={`min-h-10 rounded-[var(--radius-md)] border px-4 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec] ${
                  isActive
                    ? "border-[#5cf4ec]/45 bg-[#5cf4ec]/12 text-[#5cf4ec] shadow-[0_0_18px_rgba(92,244,236,0.14)]"
                    : "border-[var(--app-border)] bg-[#071018] text-slate-400 hover:border-[#5cf4ec]/35 hover:text-white"
                }`}
              >
                {view.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--app-border)] bg-[#071018] p-2 sm:w-fit">
          <button
            type="button"
            onClick={onPrevious}
            aria-label="Previous month"
            className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] border border-white/10 text-slate-300 transition hover:border-[#5cf4ec]/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec]"
          >
            <ArrowIcon />
          </button>

          <p className="min-w-[180px] text-center text-sm font-black uppercase tracking-[0.16em] text-white">
            {formatMonthLabel(currentMonthDate)}
          </p>

          <button
            type="button"
            onClick={onNext}
            aria-label="Next month"
            className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] border border-white/10 text-slate-300 transition hover:border-[#5cf4ec]/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec]"
          >
            <ArrowIcon direction="right" />
          </button>
        </div>
      </div>
    </section>
  );
}