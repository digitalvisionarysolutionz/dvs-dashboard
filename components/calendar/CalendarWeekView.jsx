"use client";

import { useMemo, useState } from "react";
import {
  formatEventTime,
  getWeekMatrix,
  splitAllDayAndTimedEvents,
  timeSlots,
} from "./calendarUtils.js";

const HOUR_HEIGHT = 52;
const DAY_START_HOUR = 7;
const DAY_END_HOUR = 19;
const TIMELINE_HEIGHT = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT;
const GRID_TEMPLATE_COLUMNS = "56px repeat(7, minmax(118px, 1fr))";

function getSourceStyles(sourceType = "") {
  if (sourceType === "lead") {
    return {
      block:
        "border-emerald-300/35 bg-emerald-400/14 text-emerald-50 shadow-[0_0_14px_rgba(74,222,128,0.08)]",
      label: "border-emerald-300/35 bg-emerald-400/12 text-emerald-100",
    };
  }

  if (sourceType === "intake") {
    return {
      block:
        "border-blue-300/35 bg-blue-400/14 text-blue-50 shadow-[0_0_14px_rgba(96,165,250,0.08)]",
      label: "border-blue-300/35 bg-blue-400/12 text-blue-100",
    };
  }

  if (sourceType === "project") {
    return {
      block:
        "border-yellow-300/35 bg-yellow-400/14 text-yellow-50 shadow-[0_0_14px_rgba(250,204,21,0.08)]",
      label: "border-yellow-300/35 bg-yellow-400/12 text-yellow-100",
    };
  }

  return {
    block:
      "border-[#5cf4ec]/35 bg-[#5cf4ec]/12 text-white shadow-[0_0_14px_rgba(92,244,236,0.08)]",
    label: "border-[#5cf4ec]/35 bg-[#5cf4ec]/10 text-[#5cf4ec]",
  };
}

function getCompactEventTitle(title = "") {
  const value = String(title || "Event").trim();
  return value || "Event";
}

function getEventStartDate(event) {
  if (!event?.startAt) {
    return null;
  }

  const date = new Date(event.startAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function getEventSlotHour(event) {
  const date = getEventStartDate(event);

  if (!date) {
    return DAY_START_HOUR;
  }

  return Math.max(
    DAY_START_HOUR,
    Math.min(date.getHours(), DAY_END_HOUR - 1)
  );
}

function getEventStackKey(event) {
  return `${getEventSlotHour(event)}:00`;
}

function groupTimedEventsByHourSlot(events = []) {
  const groups = new Map();

  events.forEach((event) => {
    const key = getEventStackKey(event);

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(event);
  });

  groups.forEach((group) => {
    group.sort((firstEvent, secondEvent) => {
      const firstDate = getEventStartDate(firstEvent);
      const secondDate = getEventStartDate(secondEvent);

      return (firstDate?.getTime() || 0) - (secondDate?.getTime() || 0);
    });
  });

  return Array.from(groups.values()).sort((firstGroup, secondGroup) => {
    return getEventSlotHour(firstGroup[0]) - getEventSlotHour(secondGroup[0]);
  });
}

function getEventStartDecimal(event) {
  const date = getEventStartDate(event);

  if (!date) {
    return DAY_START_HOUR;
  }

  return date.getHours() + date.getMinutes() / 60;
}

function getEventEndDecimal(event) {
  if (!event?.endAt) {
    return getEventStartDecimal(event) + 1;
  }

  const date = new Date(event.endAt);

  if (Number.isNaN(date.getTime())) {
    return getEventStartDecimal(event) + 1;
  }

  return date.getHours() + date.getMinutes() / 60;
}

function getTimedEventPosition(event) {
  const slotHour = getEventSlotHour(event);
  const rawEnd = getEventEndDecimal(event);
  const start = Math.max(DAY_START_HOUR, Math.min(slotHour, DAY_END_HOUR - 1));
  const end = Math.max(start + 0.75, Math.min(rawEnd, DAY_END_HOUR));

  return {
    top: (start - DAY_START_HOUR) * HOUR_HEIGHT + 5,
    height: Math.max(44, Math.min(76, (end - start) * HOUR_HEIGHT)),
  };
}

function AllDayEvent({ event, onClick }) {
  const styles = getSourceStyles(event.sourceType);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-6 w-full rounded-[6px] border px-2 text-left text-[10px] font-black leading-6 transition hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec] ${styles.label}`}
      title={getCompactEventTitle(event.title)}
    >
      <span className="block truncate">{getCompactEventTitle(event.title)}</span>
    </button>
  );
}

function TimedEventStack({ events = [], onEventClick }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeEvents = events.filter(Boolean);
  const activeEvent = safeEvents[activeIndex] || safeEvents[0];

  if (!activeEvent) {
    return null;
  }

  const styles = getSourceStyles(activeEvent.sourceType);
  const position = getTimedEventPosition(activeEvent);
  const hasMultipleEvents = safeEvents.length > 1;

  function handleNextStackedEvent(event) {
    event.stopPropagation();
    setActiveIndex((current) => (current + 1) % safeEvents.length);
  }

  return (
    <div
      className="absolute left-1.5 right-1.5"
      style={{
        top: `${position.top}px`,
        minHeight: `${position.height}px`,
      }}
    >
      {hasMultipleEvents && (
        <>
          <div className="absolute left-1.5 right-1.5 top-2 h-full rounded-[8px] border border-[#5cf4ec]/18 bg-[#5cf4ec]/6" />
          <div className="absolute left-3 right-3 top-4 h-full rounded-[8px] border border-[#5cf4ec]/12 bg-[#5cf4ec]/4" />
        </>
      )}

      <button
        type="button"
        onClick={() => onEventClick(activeEvent)}
        title={`${formatEventTime(activeEvent.startAt)} — ${getCompactEventTitle(
          activeEvent.title
        )}`}
        className={`relative z-10 w-full overflow-hidden rounded-[8px] border px-2 py-1.5 pr-8 text-left transition hover:z-20 hover:brightness-125 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec] ${styles.block}`}
        style={{ minHeight: `${position.height}px` }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[9px] font-black uppercase tracking-[0.08em] opacity-80">
              {formatEventTime(activeEvent.startAt)}
            </p>

            <p className="mt-0.5 truncate text-[11px] font-black leading-4 text-white">
              {getCompactEventTitle(activeEvent.title)}
            </p>

            <p className="truncate text-[10px] font-bold text-slate-300">
              {activeEvent.clientName || "No client"}
            </p>
          </div>

          {hasMultipleEvents && (
            <span className="shrink-0 rounded-full border border-[#5cf4ec]/30 bg-[#5cf4ec]/10 px-1.5 py-0.5 text-[9px] font-black text-[#5cf4ec]">
              {activeIndex + 1}/{safeEvents.length}
            </span>
          )}
        </div>
      </button>

      {hasMultipleEvents && (
        <button
          type="button"
          onClick={handleNextStackedEvent}
          className="absolute bottom-1.5 right-1.5 z-20 grid h-6 w-6 place-items-center rounded-full border border-[#5cf4ec]/45 bg-[#5cf4ec] text-[13px] font-black text-[#031012] shadow-[0_0_16px_rgba(92,244,236,0.25)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec]"
          aria-label="Show next stacked event"
          title="Show next stacked event"
        >
          ›
        </button>
      )}
    </div>
  );
}

function DayHeaderCell({ day, dayEvents, isToday, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`min-h-[58px] border-r border-white/10 px-3 py-2 text-left transition last:border-r-0 hover:bg-[#5cf4ec]/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec] ${
        isSelected ? "bg-[#5cf4ec]/[0.075]" : "bg-black/10"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-500">
            {day.dayName}
          </p>

          <div className="mt-1 flex items-center gap-2">
            <p
              className={`grid h-7 w-7 place-items-center rounded-full text-xs font-black ${
                isToday
                  ? "bg-[#5cf4ec] text-[#031012] shadow-[0_0_18px_rgba(92,244,236,0.48)]"
                  : "bg-white/[0.035] text-white"
              }`}
            >
              {day.dayNumber}
            </p>

            {isToday && (
              <span className="rounded-full bg-[#5cf4ec] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#031012]">
                Today
              </span>
            )}
          </div>
        </div>

        {dayEvents.length > 0 && (
          <span className="rounded-full bg-[#5cf4ec]/12 px-1.5 py-0.5 text-[10px] font-black text-[#5cf4ec]">
            {dayEvents.length}
          </span>
        )}
      </div>
    </button>
  );
}

function DesktopWeekGrid({
  weekDaysList,
  selectedDateKey,
  todayKey,
  eventsByDate,
  onDaySelect,
  onEventClick,
}) {
  return (
    <section className="hidden min-h-0 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--app-border)] bg-[#071018]/76 shadow-[0_0_28px_rgba(92,244,236,0.055)] lg:block">
      <div className="max-h-[calc(100dvh-305px)] min-h-[520px] overflow-auto [scrollbar-gutter:stable]">
        <div className="min-w-[890px]">
          <div
            className="sticky top-0 z-20 grid border-b border-white/10 bg-[#071018]/96 backdrop-blur-xl"
            style={{ gridTemplateColumns: GRID_TEMPLATE_COLUMNS }}
          >
            <div className="border-r border-white/10 bg-black/20" />

            {weekDaysList.map((day) => {
              const dayEvents = eventsByDate.get(day.dateKey) || [];

              return (
                <DayHeaderCell
                  key={day.dateKey}
                  day={day}
                  dayEvents={dayEvents}
                  isToday={day.dateKey === todayKey}
                  isSelected={day.dateKey === selectedDateKey}
                  onSelect={() => onDaySelect(day.dateKey)}
                />
              );
            })}
          </div>

          <div
            className="grid"
            style={{ gridTemplateColumns: GRID_TEMPLATE_COLUMNS }}
          >
            <div className="border-r border-white/10 bg-black/20">
              <div className="flex h-9 items-center px-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
                All Day
              </div>

              <div style={{ height: `${TIMELINE_HEIGHT}px` }}>
                {timeSlots.map((slot) => (
                  <div
                    key={slot.hour}
                    className="flex items-start border-t border-white/10 px-2 pt-2"
                    style={{ height: `${HOUR_HEIGHT}px` }}
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.08em] text-slate-500">
                      {slot.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {weekDaysList.map((day) => {
              const dayEvents = eventsByDate.get(day.dateKey) || [];
              const { allDay, timed } = splitAllDayAndTimedEvents(dayEvents);
              const timedStacks = groupTimedEventsByHourSlot(timed);
              const isSelected = day.dateKey === selectedDateKey;
              const isToday = day.dateKey === todayKey;

              return (
                <div
                  key={day.dateKey}
                  className={`border-r border-white/10 last:border-r-0 ${
                    isSelected || isToday
                      ? "bg-[#5cf4ec]/[0.04]"
                      : "bg-white/[0.012]"
                  }`}
                >
                  <div className="h-9 border-b border-white/10 px-1.5 py-1.5">
                    {allDay.length > 0 && (
                      <div className="flex flex-col gap-1">
                        {allDay.slice(0, 1).map((event) => (
                          <AllDayEvent
                            key={event.id}
                            event={event}
                            onClick={() => onEventClick(event)}
                          />
                        ))}

                        {allDay.length > 1 && (
                          <span className="text-center text-[9px] font-black uppercase tracking-[0.08em] text-[#5cf4ec]">
                            +{allDay.length - 1}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    className="relative"
                    style={{
                      height: `${TIMELINE_HEIGHT}px`,
                      backgroundImage:
                        "linear-gradient(to bottom, rgba(255,255,255,0.085) 1px, transparent 1px)",
                      backgroundSize: `100% ${HOUR_HEIGHT}px`,
                    }}
                  >
                    {timedStacks.map((stack) => (
                      <TimedEventStack
                        key={getEventStackKey(stack[0])}
                        events={stack}
                        onEventClick={onEventClick}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileDayPill({ day, isToday, isSelected, dayEvents, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`min-w-0 rounded-[var(--radius-md)] border px-1.5 py-2 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec] ${
        isSelected
          ? "border-[#5cf4ec]/55 bg-[#5cf4ec]/10"
          : "border-white/10 bg-white/[0.025]"
      }`}
    >
      <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-500">
        {day.dayName}
      </p>

      <p
        className={`mx-auto mt-1 grid h-7 w-7 place-items-center rounded-full text-[11px] font-black ${
          isToday
            ? "bg-[#5cf4ec] text-[#031012] shadow-[0_0_16px_rgba(92,244,236,0.42)]"
            : "bg-white/[0.035] text-white"
        }`}
      >
        {day.dayNumber}
      </p>

      <p className="mt-1 text-[9px] font-black text-slate-500">
        {dayEvents.length}
      </p>
    </button>
  );
}

function MobileAllDayEvent({ event, onClick }) {
  const styles = getSourceStyles(event.sourceType);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[8px] border px-3 py-2 text-left transition hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec] ${styles.label}`}
    >
      <p className="truncate text-xs font-black text-white">
        {getCompactEventTitle(event.title)}
      </p>
      <p className="mt-0.5 truncate text-[11px] font-bold text-slate-400">
        {event.clientName || "All day"}
      </p>
    </button>
  );
}

function MobileWeekTimeline({
  weekDaysList,
  selectedDateKey,
  todayKey,
  eventsByDate,
  onDaySelect,
  onEventClick,
}) {
  const selectedEvents = eventsByDate.get(selectedDateKey) || [];
  const { allDay, timed } = splitAllDayAndTimedEvents(selectedEvents);
  const timedStacks = useMemo(() => groupTimedEventsByHourSlot(timed), [timed]);

  return (
    <section className="space-y-3 lg:hidden">
      <div className="grid grid-cols-7 gap-1">
        {weekDaysList.map((day) => {
          const dayEvents = eventsByDate.get(day.dateKey) || [];

          return (
            <MobileDayPill
              key={day.dateKey}
              day={day}
              isToday={day.dateKey === todayKey}
              isSelected={day.dateKey === selectedDateKey}
              dayEvents={dayEvents}
              onSelect={() => onDaySelect(day.dateKey)}
            />
          );
        })}
      </div>

      <div className="max-h-[calc(100dvh-350px)] min-h-[420px] overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--app-border)] bg-[#071018]/76">
        {allDay.length > 0 && (
          <div className="border-b border-white/10 p-3">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
              All Day
            </p>

            <div className="space-y-2">
              {allDay.map((event) => (
                <MobileAllDayEvent
                  key={event.id}
                  event={event}
                  onClick={() => onEventClick(event)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-[58px_minmax(0,1fr)]">
          <div className="border-r border-white/10 bg-black/20">
            {timeSlots.map((slot) => (
              <div
                key={slot.hour}
                className="border-t border-white/10 px-2 pt-2"
                style={{ height: `${HOUR_HEIGHT}px` }}
              >
                <span className="text-[10px] font-black uppercase tracking-[0.08em] text-slate-500">
                  {slot.label}
                </span>
              </div>
            ))}
          </div>

          <div
            className="relative"
            style={{
              height: `${TIMELINE_HEIGHT}px`,
              backgroundImage:
                "linear-gradient(to bottom, rgba(255,255,255,0.085) 1px, transparent 1px)",
              backgroundSize: `100% ${HOUR_HEIGHT}px`,
            }}
          >
            {timedStacks.length > 0 ? (
              timedStacks.map((stack) => (
                <TimedEventStack
                  key={getEventStackKey(stack[0])}
                  events={stack}
                  onEventClick={onEventClick}
                />
              ))
            ) : (
              <div className="p-4">
                <p className="text-sm font-black text-white">No timed events.</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Timed meetings and scheduled reminders will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CalendarWeekView({
  currentWeekDate,
  todayKey,
  selectedDateKey,
  eventsByDate,
  onDaySelect,
  onEventClick,
}) {
  const weekDaysList = getWeekMatrix(currentWeekDate);

  return (
    <section className="min-h-0">
      <MobileWeekTimeline
        weekDaysList={weekDaysList}
        selectedDateKey={selectedDateKey}
        todayKey={todayKey}
        eventsByDate={eventsByDate}
        onDaySelect={onDaySelect}
        onEventClick={onEventClick}
      />

      <DesktopWeekGrid
        weekDaysList={weekDaysList}
        selectedDateKey={selectedDateKey}
        todayKey={todayKey}
        eventsByDate={eventsByDate}
        onDaySelect={onDaySelect}
        onEventClick={onEventClick}
      />
    </section>
  );
}