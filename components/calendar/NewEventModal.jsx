"use client";

import Button from "../ui/Button.jsx";
import DashboardModal from "../ui/DashboardModal.jsx";

export default function NewEventModal({ open, onClose }) {
  return (
    <DashboardModal
      open={open}
      eyebrow="New Event"
      title="Internal Event Creation"
      description="This calendar is currently reading existing project deadlines, lead follow-ups, and intake submissions. Manual event creation will be added after the event data model is finalized."
      onClose={onClose}
      maxWidth="max-w-2xl"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button type="button" disabled>
            Save Event Coming Soon
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          "Consultation",
          "Discovery Call",
          "Project Kickoff",
          "Photo / Video Session",
          "Lead Follow-Up",
          "Payment Reminder",
        ].map((item) => (
          <div
            key={item}
            className="rounded-[var(--radius-md)] border border-[var(--app-border)] bg-white/[0.035] p-4"
          >
            <p className="text-sm font-black text-white">{item}</p>
            <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
              Planned internal event type.
            </p>
          </div>
        ))}
      </div>
    </DashboardModal>
  );
}