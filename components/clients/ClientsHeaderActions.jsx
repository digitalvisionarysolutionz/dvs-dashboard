"use client";

import Button from "../ui/Button.jsx";

export default function ClientsHeaderActions() {
  function openNewClientModal() {
    window.dispatchEvent(new CustomEvent("dvs-open-new-client"));
  }

  return (
    <>
      <Button variant="secondary" className="whitespace-nowrap">
        Export
      </Button>

      <Button
        type="button"
        className="whitespace-nowrap"
        onClick={openNewClientModal}
      >
        + New Client
      </Button>
    </>
  );
}