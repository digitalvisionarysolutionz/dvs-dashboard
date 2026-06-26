"use client";

export default function ProjectsHeaderActions() {
  function openNewProjectModal() {
    window.dispatchEvent(new CustomEvent("dvs-open-new-project"));
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <button
        type="button"
        className="h-10 w-fit whitespace-nowrap rounded-[var(--radius-md)] border border-[var(--app-border)] bg-[#071018] px-4 text-sm font-black text-[var(--app-text)] transition hover:border-[var(--app-border-strong)] hover:text-white"
      >
        Export
      </button>

      <button
        type="button"
        onClick={openNewProjectModal}
        className="h-10 w-fit whitespace-nowrap rounded-[var(--radius-md)] bg-[var(--app-accent)] px-4 text-sm font-black text-[#031012] shadow-[0_0_24px_rgba(92,244,236,0.18)] transition hover:brightness-110"
      >
        + New Project
      </button>
    </div>
  );
}