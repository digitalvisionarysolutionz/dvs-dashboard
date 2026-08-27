"use client";

import { getMonthMatrix, weekDays } from "./calendarUtils.js";

function handleKeyboardSelect(event, callback) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    callback();
  }
}

function getSourceDotClass(sourceType = "") {
  if (sourceType === "lead") return "bg-emerald-300";
  if (sourceType === "intake") return "bg-blue-300";
  if (sourceType === "project") return "bg-yellow-300";
  return "bg-[#5cf4ec]";
}

function MonthEventLabel({ event }) {
  if (!event) return null;

  return (
    <div className="flex min-w-0 items-center gap-1 rounded-[5px] px-1 py-0.5 text-[9px] font-bold text-slate-300 sm:text-[10px]">
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${getSourceDotClass(
          event.sourceType
        )}`}
      />
      <span className="truncate">{event.title}</span>
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
    <section className="min-h-0 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--app-border)] bg-[#071018]/72 shadow-[0_0_28px_rgba(92,244,236,0.055)]">
      <div className="grid grid-cols-7 border-b border-white/10">
        {weekDays.map((day) => (
          <p
            key={day}
            className="h-7 border-r border-white/10 px-1 text-center text-[9px] font-black uppercase leading-7 tracking-[0.14em] text-slate-500 last:border-r-0 sm:h-8 sm:text-[11px] sm:leading-8 sm:tracking-[0.18em]"
          >
            {day}
          </p>
        ))}
      </div>

      <div className="grid h-[calc(100dvh-330px)] min-h-[430px] grid-cols-7 grid-rows-6 sm:h-[calc(100dvh-315px)] sm:min-h-[500px]">
        {days.map((day) => {
          const dayEvents = eventsByDate.get(day.dateKey) || [];
          const visibleEvent = dayEvents[0] || null;
          const isToday = day.dateKey === todayKey;
          const isSelected = day.dateKey === selectedDateKey;

          return (
            <button
              key={day.dateKey}
              type="button"
              onClick={() => onDaySelect(day.dateKey)}
              onKeyDown={(event) =>
                handleKeyboardSelect(event, () => onDaySelect(day.dateKey))
              }
              className={`min-h-0 border-r border-t border-white/10 p-1 text-left transition last:border-r-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec] sm:p-2 ${
                isSelected
                  ? "bg-[#5cf4ec]/[0.08]"
                  : "bg-transparent hover:bg-[#5cf4ec]/[0.035]"
              } ${day.isCurrentMonth ? "" : "opacity-45"}`}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-black sm:h-6 sm:w-6 sm:text-xs ${
                    isToday
                      ? "bg-[#5cf4ec] text-[#031012] shadow-[0_0_16px_rgba(92,244,236,0.42)]"
                      : "text-slate-300"
                  }`}
                >
                  {day.dayNumber}
                </span>

                {dayEvents.length > 0 && (
                  <span className="rounded-full bg-[#5cf4ec]/12 px-1.5 py-0.5 text-[9px] font-black text-[#5cf4ec] sm:text-[10px]">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              {dayEvents.length > 0 && (
                <div className="mt-1 hidden sm:block">
                  {dayEvents.length === 1 ? (
                    <MonthEventLabel event={visibleEvent} />
                  ) : (
                    <p className="rounded-[5px] border border-[#5cf4ec]/25 bg-[#5cf4ec]/10 px-1.5 py-0.5 text-center text-[9px] font-black uppercase tracking-[0.08em] text-[#5cf4ec]">
                      {dayEvents.length} events
                    </p>
                  )}
                </div>
              )}

              {dayEvents.length > 0 && (
                <div className="mt-1 block sm:hidden">
                  <span className="block h-1.5 w-1.5 rounded-full bg-[#5cf4ec]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}