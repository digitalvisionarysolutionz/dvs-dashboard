"use client";

import Button from "../ui/Button.jsx";

export default function CRMHeaderActions() {
  function openNewLeadModal() {
    window.dispatchEvent(new CustomEvent("dvs-open-new-lead"));
  }

  return (
    <Button
      type="button"
      className="whitespace-nowrap"
      onClick={openNewLeadModal}
    >
      + New Lead
    </Button>
  );
}