"use client";

import Button from "../ui/Button.jsx";

export default function ProjectsHeaderActions() {
  function openNewProjectModal() {
    window.dispatchEvent(new CustomEvent("dvs-open-new-project"));
  }

  return (
    <>
      <Button type="button" variant="secondary" size="sm" className="whitespace-nowrap">
        Export
      </Button>

      <Button
        type="button"
        size="sm"
        className="whitespace-nowrap"
        onClick={openNewProjectModal}
      >
        + New Project
      </Button>
    </>
  );
}