"use client";

import Button from "../ui/Button.jsx";

export default function ClientsHeaderActions() {
  function openNewClientModal() {
    window.dispatchEvent(new CustomEvent("dvs-open-new-client"));
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
        onClick={openNewClientModal}
      >
        + New Client
      </Button>
    </>
  );
}