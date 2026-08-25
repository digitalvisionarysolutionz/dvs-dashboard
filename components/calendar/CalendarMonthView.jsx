"use client";

import { getMonthMatrix, weekDays } from "./calendarUtils.js";

function handleKeyboardSelect(event, callback) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    callback();
  }
}

function EventSummary({ count }) {
  if (!count) {
    return null;
  }

  return (
    <div className="mt-auto rounded-[var(--radius-sm)] border border-[#5cf4ec]/25 bg-[#5cf4ec]/10 px-2 py-1 text-center text-[11px] font-black uppercase tracking-[0.08em] text-[#5cf4ec]">
      {count === 1 ? "1 event" : `${count} events`}
    </div>
  );
}

export default function CalendarMonthView({
  currentMonthDate,
  todayKey,
  selectedDateKey,
  eventsByDate,
  onDaySelect,
}) {
  const days = getMonthMatrix(currentMonthDate);

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--app-border)] bg-[#071018]/72 p-3 shadow-[0_0_30px_rgba(92,244,236,0.06)] sm:p-4">
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-7 border-b border-white/10 pb-2">
            {weekDays.map((day) => (
              <p
                key={day}
                className="px-1 text-center text-xs font-black uppercase tracking-[0.18em] text-slate-500"
              >
                {day}
              </p>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-7 gap-2">
            {days.map((day) => {
              const dayEvents = eventsByDate.get(day.dateKey) || [];
              const isToday = day.dateKey === todayKey;
              const isSelected = day.dateKey === selectedDateKey;

              return (
                <div
                  key={day.dateKey}
                  role="button"
                  tabIndex={0}
                  onClick={() => onDaySelect(day.dateKey)}
                  onKeyDown={(event) =>
                    handleKeyboardSelect(event, () => onDaySelect(day.dateKey))
                  }
                  className={`flex h-[128px] flex-col rounded-[var(--radius-md)] border p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec] ${
                    isSelected
                      ? "border-[#5cf4ec]/55 bg-[#5cf4ec]/10 shadow-[0_0_20px_rgba(92,244,236,0.12)]"
                      : "border-white/10 bg-white/[0.025] hover:border-[#5cf4ec]/30 hover:bg-white/[0.045]"
                  } ${day.isCurrentMonth ? "" : "opacity-45"}`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-full text-sm font-black ${
                        isToday
                          ? "bg-[#5cf4ec] text-[#031012] shadow-[0_0_18px_rgba(92,244,236,0.45)]"
                          : "text-slate-300"
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="rounded-full bg-[#5cf4ec]/12 px-2 py-0.5 text-[11px] font-black text-[#5cf4ec]">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <EventSummary count={dayEvents.length} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs font-semibold text-slate-500 md:hidden">
        Swipe sideways to view the full month grid.
      </p>
    </section>
  );
}