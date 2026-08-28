"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export const CALENDAR_FILTER_OPTIONS = [
  {
    id: "meetings",
    label: "Meetings",
    dotClass: "bg-[#5cf4ec]",
  },
  {
    id: "deadlines",
    label: "Deadlines",
    dotClass: "bg-yellow-300",
  },
  {
    id: "follow_ups",
    label: "Follow-ups",
    dotClass: "bg-violet-300",
  },
  {
    id: "photography",
    label: "Photography",
    dotClass: "bg-sky-300",
  },
  {
    id: "reminders",
    label: "Reminders",
    dotClass: "bg-emerald-300",
  },
  {
    id: "birthdays",
    label: "Birthdays",
    dotClass: "bg-pink-300",
  },
];

export const ALL_CALENDAR_FILTER_IDS = CALENDAR_FILTER_OPTIONS.map(
  (option) => option.id
);

function CheckIcon({ checked }) {
  return (
    <span
      className={`grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border transition ${
        checked
          ? "border-[#5cf4ec] bg-[#5cf4ec] text-[#031012]"
          : "border-white/15 bg-white/[0.035] text-transparent"
      }`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none">
        <path
          d="m5 10 3 3 7-7"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function FilterOption({ label, checked, onChange, dotClass }) {
  return (
    <label className="flex min-h-10 cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-xs font-black text-slate-300 transition hover:bg-white/[0.06] hover:text-white">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />

      <CheckIcon checked={checked} />

      {dotClass && (
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full shadow-[0_0_12px_currentColor] ${dotClass}`}
          aria-hidden="true"
        />
      )}

      <span>{label}</span>
    </label>
  );
}

export default function CalendarFilters({
  selectedFilters = ALL_CALENDAR_FILTER_IDS,
  onChange,
  totalEventCount = 0,
  filteredEventCount = 0,
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedSet = useMemo(
    () => new Set(selectedFilters),
    [selectedFilters]
  );

  const allSelected =
    CALENDAR_FILTER_OPTIONS.length > 0 &&
    CALENDAR_FILTER_OPTIONS.every((option) => selectedSet.has(option.id));

  const buttonLabel = allSelected
    ? "All Types"
    : selectedFilters.length === 0
      ? "No Types"
      : selectedFilters.length === 1
        ? CALENDAR_FILTER_OPTIONS.find(
            (option) => option.id === selectedFilters[0]
          )?.label || "1 Type"
        : `${selectedFilters.length} Types`;

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (wrapperRef.current?.contains(event.target)) {
        return;
      }

      setOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function updateFilters(nextFilters) {
    onChange?.(nextFilters);
  }

  function handleShowAll() {
    updateFilters(ALL_CALENDAR_FILTER_IDS);
  }

  function handleOptionChange(optionId, checked) {
    if (checked) {
      updateFilters(
        Array.from(new Set([...selectedFilters, optionId])).filter(Boolean)
      );
      return;
    }

    updateFilters(selectedFilters.filter((filterId) => filterId !== optionId));
  }

  return (
    <div ref={wrapperRef} className="relative z-30">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex min-h-9 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--app-border)] bg-[#071018] px-4 text-sm font-black text-slate-300 transition hover:border-[#5cf4ec]/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec]"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <path
            d="M4 6h16M7 12h10M10 18h4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        <span>{buttonLabel}</span>

        <span className="rounded-full bg-[#5cf4ec]/12 px-1.5 py-0.5 text-[10px] font-black text-[#5cf4ec]">
          {filteredEventCount}/{totalEventCount}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] w-[280px] rounded-[var(--radius-lg)] border border-white/10 bg-[#071018]/98 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.78),0_0_24px_rgba(92,244,236,0.08)] backdrop-blur-xl sm:left-auto sm:right-0">
          <div className="border-b border-white/10 px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#5cf4ec]">
              Calendar Filters
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Show or hide calendar event types.
            </p>
          </div>

          <div className="mt-2 space-y-1">
            <FilterOption
              label="Show All"
              checked={allSelected}
              onChange={handleShowAll}
            />

            <div className="my-1 h-px bg-white/10" />

            {CALENDAR_FILTER_OPTIONS.map((option) => (
              <FilterOption
                key={option.id}
                label={option.label}
                dotClass={option.dotClass}
                checked={selectedSet.has(option.id)}
                onChange={(event) =>
                  handleOptionChange(option.id, event.target.checked)
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}